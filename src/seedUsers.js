const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('./models/user'); // Ajusta o caminho se necessário

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/renewable_energy';

async function seedUsers() {
  await mongoose.connect(MONGO_URI);

  const users = JSON.parse(fs.readFileSync(path.join(__dirname, '../users.json'), 'utf-8'));

  for (const user of users) {
    const exists = await User.findOne({ username: user.username });
    if (!exists) {
      // Remove o _id para evitar conflitos
      const { _id, ...userData } = user;
      await User.create(userData);
      console.log(`Utilizador "${user.username}" criado.`);
    } else {
      console.log(`Utilizador "${user.username}" já existe.`);
    }
  }

  await mongoose.disconnect();
}

seedUsers().catch(err => {
  console.error('Erro ao fazer seed dos utilizadores:', err);
  process.exit(1);
});