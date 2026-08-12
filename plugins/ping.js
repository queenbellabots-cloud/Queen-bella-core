/**
 * 👑 QUEEN BELLA MD - Ping Command
 */

const settings = require('../settings');

module.exports = {
    name: 'ping',
    aliases: ['p'],
    category: 'main',
    description: 'Check bot latency',
    usage: '.ping',
    react: '🏓',
    async execute(conn, mek, args, chatId, isOwner) {
        try {
            await conn.sendMessage(chatId, {
                react: { text: '🏓', key: mek.key }
            });

            const start = Date.now();
            await conn.sendMessage(chatId, { text: '⏳ Checking...' });
            const latency = Date.now() - start;

            const uptime = process.uptime();
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);

            await conn.sendMessage(chatId, {
                text: `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   👑 QUEEN BELLA MD V3    ┃
┃   Created by Dev RODGERS   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

🏓 *PONG!*

📡 *Latency:* ${latency}ms
⏰ *Uptime:* ${hours}h ${minutes}m ${seconds}s
🟢 *Status:* Online ✅

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  📢 JOIN OUR CHANNEL         ┃
┃  👇 Click the button below    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

${settings.footer}`
            });

        } catch (error) {
            console.error('Error in ping:', error);
            await conn.sendMessage(chatId, { 
                text: '❌ Error in ping command.'
            });
        }
    }
};