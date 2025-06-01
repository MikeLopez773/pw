const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['admin', 'tecnico', 'gestor', 'cliente'], required: true },
  mfa: {
    secret: String,
    enabled: { type: Boolean, default: false }
  },
  panels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Panel' }],
  isLoggedIn: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);
