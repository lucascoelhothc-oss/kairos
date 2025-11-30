const os = require("./openaiService");
exports.getHistory = async (userId) => {
    return { messages: [{ id: 'init-'+Date.now(), text: 'Kairós online. Mente blindada.', from: 'kairos' }] };
};
exports.generateReply = async ({ message }) => {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("sk-your")) return { reply: "Modo Offline.", fallback: true };
    try {
        return { reply: "Simulação IA: " + message, fallback: false };
    } catch (e) {
        return { reply: "Erro IA.", fallback: true };
    }
};