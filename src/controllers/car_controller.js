const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path');
const Car = require('../models/car');
const { uploadDirectory } = require('../middleware/upload');
const carFields = ['marca', 'modelo', 'ano', 'preco', 'descricao'];

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

async function removeImage(filename) {
  if (!filename) {
    return;
  }

  try {
    await fs.unlink(path.join(uploadDirectory, filename));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

function getImageFilename(imagePath) {
  if (typeof imagePath !== 'string' || !imagePath.startsWith('/uploads/')) {
    return null;
  }

  return path.basename(imagePath);
}

async function removeImageAfterResponse(filename) {
  try {
    await removeImage(filename);
  } catch (error) {
    console.error('Não foi possível remover um arquivo de imagem:', error);
  }
}

function getCarFields(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return null;
  }

  return carFields.reduce((fields, field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      fields[field] = body[field];
    }

    return fields;
  }, {});
}

async function list(req, res) {
  const cars = await Car.find().sort({ createdAt: -1 });
  return res.status(200).json(cars);
}

async function getById(req, res) {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: 'ID de carro inválido.' });
  }

  const car = await Car.findById(req.params.id);
  if (!car) {
    return res.status(404).json({ error: 'Carro não encontrado.' });
  }

  return res.status(200).json(car);
}

async function create(req, res) {
  const fields = getCarFields(req.body);
  if (!fields) {
    if (req.file) {
      await removeImage(req.file.filename);
    }
    return res.status(400).json({ error: 'Envie os dados do carro como formulário multipart.' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'Envie a imagem no campo "imagem".' });
  }

  fields.imagem = `/uploads/${req.file.filename}`;

  try {
    const car = await Car.create(fields);
    return res.status(201).json(car);
  } catch (error) {
    try {
      await removeImage(req.file.filename);
    } catch (cleanupError) {
      console.error('Não foi possível limpar a imagem após falha no cadastro:', cleanupError);
    }
    throw error;
  }
}

async function update(req, res) {
  if (!isValidId(req.params.id)) {
    if (req.file) {
      await removeImage(req.file.filename);
    }
    return res.status(400).json({ error: 'ID de carro inválido.' });
  }

  const fields = getCarFields(req.body);
  if (!fields || (Object.keys(fields).length === 0 && !req.file)) {
    if (req.file) {
      await removeImage(req.file.filename);
    }
    return res.status(400).json({ error: 'Envie ao menos um campo válido do carro.' });
  }

  let car;
  try {
    const previousCar = await Car.findById(req.params.id);
    if (!previousCar) {
      if (req.file) {
        await removeImage(req.file.filename);
      }
      return res.status(404).json({ error: 'Carro não encontrado.' });
    }

    const oldImage = req.file ? getImageFilename(previousCar.imagem) : null;
    if (req.file) {
      fields.imagem = `/uploads/${req.file.filename}`;
    }

    car = await Car.findByIdAndUpdate(req.params.id, fields, {
      new: true,
      runValidators: true,
    });
    await removeImageAfterResponse(oldImage);
  } catch (error) {
    if (req.file) {
      try {
        await removeImage(req.file.filename);
      } catch (cleanupError) {
        console.error('Não foi possível limpar a imagem após falha na atualização:', cleanupError);
      }
    }
    throw error;
  }

  return res.status(200).json(car);
}

async function remove(req, res) {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: 'ID de carro inválido.' });
  }

  const car = await Car.findByIdAndDelete(req.params.id);
  if (!car) {
    return res.status(404).json({ error: 'Carro não encontrado.' });
  }

  await removeImageAfterResponse(getImageFilename(car.imagem));
  return res.status(204).end();
}

module.exports = { list, getById, create, update, remove };
