const mongoose = require('mongoose');

const solarPanelSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: { type: String, required: true },
  capacity: { type: Number, required: true },
  installationDate: { type: Date, required: true },
  validated: { type: Boolean, default: false },
  username: String, // Para armazenar o nome do usuário
  certificateUrl: String, // Caminho do certificado
  certifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  certificationDate: Date,
});

module.exports = mongoose.model('SolarPanel', solarPanelSchema);