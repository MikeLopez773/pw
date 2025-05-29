const express = require('express');
const auth = require('../middleware/authMiddleware');
const SolarPanel = require('../models/solarPanel');
const User = require('../models/user');

const router = express.Router();

// Rota para listar painéis certificados
router.get('/certified', auth, async (req, res) => {
  try {
    console.log('📋 Listando painéis certificados para:', req.user.username);
    
    const panels = await SolarPanel.find({ 
      validated: true 
    })
    .populate('user', 'username email')
    .sort({ createdAt: -1 });

    console.log('📊 Encontrados', panels.length, 'painéis certificados');

    const formattedPanels = panels.map(panel => ({
      panelId: panel._id,
      username: panel.username || (panel.user ? panel.user.username : 'N/A'),
      createdAt: panel.createdAt,
      validated: panel.validated
    }));

    res.json({ panels: formattedPanels });
  } catch (error) {
    console.error('❌ Erro ao listar painéis certificados:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para listar painéis pendentes
router.get('/pending', auth, async (req, res) => {
  try {
    console.log('📋 Listando painéis pendentes para:', req.user.username);
    
    const panels = await SolarPanel.find({ 
      validated: false
    })
    .populate('user', 'username email')
    .sort({ installationDate: -1 });

    console.log('📊 Encontrados', panels.length, 'painéis pendentes');

    res.json({ panels });
  } catch (error) {
    console.error('❌ Erro ao listar painéis pendentes:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota de teste simples para verificar se as rotas estão funcionando
router.get('/test', (req, res) => {
  res.json({ message: 'Rotas de painéis funcionando!' });
});

module.exports = router;