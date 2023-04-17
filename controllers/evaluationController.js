const Evaluation = require("../models/evaluationSchema");

const getEvaluations = async (req, res, next) => {
  try {
    const evaluations = await Evaluation.find();
    if (!evaluations || evaluations.length === 0) {
      throw new Error("Evaluations not found!");
    }
    res.status(200).json({ evaluations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEvaluations,
};