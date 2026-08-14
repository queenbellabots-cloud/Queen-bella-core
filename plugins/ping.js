cat > /home/container/plugins/ping.js << 'EOF'
module.exports = {
    name: 'ping',
    aliases: ['p', 'latency'],
    category: 'main',
    description: 'Check bot response time',
    usage: '.ping',
    async execute(sock, mek, args, chatId, isOwner) {
        const start = Date.now();
        await sock.sendMessage(chatId, { text: '🏓 Pinging...' });
        const end = Date.now();
        const latency = end - start;
        
        let emoji = '🟢';
        let status = 'Excellent';
        if (latency > 1000) {
            emoji = '🔴';
            status = 'Poor';
        } else if (latency > 500) {
            emoji = '🟡';
            status = 'Average';
        }
        
        await sock.sendMessage(chatId, { 
            text: `🏓 *PONG!*\n\n${emoji} *Status:* ${status}\n⏱️ *Latency:* ${latency}ms\n📱 *Bot:* QUEEN BELLA MD V3\n\n💫 *Bot is running smoothly!*`
        });
    }
};
EOF