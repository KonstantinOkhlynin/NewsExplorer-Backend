const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { JWT_SECRET = 'dev-secret' } = process.env;

const UnauthorizedError = require('../errors/UnauthorizedError');
const ConflictError = require('../errors/ConflictError');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');

module.exports.getUser = (req, res, next) => {
  User.findById(req.params.me)
    .then((data) => {
      if (!data) {
        return next(new NotFoundError('Пользователь с таким id не найдён'));
      }
      return res.status(200).send(data);
    })
    .catch((err) => next(new BadRequestError(`Неправильный id ${err.message}`)));
};

// eslint-disable-next-line consistent-return
module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, email, password: hash,
    }))
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Проверьте правильность данных'));
      }
      return res.status(200).send({
        _id: user._id,
        email: user.email,
        name: user.name,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError(`Ошибка валидации ${err.message}`));
      }
      if (err.name === 'MongoError' && err.code === 11000) {
        return next(new ConflictError('Данный email уже используется'));
      }
      return next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      // создадим токен
      const token = jwt.sign(
        { _id: user._id },
        JWT_SECRET,
      );
      res.send({ token });
    })
    .catch((err) => next(new UnauthorizedError(`${err.message}`)));
};
