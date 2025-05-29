const mongoose = require('mongoose');

const EnergyProductionSchema = new mongoose.Schema({
  panelId: { type: mongoose.Schema.Types.ObjectId, ref: 'SolarPanel', required: true },
  timestamp: { type: Date, default: Date.now },
  production: { type: Number, required: true } // kWh
});

module.exports = mongoose.model('EnergyProduction', EnergyProductionSchema);