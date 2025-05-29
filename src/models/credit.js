const mongoose = require('mongoose');

const CreditSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: String, required: true }, // e.g., '2024-05'
  credits: { type: Number, required: true } // kWh
});

module.exports = mongoose.model('Credit', CreditSchema);