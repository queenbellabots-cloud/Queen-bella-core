cat > /home/container/plugins/uptime.js << 'EOF'
module.exports = {
    name: 'uptime',
    aliases: ['runtime', 'online'],
    category: 'main',
    description: 'Show bot uptime',
    usage: '.uptime',
    async execute(sock, mek, args, chatId, isOwner) {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        const startTime = new Date(Date.now() - uptime * 1000).toLocaleString();
        
        const message = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃      ⏰ BOT UPTIME            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

🕐 *Uptime:* ${uptimeStr}
📅 *Started:* ${startTime}
📱 *Status:* Online
🤖 *Bot:* QUEEN BELLA MD V3

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  💫 Running smoothly!         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
        `;
        await sock.sendMessage(chatId, { text: message });
    }
};
EOF