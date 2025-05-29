const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../services/jwtService');
const { isValidEmail, isValidPassword } = require('../utils/validators');
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(403).json({ message: 'Token não fornecido.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(403).json({ message: 'Token inválido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'segredo123');
    req.user = decoded; // Adiciona os dados do utilizador à requisição
    next();
  } catch (error) {
    console.error('Erro ao verificar o token:', error);
    return res.status(403).json({ message: 'Token inválido ou expirado.' });
  }
}

// Registo de utilizador
async function register(req, res) {
  const { username, password, email } = req.body;
  if (!isValidEmail(email) || !isValidPassword(password)) {
    return res.status(400).json({ message: 'Email ou password inválidos.' });
  }
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username já existe.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, email });
    await user.save();
    res.status(201).json({ message: 'Utilizador registado com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao registar utilizador.' });
  }
}

// Login de utilizador
async function login(req, res) {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        username: user.username // opcional, se for útil
      },
      process.env.JWT_SECRET || 'segredo123',
      { expiresIn: '1h' }
    );
    res.json({
      token,
      id: user._id,
      role: user.role,
      hasMfa: user.mfa && user.mfa.enabled // true se já tem MFA ativo
    });
  } catch (err) {
    console.error('Erro na autenticação:', err);
    res.status(500).json({ message: 'Erro na autenticação.' });
  }
}

// Criar técnico (apenas admin)
async function createTechnician(req, res) {
    const { username, password, email } = req.body;
    if (!isValidEmail(email) || !isValidPassword(password)) {
        return res.status(400).json({ message: 'Email ou password inválidos.' });
    }
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: 'Username já existe.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword, email, role: 'tecnico' });
        await user.save();
        res.status(201).json({ message: 'Técnico criado com sucesso.' });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao criar técnico.' });
    }
}

// Criar cliente ou outro utilizador
async function createUser(req, res) {
    const { username, password, email, role } = req.body;
    if (!role) {
        return res.status(400).json({ message: 'O campo role é obrigatório.' });
    }
    if (!isValidEmail(email) || !isValidPassword(password)) {
        return res.status(400).json({ message: 'Email ou password inválidos.' });
    }
    if (role === 'admin' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Apenas um admin pode criar outro admin.' });
    }
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: 'Username já existe.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword, email, role: role || 'cliente' });
        await user.save();
        res.status(201).json({ message: 'Utilizador criado com sucesso.' });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao criar utilizador.' });
    }
}

// Criar gestor de operações (apenas admin)
async function createGestor(req, res) {
    const { username, password, email } = req.body;
    if (!isValidEmail(email) || !isValidPassword(password)) {
        return res.status(400).json({ message: 'Email ou password inválidos.' });
    }
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: 'Username já existe.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword, email, role: 'gestor' });
        await user.save();
        res.status(201).json({ message: 'Gestor criado com sucesso.' });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao criar gestor.' });
    }
}

// Remover utilizador (apenas admin)
async function deleteUser(req, res) {
    const { id } = req.params;
    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'Utilizador não encontrado.' });
        }
        res.json({ message: 'Utilizador removido com sucesso.' });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao remover utilizador.' });
    }
}

// Reset à própria password
async function resetOwnPassword(req, res) {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilizador não encontrado.' });

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return res.status(401).json({ message: 'Password atual incorreta.' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password alterada com sucesso.' });
}

// Admin faz reset à password de qualquer utilizador
async function adminResetPassword(req, res) {
    const { id } = req.params;
    const { newPassword } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'Utilizador não encontrado.' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password do utilizador alterada com sucesso.' });
}

// Criar cliente (qualquer pessoa pode criar conta de cliente)
async function registerClient(req, res) {
  const { username, password, email } = req.body;
  if (!isValidEmail(email) || !isValidPassword(password)) {
    return res.status(400).json({ message: 'Email ou password inválidos.' });
  }
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username já existe.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, email, role: 'cliente' });
    await user.save();
    res.status(201).json({ message: 'Cliente registado com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao registar cliente.' });
  }
}

// Criar qualquer utilizador (apenas admin)
async function adminCreateUser(req, res) {
  const { username, password, email, role } = req.body;
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Apenas administradores podem criar utilizadores com qualquer role.' });
  }
  if (!role) {
    return res.status(400).json({ message: 'O campo role é obrigatório.' });
  }
  if (!isValidEmail(email) || !isValidPassword(password)) {
    return res.status(400).json({ message: 'Email ou password inválidos.' });
  }
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username já existe.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, email, role });
    await user.save();
    res.status(201).json({ message: 'Utilizador criado com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar utilizador.' });
  }
}

async function loginUser(username, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();

  if (res.ok && data.token) {
    sessionStorage.setItem('token', data.token); // Armazena o token no sessionStorage
    if (data.hasMfa) {
      window.location.href = 'mfa.html?mode=verify'; // Redireciona para MFA
    } else {
      window.location.href = '../dashboard-cliente/cliente-dashboard.html'; // Redireciona para o dashboard
    }
  } else {
    loginMessage.textContent = data.message || 'Erro no login';
  }
}

module.exports = {
  register,
  login,
  createTechnician,
  createUser,
  createGestor,
  deleteUser,
  resetOwnPassword,
  adminResetPassword,
  registerClient,
  adminCreateUser,
  authMiddleware,
  loginUser
};