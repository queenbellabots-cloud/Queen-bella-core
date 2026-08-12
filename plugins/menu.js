/**
 * 👑 QUEEN BELLA MD - Menu Command
 */

const settings = require('../settings');

module.exports = {
    name: 'menu',
    aliases: ['help', 'allmenu', 'cmds'],
    category: 'main',
    description: 'Show all available commands',
    usage: '.menu',
    react: '👑',
    async execute(conn, mek, args, chatId, isOwner) {
        try {
            await conn.sendMessage(chatId, {
                react: { text: '👑', key: mek.key }
            });

            const commands = global.commands || new Map();
            const cmdList = [];
            const seen = new Set();

            for (const [name, cmd] of commands) {
                if (!seen.has(name) && cmd.name === name) {
                    seen.add(name);
                    cmdList.push({
                        name: name,
                        category: cmd.category || 'general'
                    });
                }
            }

            const categories = {};
            cmdList.forEach(cmd => {
                const category = cmd.category.toUpperCase();
                if (!categories[category]) categories[category] = [];
                categories[category].push(cmd.name);
            });

            const totalCommands = cmdList.length;
            const sortedCategories = Object.keys(categories).sort();

            let menu = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   👑 QUEEN BELLA MD V3    ┃
┃   Created by Dev RODGERS   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

📊 *BOT INFO*
👤 User: ${mek.pushName || 'User'}
👑 Owner: ${settings.botOwner}
⚡ Prefix: ${settings.prefix}
📊 Commands: ${totalCommands}

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃     📋 COMMAND LIST           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;

            for (const category of sortedCategories) {
                menu += `\n┌─── ${category} MENU ───┐`;
                for (const cmdName of categories[category].sort()) {
                    menu += `\n│  .${cmdName}`;
                }
                menu += `\n└────────────────────────┘`;
            }

            menu += `\n\n┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  📢 JOIN OUR CHANNEL         ┃
┃  👇 Click the button below    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

${settings.footer}`;

            await conn.sendMessage(chatId, {
                image: { url: settings.menuImage || 'https://imagetourl.cloud/9eumy3kr.jpg' },
                caption: menu
            });

        } catch (error) {
            console.error('Error in menu:', error);
            await conn.sendMessage(chatId, { 
                text: '❌ Error loading menu.'
            });
        }
    }
};