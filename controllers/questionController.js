const Question = require("../models/question");
const Answer = require("../models/answer");
const Vehicle = require("../models/vehicle");

const questionPost = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.body.id_vehicle);

    if (!vehicle) {
      return res.sendStatus(404);
    }

    //evita que el dueño se pregunte a sí mismo
    if (String(vehicle.id_user) === String(req.user.userId)) {
      return res.sendStatus(403);
    }

    // si ya existe una pregunta de este usuario para este vehículo
    // y aún no tiene respuesta, no puede volver a preguntar
    const lastQuestion = await Question.findOne({
      id_vehicle: req.body.id_vehicle,
      id_user: req.user.userId
    }).sort({ created_at: -1 });

    if (lastQuestion) {
      const existingAnswer = await Answer.findOne({
        id_question: lastQuestion._id
      });

      if (!existingAnswer) {
        return res.sendStatus(409);
      }
    }

    const question = new Question({
      id_vehicle: req.body.id_vehicle,
      id_user: req.user.userId,
      message: req.body.message
    });

    const saved = await question.save();

    return res.status(201).json(saved);

  } catch (err) {
    console.log(err);
    return res.sendStatus(422);
  }
};

const questionGet = async (req, res) => {
  try {
    if (req.query.id_vehicle) {
      const vehicle = await Vehicle.findById(req.query.id_vehicle);

      if (!vehicle) {
        return res.sendStatus(404);
      }

      const isOwner = String(vehicle.id_user) === String(req.user.userId);

      const filter = {
        id_vehicle: req.query.id_vehicle
      };

      // si no es dueño, solo ve sus propias preguntas
      if (!isOwner) {
        filter.id_user = req.user.userId;
      }

      const questions = await Question.find(filter)
        .populate("id_user", "name last_name")
        .sort({ created_at: -1 });

      return res.status(200).json(questions);
    }

    if (req.query.id_user) {
      const questions = await Question.find({
        id_user: req.user.userId
      })
        .populate("id_user", "name last_name")
        .sort({ created_at: -1 });

      return res.status(200).json(questions);
    }

    const questions = await Question.find()
      .populate("id_user", "name last_name")
      .sort({ created_at: -1 });

    return res.status(200).json(questions);

  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};

module.exports = {
  questionPost,
  questionGet
};