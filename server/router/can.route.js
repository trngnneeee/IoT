const router = require('express').Router();

const canController = require("./../controller/can.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.get(
  "/", 
  authMiddleware.verifyToken,
  canController.openCan
);

router.get(
  "/get-req",
  canController.sendReq
)

router.get(
  "/get-req-stas",
  canController.getStas
)

module.exports = router;