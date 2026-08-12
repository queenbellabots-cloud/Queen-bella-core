/**
 * 👑 QUEEN BELLA MD V3 - Restart Command
 * Restarts the bot
 * ✅ EVERYONE CAN USE
 */

const settings = require('../settings');

module.exports = {
    name: 'restart',
    aliases: ['reboot', 'reload'],
    category: 'main',
    description: 'Restart the bot',
    usage: '.restart',
    react: '🔄',
    async execute(conn, mek, args, chatId, isOwner) {
        try {
            await conn.sendMessage(chatId, {
                react: { text: '🔄', key: mek.key }
            });

            // ✅ REMOVED OWNER CHECK - EVERYONE CAN RESTART THEIR OWN BOT!

            await conn.sendMessage(chatId, {
                text: `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   👑 QUEEN BELLA MD V3    ┃
┃   Created by Dev RODGERS   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

🔄 *RESTARTING BOT...*

✅ Bot is restarting.
⏳ Please wait a moment...

${settings.footer}`
            });

            // Wait for message to send
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Restart the bot
            process.exit(0);

        } catch (error) {
            console.error('Restart error:', error);
            await conn.sendMessage(chatId, {
                react: { text: '❌', key: mek.key }
            });
            await conn.sendMessage(chatId, {
                text: `❌ *Restart failed!*\n\nError: ${error.message}`
            });
        }
    }
};