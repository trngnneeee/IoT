const router = require('express').Router();

const canController = require("./../controller/can.controller");

router.get(
  "/", 
  canController.openCan
);

router.get(
  "/get-req",
  canController.sendReq
)

module.exports = router;