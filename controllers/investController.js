const projectModel = require("../models/projectSchema");
const userModel = require("../models/userSchema");
const investModel = require("../models/investSchema");

const addInvest = async (req, res, next) => {
  try {
    const { idProject } = req.params;
    const idUser = req.user._id;
    const { titre, message, montant } = req.body;
    created_at = new Date();
    const user = await userModel.findById(idUser);
    const project = await projectModel.findById(idProject);
    const invest = new investModel({
      titre,
      message,
      montant,
      investor: user,
      project: project,
    });

    const addedInvest = await invest
      .save()
      .then((savedInvest) => {
        // find the user by ID
        userModel
          .findById(idUser)
          .then((user) => {
            // add the project ID to the user's project array
            user.invests.push(savedInvest._id);
            // save the user to the database
            user
              .save()
              .then(() => {
                console.log("invest added to user successfully");
              })
              .catch((err) => {
                console.error(err);
              });
          })
          .catch((err) => {
            console.error(err);
          });
        // find the project by ID
        projectModel
          .findById(idProject)
          .then((project) => {
            project.montant_actuel = project.montant_actuel + parseFloat(montant);
            project.numberOfPeople_actuel = project.numberOfPeople_actuel + 1;
            // add the project ID to the user's project array
            project.invests.push(savedInvest._id);
            // add the project ID to the user's project array
            // save the user to the database
            project
              .save()
              .then(() => {
                console.log("invest added to Project successfully");
              })
              .catch((err) => {
                console.error(err);
              });
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInvest = async (req, res, next) => {
  try {
    const invests = await investModel.find().populate("project");
    if (!invests || invests.length === 0) {
      throw new Error("invests not found !");
    }
    res.status(200).json({ invests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteInvest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invest = await investModel.findById(id);
    const user = await userModel.findOne({ invests: invest._id });
    if (user) {
      user.invests = user.invests.filter(id => id.toString() !== invest._id.toString());
      await user.save();
    }
    const project = await projectModel.findOne({ invests: invest._id });
    if (project) {
      project.montant_actuel=project.montant_actuel - invest.montant;
      project.numberOfPeople_actuel=project.numberOfPeople_actuel-1;
      project.invests = project.invests.filter(id => id.toString() !== invest._id.toString());
      await project.save();
    }
    if (!invest) {
      return res.status(404).json({ message: "invest not found!" });
    }

    await invest.remove();
    res.status(200).json({ message: "invest deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInvestUser = async (req, res, next) => {
  try {
    const idUser = req.user._id;
    const invests = await investModel
      .find({ investor: idUser })
      .populate("project");
    if (!invests || invests.length === 0) {
      throw new Error("invests not found !");
    }
    res.status(200).json({ invests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  addInvest,
  deleteInvest,
  getInvest,
  getInvestUser,
};
