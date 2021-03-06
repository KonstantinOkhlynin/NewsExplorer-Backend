const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const message = require('../tools/messages');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator(email) {
        return validator.isEmail(email);
      },
      message: 'Неверный формат Email',
    },
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function findUserByCredentials(email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error(message.invalidEmailAndPass));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Error(message.invalidEmailAndPass));
          }

          return user; // теперь user доступен
        });
    });
};
module.exports = mongoose.model('user', userSchema);
