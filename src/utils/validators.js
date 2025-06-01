// Valida email simples
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Valida password (mínimo 6 caracteres)
function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 6;
}

// Valida localização (apenas letras e espaços, não vazio)
function isValidLocation(location) {
  return typeof location === 'string' && /^[A-Za-zÀ-ÿ\s]+$/.test(location.trim());
}

// Valida capacidade do painel (número positivo)
function isValidCapacity(capacity) {
  return typeof capacity === 'number' && capacity > 0;
}

// Valida número de cartão de crédito (Visa, MasterCard, Amex, Discover, etc)
function isValidCreditCardNumber(number) {
  if (typeof number !== 'string') return false;
  const sanitized = number.replace(/\s+/g, '');
  const re = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$/;
  if (!re.test(sanitized)) return false;
  let sum = 0, shouldDouble = false;
  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i));
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return (sum % 10) === 0;
}

// Valida validade MM/AA
function isValidExpiryDate(expiry) {
  if (typeof expiry !== 'string') return false;
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) return false;
  const [month, year] = expiry.split('/').map(Number);
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear || (year === currentYear && month < currentMonth)) return false;
  return true;
}

// Valida CVC (3 ou 4 dígitos)
function isValidCVC(cvc) {
  return typeof cvc === 'string' && /^\d{3,4}$/.test(cvc);
}

// Importa o modelo User diretamente
const User = require('../models/user');

// Função para verificar o código MFA
async function verifyMfaCode(userId, code) {
  const user = await User.findById(userId);
  if (!user || !user.mfa || user.mfa.secret !== code) {
    return false;
  }
  return true;
}

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidLocation,
  isValidCapacity,
  isValidCreditCardNumber,
  isValidExpiryDate,
  isValidCVC,
  verifyMfaCode,
};