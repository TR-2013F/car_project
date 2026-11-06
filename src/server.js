require('dotenv').config();

const express = require('express');
const carController = require('./controllers/car_controller');
const connectDB = require('./database/connection');
const { upload, uploadDirectory } = require('./middleware/upload');

const app = express();
const PORT = process.env.PORT || 3030;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDirectory));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/api/cars', carController.list);
app.get('/api/cars/:id', carController.getById);
app.post('/api/cars', upload.single('imagem'), carController.create);
app.put('/api/cars/:id', upload.single('imagem'), carController.update);
app.patch('/api/cars/:id', upload.single('imagem'), carController.update);
app.delete('/api/cars/:id', carController.remove);

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }

  if (error.name === 'MulterError') {
    const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(status).json({ error: error.message });
  }

  if (error.status === 400) {
    return res.status(400).json({ error: error.message });
  }

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'JSON inválido no corpo da requisição.' });
  }

  if (error.code === 11000) {
    return res.status(409).json({ error: 'Já existe um carro com esses dados.' });
  }

  console.error('Erro ao processar requisição:', error);
  return res.status(500).json({ error: 'Erro interno do servidor.' });
});

async function startServer() {
  await connectDB();

  return app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Não foi possível iniciar o servidor:', error);
    process.exitCode = 1;
  });
}

module.exports = app;
module.exports.startServer = startServer;
