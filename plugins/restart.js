cat > /home/container/plugins/restart.js << 'EOF'
module.exports = {
    name: 'restart',
    aliases: ['reboot'],
    category: 'owner',
    description: 'Restart the bot (Owner only)',
    usage: '.restart',
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
            text: '🔄 *Restarting Bot...*\n\nPlease wait while the bot restarts.\n⏱️ This may take a few seconds.'
        });

        console.log('🔄 Bot restart initiated by owner...');
        
        setTimeout(() => {
            process.exit(0);
        }, 3000);
    }
};
EOF