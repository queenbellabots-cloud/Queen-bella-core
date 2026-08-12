/**
 * 👑 QUEEN BELLA MD - Uptime Command
 */

const settings = require('../settings');

module.exports = {
    name: 'uptime',
    aliases: ['runtime', 'up'],
    category: 'main',
    description: 'Show bot uptime',
    usage: '.uptime',
    react: '⏰',
    async execute(conn, mek, args, chatId, isOwner) {
        try {
            await conn.sendMessage(chatId, {
                react: { text: '⏰', key: mek.key }
            });

            const uptime = process.uptime();
            const days = Math.floor(uptime / 86400);
            const hours = Math.floor((uptime % 86400) / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);

            await conn.sendMessage(chatId, {
                text: `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   👑 QUEEN BELLA MD V3    ┃
┃   Created by Dev RODGERS   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

⏰ *QUEEN BELLA MD UPTIME*

${days > 0 ? `📅 *Days:* ${days}\n` : ''}⏰ *Hours:* ${hours}
⏱️ *Minutes:* ${minutes}
⏱️ *Seconds:* ${seconds}

🟢 *Status:* Online ✅

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  📢 JOIN OUR CHANNEL         ┃
┃  👇 Click the button below    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

${settings.footer}`
            });

        } catch (error) {
            console.error('Error in uptime:', error);
            await conn.sendMessage(chatId, { 
                text: '❌ Error in uptime command.'
            });
        }
    }
};