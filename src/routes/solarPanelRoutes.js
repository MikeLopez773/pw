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

// Rota para registar um novo painel solar
router.post('/register', auth, async (req, res) => {
  try {
    const { location, capacity, installationDate } = req.body;
    // Usa o utilizador autenticado
    const userId = req.user.id;

    // Cria o painel associado ao utilizador autenticado
    const newPanel = new SolarPanel({
      user: userId,
      location,
      capacity,
      installationDate,
      validated: false
    });

    await newPanel.save();

    res.status(201).json({ message: 'Painel registado com sucesso!', panel: newPanel });
  } catch (error) {
    console.error('❌ Erro ao registar painel:', error);
    res.status(500).json({ message: 'Erro ao registar painel' });
  }
});

// Defina as rotas aqui
router.get('/', auth, async (req, res) => {
  try {
    const panels = await SolarPanel.find({ user: req.user.id });
    res.json(panels);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao obter painéis.' });
  }
});

// Rota para gerar ou receber certificado de painel
router.post('/certificate', async (req, res) => {
  const { panelId } = req.body;
  if (!panelId) {
    return res.status(400).json({ message: 'panelId em falta.' });
  }
  try {
    const updatedPanel = await SolarPanel.findByIdAndUpdate(
      panelId,
      { validated: true },
      { new: true }
    );
    if (!updatedPanel) {
      return res.status(404).json({ message: 'Painel não encontrado.' });
    }
    res.json({ message: 'Painel certificado com sucesso!', panel: updatedPanel });
  } catch (error) {
    console.error('❌ Erro ao certificar painel:', error);
    res.status(500).json({ message: 'Erro ao certificar painel.' });
  }
});

module.exports = router;