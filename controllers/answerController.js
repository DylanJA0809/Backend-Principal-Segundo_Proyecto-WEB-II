const Answer = require("../models/answer");
const Question = require("../models/question");
const Vehicle = require("../models/vehicle");

const answerPost = async (req, res) => {
  try {
    const question = await Question.findById(req.body.id_question);

    if (!question) {
      return res.sendStatus(404);
    }

    const vehicle = await Vehicle.findById(question.id_vehicle);

    if (!vehicle) {
      return res.sendStatus(404);
    }

    // solo el dueño del vehículo puede responder
    if (String(vehicle.id_user) !== String(req.user.userId)) {
      return res.sendStatus(403);
    }

    // solo una respuesta por pregunta
    const existingAnswer = await Answer.findOne({
      id_question: req.body.id_question
    });

    if (existingAnswer) {
      return res.sendStatus(409);
    }

    const answer = new Answer({
      id_question: req.body.id_question,
      id_user: req.user.userId,
      message: req.body.message
    });

    const saved = await answer.save();

    return res.status(201).json(saved);

  } catch (err) {
    console.log(err);
    return res.sendStatus(422);
  }
};

const answerGet = async (req, res) => {
  try {
    if (req.query.id_question) {
      const question = await Question.findById(req.query.id_question);

      if (!question) {
        return res.sendStatus(404);
      }

      const vehicle = await Vehicle.findById(question.id_vehicle);

      if (!vehicle) {
        return res.sendStatus(404);
      }

      const isOwner = String(vehicle.id_user) === String(req.user.userId);
      const isQuestionOwner = String(question.id_user) === String(req.user.userId);

      // solo el dueño del vehículo o quien hizo la pregunta pueden ver la respuesta
      if (!isOwner && !isQuestionOwner) {
        return res.sendStatus(403);
      }

      const answers = await Answer.find({
        id_question: req.query.id_question
      })
        .populate("id_user", "name last_name")
        .sort({ created_at: 1 });

      return res.status(200).json(answers);
    }

    if (req.query.id_user) {
      const answers = await Answer.find({
        id_user: req.user.userId
      })
        .populate("id_user", "name last_name")
        .sort({ created_at: -1 });

      return res.status(200).json(answers);
    }

    const answers = await Answer.find()
      .populate("id_user", "name last_name")
      .sort({ created_at: -1 });

    return res.status(200).json(answers);

  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};

module.exports = {
  answerPost,
  answerGet
};