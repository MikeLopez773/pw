const User = require('../models/user');
const speakeasy = require('speakeasy');

// Função para verificar o código MFA
async function verifyMfaCode(userId, code) {
  const user = await User.findById(userId);
  if (!user || !user.mfa || !user.mfa.secret) {
    return false;
  }
  const verified = speakeasy.totp.verify({
    secret: user.mfa.secret,
    encoding: 'base32',
    token: code,
  });
  return verified;
}

module.exports = {
  verifyMfaCode,
};