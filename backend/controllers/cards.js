const Card = require('../models/card');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((card) => res.send({ data: card }))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.status(201).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании карточки!'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с указанным _id не найдена!');
      }
      if (card.owner.toString() !== req.user._id) {
        throw new ForbiddenError('Нельзя удалить карточку, созданную не вами!');
      }
      return card.remove();
    })
    .then(() => res.send({ message: 'Удаление прошло успешно!' }))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные для удаления карточки!'));
      } else {
        next(err);
      }
    });
};

module.exports.likeCard = (req, res, next) => Card
  .findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
  .then((card) => {
    if (!card) {
      throw new NotFoundError('Передан несуществующий _id карточки!');
    }
    return res.send({ data: card });
  })
  .catch((err) => {
    if (err.name === 'CastError') {
      next(new BadRequestError('Переданы некорректные данные для постановки лайка!'));
    } else {
      next(err);
    }
  });

module.exports.dislikeCard = (req, res, next) => Card
  .findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
  .then((card) => {
    if (!card) {
      throw new NotFoundError('Передан несуществующий _id карточки!');
    }
    return res.send({ data: card });
  })
  .catch((err) => {
    if (err.name === 'CastError') {
      next(new BadRequestError('Переданы некорректные данные для снятия лайка!'));
    } else {
      next(err);
    }
  });
