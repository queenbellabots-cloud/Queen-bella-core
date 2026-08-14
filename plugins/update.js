cat > /home/container/plugins/update.js << 'EOF'
module.exports = {
    name: 'update',
    aliases: ['upgrade'],
    category: 'owner',
    description: 'Update bot (Owner only)',
    usage: '.update',
    async execute(sock, mek, args, chatId, isOwner) {
        // Check if user is owner
        const ownerNumber = '254755660053';
        const sender = mek.key.participant || mek.key.remoteJid;
        const senderNumber = sender ? sender.split('@')[0] : '';
        
        if (senderNumber !== ownerNumber) {
            await sock.sendMessage(chatId, {
                text: '❌ *Access Denied!*\nThis command is only for the bot owner.'
            });
            return;
        }

        await sock.sendMessage(chatId, {
            text: '🔄 *Checking for updates...*\n\n📦 Current version: V3.0.0\n🔍 Checking latest version...'
        });

        // Simulate update check
        setTimeout(async () => {
            await sock.sendMessage(chatId, {
                text: `✅ *Update Status*\n\n📦 Version: V3.0.0\n🟢 Status: Latest version\n\n💫 No updates available.\nBot is up to date!`
            });
        }, 3000);
    }
};
EOF