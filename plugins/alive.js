/**
 * 👑 QUEEN BELLA MD - Alive Command
 */

const settings = require('../settings');

module.exports = {
    name: 'alive',
    aliases: ['status', 'check'],
    category: 'main',
    description: 'Check if bot is alive',
    usage: '.alive',
    react: '💚',
    async execute(conn, mek, args, chatId, isOwner) {
        try {
            await conn.sendMessage(chatId, {
                react: { text: '💚', key: mek.key }
            });

            const uptime = process.uptime();
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);
            const commands = global.commands?.size || 0;

            await conn.sendMessage(chatId, {
                text: `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   👑 QUEEN BELLA MD V3    ┃
┃   Created by Dev RODGERS   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

💚 *QUEEN BELLA MD IS ALIVE!*

✅ *Status:* Online
⏰ *Uptime:* ${hours}h ${minutes}m ${seconds}s
⚡ *Prefix:* ${settings.prefix}
📊 *Commands:* ${commands}

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  📢 JOIN OUR CHANNEL         ┃
┃  👇 Click the button below    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

${settings.footer}`
            });

        } catch (error) {
            console.error('Error in alive:', error);
            await conn.sendMessage(chatId, { 
                text: '❌ Error in alive command.'
            });
        }
    }
};