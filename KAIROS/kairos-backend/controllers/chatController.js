const cs = require("../services/chatService"); 
const ms = require("../services/messageService"); 
exports.handleChat = async (req, res, next) => {
  try {
    const { message } = req.body;
    const user_id = req.auth.user_id;
    await ms.saveMessage({ user_id, role: 'user', content: message });
    const { reply, fallback } = await cs.generateReply({ message, mode: 'geral' });
    const msg = await ms.saveMessage({ user_id, role: 'assistant', content: reply });
    res.json({ reply, user_id, message_id: msg.id, fallback });
  } catch (e) { next(e); }
};
exports.getHistory = async (req, res, next) => {
    try {
        const history = await cs.getHistory(req.auth.user_id);
        res.json(history);
    } catch (e) { next(e); }
};