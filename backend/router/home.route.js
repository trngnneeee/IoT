const router = require('express').Router();

const authMiddleware = require("../middleware/auth.middleware");
const homeController = require("../controller/home.controller");

router.post(
  "/", 
  authMiddleware.verifyToken,
  homeController.home
);

module.exports = router;