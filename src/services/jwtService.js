const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'segredo123';

// Gera um token JWT para um utilizador
function generateToken(payload, expiresIn = '1h') {
  return jwt.sign(payload, SECRET, { expiresIn });
}

// Verifica e decodifica um token JWT
function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = {
  generateToken,
  verifyToken,
};