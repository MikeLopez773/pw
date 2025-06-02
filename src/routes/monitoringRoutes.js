const express = require('express');
const auth = require('../middleware/authMiddleware');
const { onlyGestor } = require('../middleware/roleMiddleware');
const axios = require('axios');
const SolarPanel = require('../models/solarPanel');

const router = express.Router();

// Rota para estatísticas gerais
router.get('/stats', auth, async (req, res) => {
  try {
    // Exemplo de agregação (ajuste conforme o seu modelo)
    const totalProduction = await SolarPanel.aggregate([
      { $group: { _id: null, total: { $sum: "$production" } } }
    ]);
    const activePanels = await SolarPanel.countDocuments({ validated: true });
    const avgEfficiency = await SolarPanel.aggregate([
      { $group: { _id: null, avg: { $avg: "$efficiency" } } }
    ]);

    res.json({
      totalProduction: totalProduction[0]?.total || 0,
      activePanels,
      averageEfficiency: avgEfficiency[0]?.avg?.toFixed(2) || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao obter estatísticas.' });
  }
});

// Monitorização da produção de um cliente (apenas gestor)
router.get('/production/:idClient', auth, onlyGestor, async (req, res) => {
  try {
    console.log('🔍 Buscando produção para cliente:', req.params.idClient);
    
    // Chama a API mock
    const response = await axios.get('http://localhost:4000/');
    
    console.log('📊 Resposta da API mock:', response.data);
    
    // Retorna as leituras
    res.json({ readings: [response.data] });
  } catch (error) {
    console.error('❌ Erro ao obter produção:', error.message);
    res.status(500).json({ message: 'Erro ao obter produção do cliente.' });
  }
});

// Estatísticas de produção de UM cliente
router.get('/stats/:idClient', auth, onlyGestor, async (req, res) => {
  try {
    const { idClient } = req.params;
    // Filtra painéis do cliente
    const panels = await SolarPanel.find({ user: idClient });

    const totalProduction = panels.reduce((sum, p) => sum + (p.production || 0), 0);
    const activePanels = panels.filter(p => p.validated).length;
    const avgEfficiency = panels.length
      ? (panels.reduce((sum, p) => sum + (p.efficiency || 0), 0) / panels.length)
      : 0;

    res.json({
      totalProduction,
      activePanels,
      averageEfficiency: avgEfficiency.toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao obter estatísticas do cliente.' });
  }
});

router.get('/panels/:id', auth, async (req, res) => {
  try {
    const panel = await SolarPanel.findById(req.params.id);
    if (!panel) {
      return res.status(404).json({ message: 'Painel solar não encontrado.' });
    }
    res.json(panel);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao obter painel solar.' });
  }
});

module.exports = router;