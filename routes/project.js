var express = require("express");
const upload = require("../middlewares/upload");
var router = express.Router();
const {
  addproject,
  getprojects,
  getproject,
  getProjectsByCreator,
  updateproject,
  deleteproject,
} = require("../controllers/projectController");

/* GET Projects listing. */
router.get("/", getprojects);
router.get("/:id", getproject);
router.get("/User/:creatorId", getProjectsByCreator);
router.post("/:idUser", upload.single("image_project"), addproject);
router.put("/:id", updateproject);
router.delete("/:id", deleteproject);

// if page not found then status = 404 and message ... page not found
router.all("*", (req, res) => {
  res.status(404).send("Page not found!");
});

module.exports = router;
