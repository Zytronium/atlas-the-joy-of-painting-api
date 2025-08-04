const express = require("express");
const router = express.Router();
const AppController = require("../controllers/AppController");

router.get("/filter", AppController.getFromFilters);
router.get("/filterName", AppController.getFromName);
router.get("/:id", AppController.getFromID);

module.exports = router;
