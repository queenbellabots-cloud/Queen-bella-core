cat > /home/container/plugins/alive.js << 'EOF'
module.exports = {
    name: 'alive',
    aliases: ['status', 'online', 'ping'],
    category: 'main',
    description: 'Check if bot is alive',
    usage: '.alive',
    async execute(sock, mek, args, chatId, isOwner) {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        
        const message = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃      ✅ BOT IS ALIVE!          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

📊 *STATUS INFO*
⏰ Uptime: ${uptimeStr}
📱 Status: Online
👑 Bot: QUEEN BELLA MD V3
⚡ Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB

💫 *Bot is running smoothly!*
        `;
        await sock.sendMessage(chatId, { text: message });
    }
};
EOF