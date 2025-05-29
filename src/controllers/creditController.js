const creditService = require('../services/creditService');

// Adiciona créditos ao utilizador para um determinado mês
async function addCredits(req, res) {
  const { month, credits } = req.body;
  try {
    const credit = await creditService.addCredits(req.user.id, month, credits);
    res.status(201).json({ message: 'Créditos adicionados com sucesso.', credit });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao adicionar créditos.' });
  }
}

// Obtém os créditos de um utilizador para um determinado mês
async function getCredits(req, res) {
  const { month } = req.params;
  try {
    const credit = await creditService.getCredits(req.user.id, month);
    if (!credit) {
      return res.status(404).json({ message: 'Créditos não encontrados para este mês.' });
    }
    res.json(credit);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao obter créditos.' });
  }
}

// Lista todos os créditos de um utilizador
async function listCredits(req, res) {
  try {
    const credits = await creditService.listCredits(req.user.id);
    res.json(credits);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar créditos.' });
  }
}

module.exports = {
  addCredits,
  getCredits,
  listCredits,
};