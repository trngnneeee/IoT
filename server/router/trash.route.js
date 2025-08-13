const router = require('express').Router();

const trashController = require("./../controller/trash.controller");

router.post(
  "/trash-volume", 
  trashController.trashVolumePost
);

router.get(
  "/trash-volume",
  trashController.trashVolumeGet
)

router.post(
  "/trash-weight",
  trashController.trashWeightPost
)

module.exports = router;