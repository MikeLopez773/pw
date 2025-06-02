const EnergyProduction = require('../models/energyProduction');

// Histórico de produção de TODOS os painéis do utilizador
exports.listAllProduction = async (req, res) => {
  try {
    const records = await EnergyProduction.find({ user: req.user.id }).sort({ date: -1 });
    res.json({ records });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao obter histórico.' });
  }
};

// Histórico de produção de UM painel
exports.listProduction = async (req, res) => {
  try {
    const records = await EnergyProduction.find({ user: req.user.id, panelId: req.params.panelId }).sort({ date: -1 });
    res.json({ records });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao obter histórico do painel.' });
  }
};

// Monitorizar produção de um painel
exports.monitorPanel = async (req, res) => {
  // Implementa aqui a tua lógica de monitorização
  res.json({ message: 'Monitorização não implementada.' });
};

// Certificar painel
exports.certificatePanel = async (req, res) => {
  try {
    // ... lógica ...
  } catch (error) {
    res.status(500).json({ message: 'Erro ao certificar painel.' });
  }
};