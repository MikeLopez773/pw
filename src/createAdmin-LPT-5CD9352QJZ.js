const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/renewable_energy';

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  role: String,
});

const User = mongoose.model('User', userSchema);

async function createUsers() {
  await mongoose.connect(MONGO_URI);

  const users = [
    { username: 'admin', password: 'admin', role: 'admin' },
    { username: 'gestor', password: 'gestor', role: 'gestor' },
    { username: 'tecnico', password: 'tecnico', role: 'tecnico' },
  ];

  for (const userData of users) {
    const existing = await User.findOne({ username: userData.username });
    if (existing) {
      console.log(`Usuário ${userData.username} já existe.`);
      continue;
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = new User({
      username: userData.username,
      password: hashedPassword,
      role: userData.role,
    });
    await user.save();
    console.log(`Usuário ${userData.username} criado com sucesso!`);
  }

  process.exit(0);
}

createUsers().catch(err => {
  console.error('Erro ao criar usuários:', err);
  process.exit(1);
});