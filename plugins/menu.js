cat > /home/container/plugins/menu.js << 'EOF'
module.exports = {
    name: 'menu',
    aliases: ['help', 'allmenu', 'cmds'],
    category: 'main',
    description: 'Show all available commands',
    usage: '.menu',
    async execute(sock, mek, args, chatId, isOwner) {
        try {
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
👑 Owner: RODGERS
⚡ Prefix: .
📊 Commands: ${totalCommands}

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃     📋 COMMAND LIST           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;

            for (const category of sortedCategories) {
                menu += `\n\n┌─── ${category} ───┐`;
                for (const cmdName of categories[category].sort()) {
                    menu += `\n│  .${cmdName}`;
                }
                menu += `\n└─────────────────┘`;
            }

            menu += `\n\n┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  📢 JOIN OUR CHANNEL         ┃
┃  👇 Click the button below    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

© A BELLA BOTS PRODUCTIONS`;

            await sock.sendMessage(chatId, {
                image: { url: 'https://imagetourl.cloud/9eumy3kr.jpg' },
                caption: menu
            });

        } catch (error) {
            console.error('Error in menu:', error);
            await sock.sendMessage(chatId, { 
                text: '❌ Error loading menu. Please try again.'
            });
        }
    }
};
EOF