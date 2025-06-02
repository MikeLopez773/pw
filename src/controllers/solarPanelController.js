const multer = require('multer');
const path = require('path');
const SolarPanel = require('../models/solarPanel');
const User = require('../models/user');
const { isValidLocation, isValidCapacity } = require('../utils/validators');

// Configurar multer para upload de PDFs
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/certificates/');
    },
    filename: function (req, file, cb) {
        cb(null, 'cert-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Apenas ficheiros PDF são permitidos'));
        }
        cb(null, true);
    }
}).single('certificate');

// Regista um novo painel solar
async function registerPanel(req, res) {
  const { location, capacity, installationDate } = req.body;
  if (!isValidLocation(location) || !isValidCapacity(capacity)) {
    return res.status(400).json({ message: 'Dados inválidos.' });
  }
  try {
    const panel = new SolarPanel({
      userId: req.user.id,
      location,
      capacity,
      installationDate,
      validated: false,
    });
    await panel.save();
    res.status(201).json({ message: 'Painel registado com sucesso. Aguarda validação.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao registar painel.' });
  }
}

// Lista os painéis solares do utilizador autenticado
async function listPanels(req, res) {
  try {
    const panels = await SolarPanel.find({ userId: req.user.id });
    res.json(panels);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao obter painéis.' });
  }
}

// Valida um painel solar (apenas para técnicos)
async function validatePanel(req, res) {
  const { panelId } = req.body;
  try {
    const panel = await SolarPanel.findById(panelId);
    if (!panel) return res.status(404).json({ message: 'Painel não encontrado.' });
    panel.validated = true;
    panel.certificate = `CERT-${panel._id}`;
    await panel.save();
    res.json({ message: 'Painel validado e certificado emitido.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao validar painel.' });
  }
}

// Validar e certificar painel solar (apenas técnicos)
async function certificatePanel(req, res) {
    upload(req, res, async function(err) {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'Ficheiro PDF obrigatório.' });
        }

        const { panelId, userId, username } = req.body;

        // Verificar se o painel existe
        const panel = await SolarPanel.findById(panelId);
        if (!panel) {
            return res.status(404).json({ message: 'Painel não encontrado.' });
        }

        // Verificar se o utilizador existe
        const user = await User.findOne({ 
            _id: userId,
            username: username 
        });
        if (!user) {
            return res.status(404).json({ message: 'Utilizador não encontrado.' });
        }

        // Atualizar o painel com a certificação
        panel.validated = true;
        panel.certificateUrl = req.file.path; // Caminho do ficheiro guardado
        panel.certifiedBy = req.user.id;
        panel.certificationDate = new Date();
        await panel.save();

        res.json({
            message: 'Painel certificado com sucesso.',
            panel
        });
    });
}

// Lista os painéis solares certificados
async function listCertifiedPanels(req, res) {
  try {
    const panels = await SolarPanel.find({ 
      validated: true,
      $or: [
        { certificate: { $exists: true, $ne: null } },
        { certificateUrl: { $exists: true, $ne: null } }
      ]
    }).sort({ certificationDate: -1 });
    
    res.json({ panels });
  } catch (error) {
    console.error('Erro ao listar painéis certificados:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}

// Lista um painel solar pelo ID
async function listPanelById(req, res) {
  try {
    const panel = await SolarPanel.findById(req.params.id);
    if (!panel) return res.status(404).json({ message: 'Painel não encontrado.' });
    res.json(panel);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao procurar painel.' });
  }
}

module.exports = {
  registerPanel,
  listPanels,
  validatePanel,
  certificatePanel,
  listCertifiedPanels,
  listPanelById,
};