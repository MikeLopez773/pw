const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middleware/authMiddleware');
const { onlyAdmin } = require('../middleware/roleMiddleware');
const { createTechnician, createUser, deleteUser, createGestor, resetOwnPassword, adminResetPassword, registerClient, adminCreateUser } = require('../controllers/authController');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { verifyMfaCode } = require('../services/mfaService');
const router = express.Router();

// Rota de login (SEM autenticação)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('🔍 Tentativa de login:', { 
      username, 
      password: password ? `${password.slice(0, 3)}***` : 'undefined',
      body: req.body 
    });
    
    // Verificar se os campos foram fornecidos
    if (!username || !password) {
      console.log('❌ Campos obrigatórios em falta');
      return res.status(400).json({ message: 'Username e password são obrigatórios' });
    }

    // Buscar usuário
    const user = await User.findOne({ username });
    console.log('👤 Usuário encontrado:', user ? {
      id: user._id,
      username: user.username,
      role: user.role,
      hasPassword: !!user.password
    } : 'NÃO ENCONTRADO');
    
    if (!user) {
      console.log('❌ Usuário não encontrado na base de dados');
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Verificar password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔐 Password match:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Password incorreta');
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Marcar como logado
    user.isLoggedIn = true;
    await user.save();

    // Gerar token COM o prefixo Bearer
    const tokenPayload = { 
      id: user._id, 
      username: user.username, 
      role: user.role 
    };
    
    const jwtToken = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'segredo123',
      { expiresIn: '24h' }
    );

    // Adicionar o prefixo Bearer ao token
    const token = `Bearer ${jwtToken}`;

    console.log('✅ Login bem-sucedido:', tokenPayload);

    res.json({ 
      message: 'Login realizado com sucesso',
      token, // Token já com Bearer
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('💥 Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota de registo (SEM autenticação)
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    if (!username || !password || !email) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Usuário ou email já existe' });
    }

    // Hash da password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: 'cliente' // Role padrão
    });

    await user.save();

    res.status(201).json({ 
      message: 'Conta criada com sucesso',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Erro no registo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota de verificação MFA (SEM autenticação inicial)
router.post('/verify-mfa', async (req, res) => {
  const { userId, code } = req.body;

  try {
    const isValid = await verifyMfaCode(userId, code);
    if (isValid) {
      const user = await User.findById(userId);
      const jwtToken = jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'segredo123',
        { expiresIn: '24h' }
      );
      const token = `Bearer ${jwtToken}`;
      return res.status(200).json({ success: true, message: 'Código MFA válido!', token });
    } else {
      return res.status(400).json({ success: false, message: 'Código MFA inválido!' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
  }
});

// DAQUI PARA BAIXO: Rotas COM autenticação
router.get('/setup-mfa', auth, async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({ length: 20 });
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }

    user.mfa = { enabled: true, secret: secret.base32 };
    await user.save();

    const qrCodeUrl = speakeasy.otpauthURL({
      secret: secret.ascii,
      label: `App (${user.username})`,
      encoding: 'ascii',
    });

    QRCode.toDataURL(qrCodeUrl, (err, dataUrl) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Erro ao gerar QR Code.' });
      }
      res.status(200).json({ success: true, qrCode: dataUrl });
    });
  } catch (error) {
    console.error('Erro ao configurar MFA:', error);
    res.status(500).json({ success: false, message: 'Erro ao configurar MFA.' });
  }
});

router.get('/check-mfa', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }

    if (user.mfa && user.mfa.enabled) {
      return res.status(200).json({ success: true, mfaEnabled: true });
    } else {
      return res.status(200).json({ success: true, mfaEnabled: false });
    }
  } catch (error) {
    console.error('Erro ao verificar MFA:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.post('/users/:id/reset-mfa', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilizador não encontrado.' });
    }

    user.mfa = { enabled: false, secret: null };
    await user.save();

    res.status(200).json({ success: true, message: 'MFA resetado com sucesso.' });
  } catch (error) {
    console.error('Erro ao resetar MFA:', error);
    res.status(500).json({ success: false, message: 'Erro ao resetar MFA.' });
  }
});

// Rota para obter todos os usuários (COM autenticação)
router.get('/users', auth, async (req, res) => {
  try {
    console.log('📋 Listando usuários para:', req.user.username, '- Role:', req.user.role);
    
    let users;
    if (req.user.role === 'tecnico') {
      // Técnicos só veem clientes
      users = await User.find({ role: 'cliente' })
        .select('-password')
        .sort({ username: 1 });
    } else {
      // Admin e gestor veem todos
      users = await User.find({})
        .select('-password')
        .sort({ createdAt: -1 });
    }

    console.log('👥 Total de usuários retornados:', users.length);

    return res.json({ 
      users,
      total: users.length
    });
  } catch (err) {
    console.error('❌ Erro ao listar usuários:', err);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar a rota de pesquisa para técnicos:
router.get('/user/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Query de pesquisa é obrigatória' });
    }

    let user;
    let searchQuery = {};

    // Se for técnico, só pesquisar entre clientes
    if (req.user.role === 'tecnico') {
      searchQuery.role = 'cliente';
    }

    if (q.match(/^[0-9a-fA-F]{24}$/)) {
      // Pesquisa por ID
      user = await User.findOne({ 
        _id: q,
        ...searchQuery 
      }).select('-password');
    } else {
      // Pesquisa por username
      user = await User.findOne({ 
        username: { $regex: new RegExp(q, 'i') },
        ...searchQuery
      }).select('-password');
    }

    if (user) {
      res.json({ 
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } else {
      const userType = req.user.role === 'tecnico' ? 'cliente' : 'utilizador';
      res.status(404).json({ message: `${userType} não encontrado` });
    }
  } catch (error) {
    console.error('Erro na pesquisa de usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ADICIONAR esta nova rota específica para técnicos:
router.get('/clients', auth, async (req, res) => {
  try {
    console.log('👥 Listando clientes para técnico:', req.user.username);
    
    // Verificar se o usuário é técnico
    if (req.user.role !== 'tecnico') {
      return res.status(403).json({ message: 'Acesso negado. Apenas técnicos podem acessar esta rota.' });
    }

    // Buscar APENAS clientes
    const clients = await User.find({ role: 'cliente' })
      .select('-password') // Não retornar passwords
      .sort({ username: 1 }); // Ordenar por nome

    console.log('👥 Total de clientes encontrados:', clients.length);

    return res.json({ 
      users: clients,
      total: clients.length,
      message: `${clients.length} clientes encontrados`
    });
  } catch (err) {
    console.error('❌ Erro ao listar clientes:', err);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Adicionar esta rota:
router.get('/clients-for-gestor', auth, async (req, res) => {
  try {
    console.log('👥 Listando clientes para gestor:', req.user.username);
    
    if (req.user.role !== 'gestor') {
      return res.status(403).json({ message: 'Acesso negado. Apenas gestores.' });
    }

    const clients = await User.find({ role: 'cliente' })
      .select('-password')
      .sort({ username: 1 });

    return res.json({ 
      users: clients,
      total: clients.length
    });
  } catch (err) {
    console.error('❌ Erro ao listar clientes:', err);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Outras rotas com autenticação
router.post('/create-technician', auth, onlyAdmin, createTechnician);
router.post('/create-user', auth, onlyAdmin, createUser);
router.post('/create-gestor', auth, onlyAdmin, createGestor);
router.delete('/user/:id', auth, onlyAdmin, deleteUser);
router.post('/reset-password', auth, resetOwnPassword);
router.post('/admin-reset-password/:id', auth, onlyAdmin, adminResetPassword);

// Endpoint para estatísticas do admin
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isLoggedIn: true }); // <-- Só logados
    const totalClientes = await User.countDocuments({ role: 'cliente' });
    const totalTecnicos = await User.countDocuments({ role: 'tecnico' });
    const totalGestores = await User.countDocuments({ role: 'gestor' });

    res.json({
      totalUsers,
      activeUsers,
      totalClientes,
      totalTecnicos,
      totalGestores
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao obter estatísticas.' });
  }
});

// Nova rota para logout
router.post('/logout', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.isLoggedIn = false;
      await user.save();
    }
    res.json({ message: 'Logout efetuado com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao fazer logout' });
  }
});

module.exports = router;