const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

// Rota para registar painéis (apenas clientes)
router.post('/register', auth, async (req, res) => {
  try {
    console.log('🔧 Registando painel para cliente:', req.user.id);
    
    if (req.user.role !== 'cliente') {
      return res.status(403).json({ message: 'Acesso negado. Apenas clientes.' });
    }

    const { location, capacity, installationDate } = req.body;
    
    // Mock: simular registo de painel
    console.log('✅ Painel registado:', { location, capacity, installationDate });
    
    res.json({ 
      message: 'Painel registado com sucesso!',
      panel: { location, capacity, installationDate, validated: false }
    });
  } catch (error) {
    console.error('❌ Erro ao registar painel:', error);
    res.status(500).json({ message: 'Erro ao registar painel.' });
  }
});

// Rota para listar painéis do cliente
router.get('/', auth, async (req, res) => {
  try {
    console.log('📋 Listando painéis para cliente:', req.user.id);
    
    if (req.user.role !== 'cliente') {
      return res.status(403).json({ message: 'Acesso negado. Apenas clientes.' });
    }

    // Mock: dados de exemplo
    const mockPanels = [
      {
        location: 'Telhado Principal',
        capacity: 5.2,
        validated: true
      },
      {
        location: 'Garagem',
        capacity: 3.8,
        validated: false
      }
    ];

    console.log('✅ Painéis encontrados:', mockPanels.length);
    res.json(mockPanels);
  } catch (error) {
    console.error('❌ Erro ao listar painéis:', error);
    res.status(500).json({ message: 'Erro ao listar painéis.' });
  }
});

module.exports = router;