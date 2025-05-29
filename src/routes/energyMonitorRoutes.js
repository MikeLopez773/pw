const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

// Rota para histórico de produção de energia (apenas clientes)
router.get('/history', auth, async (req, res) => {
  try {
    console.log('📊 Buscando histórico para cliente:', req.user.id);
    
    // Verifica se é cliente
    if (req.user.role !== 'cliente') {
      return res.status(403).json({ message: 'Acesso negado. Apenas clientes.' });
    }

    // Dados mock para teste
    const mockHistory = [
      {
        date: new Date('2025-05-24'),
        production: 15.2
      },
      {
        date: new Date('2025-05-23'),
        production: 18.5
      },
      {
        date: new Date('2025-05-22'),
        production: 12.8
      }
    ];

    console.log('✅ Histórico encontrado:', mockHistory.length, 'registros');
    res.json(mockHistory);
  } catch (error) {
    console.error('❌ Erro ao buscar histórico:', error);
    res.status(500).json({ message: 'Erro ao buscar histórico de produção.' });
  }
});

module.exports = router;