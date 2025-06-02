const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const EnergyProduction = require('../models/energyProduction');

// Rota para histórico de produção de energia (apenas clientes)
router.get('/history', auth, async (req, res) => {
  try {
    console.log('📊 Buscando histórico para cliente:', req.user.id);
    
    // Verifica se é cliente
    if (req.user.role !== 'cliente') {
      return res.status(403).json({ message: 'Acesso negado. Apenas clientes.' });
    }

    // Só mostra produção dos painéis do cliente autenticado
    // (Ajusta conforme o teu modelo de utilizador e painel)
    const panels = await require('../models/solarPanel').find({ user: req.user.id });
    const panelIds = panels.map(p => p._id);

    const history = await EnergyProduction.find({ panelId: { $in: panelIds } }).sort({ timestamp: -1 });
    console.log('✅ Histórico encontrado:', history.length, 'registros');
    res.json(history);
  } catch (error) {
    console.error('❌ Erro ao buscar histórico:', error);
    res.status(500).json({ message: 'Erro ao buscar histórico de produção.' });
  }
});

// POST novo registo de produção (exemplo)
router.post('/history', auth, async (req, res) => {
  try {
    const { panelId, production, timestamp } = req.body;
    const newRecord = new EnergyProduction({
      panelId,
      production,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });
    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registar produção.' });
  }
});

router.post('/certificate', auth, async (req, res) => {
  try {
    // Se usas FormData, usa req.body e req.file
    console.log('🔔 [POST /certificate] Body:', req.body);
    console.log('🔔 [POST /certificate] Files:', req.files || req.file);

    const { panelId, userId, username } = req.body;
    if (!panelId || !userId || !username) {
      console.warn('❌ Campos obrigatórios em falta:', { panelId, userId, username });
      return res.status(400).json({ message: 'Campos obrigatórios em falta.' });
    }

    if (!req.file && (!req.files || !req.files.certificate)) {
      console.warn('❌ Ficheiro PDF não enviado.');
      return res.status(400).json({ message: 'Ficheiro PDF não enviado.' });
    }

    // ... resto da lógica ...

  } catch (error) {
    console.error('❌ Erro inesperado ao certificar painel:', error);
    res.status(500).json({ message: 'Erro ao certificar painel.' });
  }
});

module.exports = router;