const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

// Rota para histórico de créditos (apenas clientes)
router.get('/', auth, async (req, res) => {
  try {
    console.log('💰 Buscando créditos para cliente:', req.user.id);
    
    if (req.user.role !== 'cliente') {
      return res.status(403).json({ message: 'Acesso negado. Apenas clientes.' });
    }

    // Mock: dados de exemplo
    const mockCredits = [
      {
        month: 'Maio 2025',
        credits: 45.2
      },
      {
        month: 'Abril 2025',
        credits: 38.7
      },
      {
        month: 'Março 2025',
        credits: 42.1
      }
    ];

    console.log('✅ Créditos encontrados:', mockCredits.length, 'registros');
    res.json(mockCredits);
  } catch (error) {
    console.error('❌ Erro ao buscar créditos:', error);
    res.status(500).json({ message: 'Erro ao buscar créditos.' });
  }
});

module.exports = router;