/**
 * 👑 QUEEN BELLA MD V3 - CORE BOT
 * 🔒 CLEAN OUTPUT - NO DEBUG LOGS
 */

const config = require('./config.js');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const fs = require('fs');
const chalk = require('chalk');
const express = require('express');
const path = require('path');
const pino = require('pino'); // ✅ ADD THIS!

// ==========================================
// 🧹 SILENCE BAILESY LOGS - LIKE V1
// ==========================================

// Store original console.log
const originalLog = console.log;

// Filter out Baileys noise
console.log = function() {
    const args = Array.from(arguments);
    const message = args.join(' ');
    
    // Skip Baileys debug logs
    if (message.includes('{"level":30,"time"') || 
        message.includes('{"level":') ||
        message.includes('"class":"baileys"') ||
        message.includes('"helloMsg"') ||
        message.includes('"userAgent"') ||
        message.includes('"webInfo"') ||
        message.includes('"devicePairingData"') ||
        message.includes('"connectType"') ||
        message.includes('"pull":false') ||
        message.includes('"msg":"not logged in"')) {
        return;
    }
    
    originalLog.apply(console, arguments);
};

// ==========================================
// GLOBAL VARIABLES
// ==========================================

global.commands = new Map();
global.botMode = 'public';

// ==========================================
// LOAD ALL YOUR COMMANDS
// ==========================================

function loadAllCommands() {
    const commandsDir = './plugins';
    if (!fs.existsSync(commandsDir)) {
        fs.mkdirSync(commandsDir, { recursive: true });
    }

    const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));
    global.commands = new Map();

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

    console.log(chalk.green(`✅ Loaded ${global.commands.size} commands successfully.`));
}

// ==========================================
// CHECK IF SENDER IS OWNER
// ==========================================

function isOwner(sender) {
    const ownerNumber = config.ownerNumber || '254755660053';
    const senderNumber = sender ? sender.split('@')[0] : '';
    return sender === ownerNumber + '@s.whatsapp.net' || 
           sender === ownerNumber + '@c.us' ||
           senderNumber === ownerNumber;
}

// ==========================================
// MAIN BOT FUNCTION
// ==========================================

async function startBot() {
    console.log(chalk.cyan(`
╔═══════════════════════════════════════╗
║   👑 QUEEN BELLA MD V3               ║
║   Created by Dev RODGERS             ║
║   🔒 CODE PROTECTED                  ║
╚═══════════════════════════════════════╝
    `));

    loadAllCommands();

    const sessionFolder = './session';
    if (!fs.existsSync(sessionFolder)) {
        fs.mkdirSync(sessionFolder, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);

    // ✅ SILENT LOGGER - NO DEBUG
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        browser: ['QUEEN BELLA MD', 'Chrome', '1.0.1'],
        markOnlineOnConnect: false,
        syncFullHistory: false,
        downloadHistory: false,
        logger: pino({ level: 'silent' }), // ✅ NOW pino IS DEFINED!
    });

    sock.ev.on('creds.update', saveCreds);

    // ==========================================
    // ✅ PAIRING CODE GENERATION - CLEAN LIKE V1
    // ==========================================

    let pairingDone = false;

    sock.ev.on('connection.update', async (s) => {
        const { connection, lastDisconnect, qr } = s;

        if (!sock.authState.creds.registered && !pairingDone) {
            if (connection === 'connecting' || connection === 'open') {
                pairingDone = true;
                let phoneNumber = config.ownerNumber || '254755660053';
                phoneNumber = String(phoneNumber).replace(/[^0-9]/g, '');

                console.log(chalk.green(`📱 Using phone number: ${phoneNumber}`));
                console.log(chalk.yellow(`⏳ Requesting pairing code...`));

                setTimeout(async () => {
                    try {
                        let code = await sock.requestPairingCode(phoneNumber);
                        code = code?.match(/.{1,4}/g)?.join("-") || code;
                        console.log(``);
                        console.log(chalk.black(chalk.bgGreen(`✅ PAIRING CODE: `)), chalk.black(chalk.white(code)));
                        console.log(``);
                        console.log(chalk.yellow(`📱 Enter this code in WhatsApp Web/Linked Devices`));
                        console.log(chalk.cyan(`⏰ Code expires in 10 minutes`));
                        console.log(``);
                        console.log(chalk.green(`🔄 After entering the code, the bot will connect automatically!`));
                        console.log(``);
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
║   👑 ${config.botName}                ║
║   📱 Connected as: ${sock.user.id}    ║
╚═══════════════════════════════════════╝
            `));
            
            try {
                const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                await sock.sendMessage(botNumber, {
                    text: `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   👑 QUEEN BELLA MD V3           ┃
┃   Created by Dev RODGERS         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

✅ *BOT IS ONLINE!*

📌 *Bot Name:* ${config.botName}
👤 *Owner:* ${config.botOwner}
⚡ *Prefix:* ${config.prefix}
🟢 *Status:* Connected!

📌 *Commands:* Type ${config.prefix}menu to see all commands

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  📢 JOIN OUR CHANNEL         ┃
┃  👇 Click the button below    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

${config.footer}`
                });
                console.log(chalk.green('✅ Welcome message sent!'));
            } catch (e) {
                console.log('Could not send welcome message:', e.message);
            }
        }

        if (qr) console.log(chalk.yellow('📱 QR Code generated.'));
        if (connection === 'connecting') console.log(chalk.yellow('🔄 Connecting...'));

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode || 
                lastDisconnect?.error?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

            if (statusCode === DisconnectReason.loggedOut) {
                try {
                    fs.rmSync(sessionFolder, { recursive: true, force: true });
                    console.log(chalk.yellow('Session cleared. Please re-authenticate.'));
                } catch (e) {}
            }

            if (shouldReconnect) {
                console.log(chalk.yellow('🔄 Reconnecting...'));
                setTimeout(startBot, 3000);
            }
        }
    });

    // ==========================================
    // MESSAGE HANDLER
    // ==========================================

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek || !mek.message) return;

            const chatId = mek.key.remoteJid;
            const isStatus = chatId === 'status@broadcast';
            const isChannel = chatId.includes('@newsletter');
            if (isStatus || isChannel) return;

            let text = '';
            if (mek.message.conversation) {
                text = mek.message.conversation;
            } else if (mek.message.extendedTextMessage) {
                text = mek.message.extendedTextMessage.text;
            } else if (mek.message.imageMessage) {
                text = mek.message.imageMessage.caption || '';
            } else if (mek.message.videoMessage) {
                text = mek.message.videoMessage.caption || '';
            }

            if (!text) return;

            if (text.startsWith(config.prefix || '.')) {
                const args = text.slice(1).trim().split(' ');
                const commandName = args.shift().toLowerCase();

                const sender = mek.key.participant || mek.key.remoteJid;
                const senderNumber = sender ? sender.split('@')[0] : 'Unknown';
                const isOwnerCheck = isOwner(sender);
                const botMode = global.botMode || 'public';

                if (botMode === 'private' && !isOwnerCheck) {
                    await sock.sendMessage(mek.key.remoteJid, {
                        text: `🔒 *BOT IS IN PRIVATE MODE*\n\nOnly the bot owner can use commands.\n\n👑 Owner: ${config.botOwner}\n📱 Number: ${config.ownerNumber}`
                    });
                    return;
                }

                console.log(`📥 Command: ${commandName} from ${senderNumber}`);

                if (global.commands && global.commands.has(commandName)) {
                    const command = global.commands.get(commandName);
                    try {
                        await command.execute(sock, mek, args, mek.key.remoteJid, isOwnerCheck);
                        console.log(`✅ Executed: ${commandName}`);
                    } catch (error) {
                        console.error(`❌ Error executing ${commandName}:`, error);
                        await sock.sendMessage(mek.key.remoteJid, { 
                            text: '❌ Error executing command!'
                        });
                    }
                } else {
                    await sock.sendMessage(mek.key.remoteJid, { 
                        text: `❌ Unknown command: ${text}\nType ${config.prefix}menu for available commands.`
                    });
                }
            }
        } catch (error) {
            console.error('Message error:', error);
        }
    });

    // ==========================================
    // GROUP PARTICIPANT UPDATE
    // ==========================================

    sock.ev.on('group-participants.update', async (update) => {
        console.log('👥 Group update:', update);
    });

    // ==========================================
    // ANTI-CALL
    // ==========================================

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

    // ==========================================
    // WEB SERVER
    // ==========================================

    const app = express();
    const PORT = process.env.PORT || 3000;
    app.get('/', (req, res) => {
        res.send('👑 QUEEN BELLA MD - WhatsApp Bot is Online!');
    });
    app.listen(PORT, () => {
        console.log(`🌐 Web server running on port ${PORT}`);
    });
}

// ==========================================
// START
// ==========================================

startBot();