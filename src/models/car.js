const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    marca: {
      type: String,
      required: [true, 'A marca é obrigatória.'],
      trim: true,
      maxlength: [80, 'A marca deve ter no máximo 80 caracteres.'],
    },
    modelo: {
      type: String,
      required: [true, 'O modelo é obrigatório.'],
      trim: true,
      maxlength: [80, 'O modelo deve ter no máximo 80 caracteres.'],
    },
    ano: {
      type: Number,
      required: [true, 'O ano é obrigatório.'],
      min: [1886, 'O ano deve ser igual ou posterior a 1886.'],
      max: [new Date().getFullYear() + 1, 'O ano não pode ser futuro.'],
      validate: {
        validator: Number.isInteger,
        message: 'O ano deve ser um número inteiro.',
      },
    },
    preco: {
      type: Number,
      required: [true, 'O preço é obrigatório.'],
      min: [0, 'O preço não pode ser negativo.'],
    },
    descricao: {
      type: String,
      required: [true, 'A descrição é obrigatória.'],
      trim: true,
      maxlength: [2000, 'A descrição deve ter no máximo 2000 caracteres.'],
    },
    imagem: {
      type: String,
      required: [true, 'A imagem é obrigatória.'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Car', carSchema);
