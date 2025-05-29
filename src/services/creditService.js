// Este serviço gere os créditos de energia dos utilizadores

const Credit = require('../models/credit');

// Adiciona créditos ao utilizador para um determinado mês
async function addCredits(userId, month, credits) {
  let credit = await Credit.findOne({ userId, month });
  if (credit) {
    credit.credits += credits;
    await credit.save();
  } else {
    credit = new Credit({ userId, month, credits });
    await credit.save();
  }
  return credit;
}

// Obtém os créditos de um utilizador para um determinado mês
async function getCredits(userId, month) {
  return await Credit.findOne({ userId, month });
}

// Lista todos os créditos de um utilizador
async function listCredits(userId) {
  return await Credit.find({ userId });
}

module.exports = {
  addCredits,
  getCredits,
  listCredits,
};