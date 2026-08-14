cat > /home/container/plugins/owner.js << 'EOF'
module.exports = {
    name: 'owner',
    aliases: ['creator', 'dev', 'developer'],
    category: 'main',
    description: 'Show bot owner information',
    usage: '.owner',
    async execute(sock, mek, args, chatId, isOwner) {
        const message = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃      👑 BOT OWNER INFO        ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

👤 *NAME:* RODGERS
📱 *NUMBER:* 254755660053
🤖 *BOT:* QUEEN BELLA MD V3
🔒 *STATUS:* Online

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃      📱 CONTACT INFO          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

📞 WhatsApp: wa.me/254755660053
📢 Channel: https://whatsapp.com/channel/0029VbCwZHACXC3PNHgtMT31
📧 Email: bellabots@gmail.com

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃      © QUEEN BELLA MD         ┃
┃   A BELLA BOTS PRODUCTIONS    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
        `;
        await sock.sendMessage(chatId, { text: message });
    }
};
EOF