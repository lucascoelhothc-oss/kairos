const r = require("express").Router(); 
const c = require("../controllers/chatController"); 
const m = require("../middleware/authMiddleware"); 
r.get("/history", m, c.getHistory); 
r.post("/", m, c.handleChat); 
module.exports = r;