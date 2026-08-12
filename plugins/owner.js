/**
 * 👑 QUEEN BELLA MD - Owner Command
 */

const settings = require('../settings');

module.exports = {
    name: 'owner',
    aliases: ['creator', 'developer', 'dev'],
    category: 'main',
    description: 'Show owner information',
    usage: '.owner',
    react: '👑',
    async execute(conn, mek, args, chatId, isOwner) {
        try {
            await conn.sendMessage(chatId, {
                react: { text: '👑', key: mek.key }
            });

            await conn.sendMessage(chatId, {
                text: `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   👑 QUEEN BELLA MD V3    ┃
┃   Created by Dev RODGERS   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

👑 *OWNER INFO*

👤 *Name:* ${settings.botOwner}
👨‍💻 *Developer:* ${settings.author || 'Dev RODGERS'}
📱 *Number:* ${settings.ownerNumber}
📢 *Channel:* ${settings.channelName}
🔗 *Link:* ${settings.channelLink}

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  📢 JOIN OUR CHANNEL         ┃
┃  👇 Click the button below    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

${settings.footer}`
            });

        } catch (error) {
            console.error('Error in owner:', error);
            await conn.sendMessage(chatId, { 
                text: '❌ Error in owner command.'
            });
        }
    }
};