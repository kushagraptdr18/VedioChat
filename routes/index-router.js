const express = require('express');
const router = express.Router();

let{ indexPageController, showingChatPageController }=require('../controllers/index-controller')

router.get('/',indexPageController) 
router.get("/chat",showingChatPageController)

module.exports = router;
