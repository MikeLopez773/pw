const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  console.log('🔍 Verificando autenticação...');
  
  const authHeader = req.headers.authorization;
  console.log('📋 Authorization header:', authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ Header inválido ou ausente');
    return res.status(401).json({ message: 'Token não fornecido ou inválido.' });
  }

  const token = authHeader.split(' ')[1];
  console.log('🎫 Token extraído:', token ? `${token.substring(0, 20)}...` : 'null');
  console.log('🔍 Partes do JWT:', token.split('.').length);
  console.log('🔑 JWT_SECRET definido:', !!process.env.JWT_SECRET);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token válido. Usuário:', decoded.id, 'Role:', decoded.role);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('❌ Erro específico na verificação:', err.constructor.name);
    console.log('❌ Mensagem do erro:', err.message);
    return res.status(401).json({ message: 'Token inválido.' });
  }
};

module.exports = auth;
