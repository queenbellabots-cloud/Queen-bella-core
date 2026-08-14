/**
 * 👑 QUEEN BELLA MD V3 - CORE BOT
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const fs = require('fs');
const chalk = require('chalk');
const express = require('express');
const path = require('path');
const pino = require('pino');

// Settings merged here
const settings = {
    prefix: ".",
    botName: "QUEEN BELLA MD V3",
    botOwner: "RODGERS",
    ownerNumber: "254755660053",
    mode: "public",
    channelId: "120363411498601038@newsletter",
    channelName: "QUEEN BELLA MD",
    channelLink: "https://whatsapp.com/channel/0029VbCwZHACXC3PNHgtMT31",
    menuImage: "https://imagetourl.cloud/9eumy3kr.jpg",
    footer: "© A BELLA BOTS PRODUCTIONS"
};

// Load user config
let config = {};
try {
    config = require('./config.js');
} catch (e) {}

const mergedConfig = { ...settings, ...config };

// Commands
global.commands = new Map();

function loadCommands() {
    const commandsDir = './plugins';
    if (!fs.existsSync(commandsDir)) {
        fs.mkdirSync(commandsDir, { recursive: true });
    }
    const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));
    console.log(chalk.red.bold(`\n📦 Loading QUEEN BELLA MD Commands...`));
    for (const file of files) {
        try {
            const command = require(`./plugins/${file}`);
            if (command.name) {
                global.commands.set(command.name.toLowerCase(), command);
                if (command.aliases) {
                    command.aliases.forEach(alias => {
                        global.commands.set(alias.toLowerCase(), command);
                    });
                }
                console.log(chalk.green(`✅ Loaded: ${command.name}`));
            }
        } catch (error) {
            console.error(chalk.red(`❌ Failed to load ${file}:`), error.message);
        }
    }
    console.log(chalk.green(`✅ Loaded ${global.commands.size} commands.`));
}

// Main bot
async function startBot() {
    console.log(chalk.cyan(`
╔═══════════════════════════════════════╗
║   👑 QUEEN BELLA MD V3               ║
║   Created by Dev RODGERS             ║
║   🔒 CODE PROTECTED                  ║
╚═══════════════════════════════════════╝
    `));

    loadCommands();

    const sessionFolder = './session';
    if (!fs.existsSync(sessionFolder)) {
        fs.mkdirSync(sessionFolder, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        browser: ['QUEEN BELLA MD', 'Chrome', '1.0.1'],
        markOnlineOnConnect: false,
        syncFullHistory: false,
        downloadHistory: false,
        logger: pino({ level: 'silent' }),
    });

    sock.ev.on('creds.update', saveCreds);

    let pairingDone = false;

    sock.ev.on('connection.update', async (s) => {
        const { connection, lastDisconnect } = s;

        if (!sock.authState.creds.registered && !pairingDone) {
            if (connection === 'connecting' || connection === 'open') {
                pairingDone = true;
                let phoneNumber = mergedConfig.ownerNumber || '254755660053';
                phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

                console.log(chalk.green(`📱 Using number: ${phoneNumber}`));
                console.log(chalk.yellow(`⏳ Requesting pairing code...`));

                setTimeout(async () => {
                    try {
                        let code = await sock.requestPairingCode(phoneNumber);
                        code = code?.match(/.{1,4}/g)?.join('-') || code;
                        console.log('');
                        console.log(chalk.black(chalk.bgGreen(`✅ PAIRING CODE: ${code}`)));
                        console.log('');
                        console.log(chalk.yellow(`📱 Enter this code in WhatsApp Web/Linked Devices`));
                        console.log(chalk.cyan(`⏰ Code expires in 10 minutes`));
                        console.log('');
                        console.log(chalk.green(`🔄 Bot will connect automatically after pairing!`));
                        console.log('');
                    } catch (error) {
                        console.error(chalk.red('❌ Error getting pairing code:'), error);
                    }
                }, 5000);
            }
        }

        if (connection === 'open' && sock.authState.creds.registered) {
            console.log(chalk.green(`
╔═══════════════════════════════════════╗
║   ✅ BOT IS ONLINE!                  ║
║   👑 ${mergedConfig.botName}          ║
║   📱 Connected as: ${sock.user.id}    ║
╚═══════════════════════════════════════╝
            `));
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            if (statusCode === DisconnectReason.loggedOut) {
                try {
                    fs.rmSync(sessionFolder, { recursive: true, force: true });
                    console.log(chalk.yellow('Session cleared.'));
                } catch (e) {}
            }
            if (shouldReconnect) {
                console.log(chalk.yellow('🔄 Reconnecting...'));
                setTimeout(startBot, 3000);
            }
        }
    });

    // Message handler
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek || !mek.message) return;

            const chatId = mek.key.remoteJid;
            const isStatus = chatId === 'status@broadcast';
            const isChannel = chatId.includes('@newsletter');
            if (isStatus || isChannel) return;

            let text = '';
            if (mek.message.conversation) text = mek.message.conversation;
            else if (mek.message.extendedTextMessage) text = mek.message.extendedTextMessage.text;
            else if (mek.message.imageMessage) text = mek.message.imageMessage.caption || '';
            else if (mek.message.videoMessage) text = mek.message.videoMessage.caption || '';
            if (!text) return;

            const prefix = mergedConfig.prefix || '.';
            if (!text.startsWith(prefix)) return;

            const args = text.slice(1).trim().split(' ');
            const commandName = args.shift().toLowerCase();

            const sender = mek.key.participant || mek.key.remoteJid;
            const senderNumber = sender ? sender.split('@')[0] : '';
            const ownerNumber = mergedConfig.ownerNumber || '254755660053';
            const isOwner = sender === ownerNumber + '@s.whatsapp.net' || 
                            sender === ownerNumber + '@c.us' ||
                            senderNumber === ownerNumber;

            if (mergedConfig.mode === 'private' && !isOwner) {
                await sock.sendMessage(chatId, {
                    text: `🔒 Private mode. Only owner can use commands.`
                });
                return;
            }

            if (global.commands && global.commands.has(commandName)) {
                const command = global.commands.get(commandName);
                try {
                    await command.execute(sock, mek, args, chatId, isOwner);
                    console.log(`✅ Executed: ${commandName}`);
                } catch (error) {
                    console.error(`❌ Error:`, error);
                    await sock.sendMessage(chatId, { text: '❌ Error executing command!' });
                }
            } else {
                await sock.sendMessage(chatId, { 
                    text: `❌ Unknown command: ${text}\nType ${prefix}menu` 
                });
            }
        } catch (error) {
            console.error('Message error:', error);
        }
    });

    // Anti-call
    sock.ev.on('call', async (calls) => {
        for (const call of calls) {
            if (!call.from) continue;
            try {
                await sock.sendMessage(call.from, {
                    text: '📞 Call rejected. Please message instead.'
                });
                await sock.updateBlockStatus(call.from, 'block');
            } catch (e) {}
        }
    });

    // Web server
    const app = express();
    const PORT = process.env.PORT || 3000;
    app.get('/', (req, res) => {
        res.send('👑 QUEEN BELLA MD - WhatsApp Bot is Online!');
    });
    app.listen(PORT, () => {
        console.log(`🌐 Web server running on port ${PORT}`);
    });
}

startBot();