const mongoose = require('mongoose');

async function connectDB() {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    throw new Error('Defina MONGODB_URI no arquivo .env para conectar ao MongoDB.');
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Conectado ao MongoDB.');
}

module.exports = connectDB;
