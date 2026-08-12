/**
 * 👑 QUEEN BELLA MD V3 - CORE BOT
 * 🔒 PAIRING CODE WITH RETRY LOGIC
 */

const config = require('./config.js');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const fs = require('fs');
const chalk = require('chalk');
const express = require('express');
const path = require('path');
const pino = require('pino');

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

    // ✅ DELETE OLD SESSION TO FORCE PAIRING
    const credsPath = path.join(sessionFolder, 'creds.json');
    if (fs.existsSync(credsPath)) {
        console.log(chalk.yellow('📱 Deleting old session...'));
        try {
            fs.unlinkSync(credsPath);
            console.log(chalk.green('✅ Old session deleted!'));
        } catch (e) {}
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
        // ✅ RETRY ON FAILURE
        defaultQueryTimeoutMs: 60000,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 10000,
    });

    sock.ev.on('creds.update', saveCreds);

    // ==========================================
    // ✅ PAIRING CODE GENERATION - WITH RETRY
    // ==========================================

    let pairingDone = false;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    sock.ev.on('connection.update', async (s) => {
        const { connection, lastDisconnect, qr } = s;

        if (!sock.authState.creds.registered && !pairingDone) {
            if (connection === 'connecting' || connection === 'open') {
                pairingDone = true;
                let phoneNumber = config.ownerNumber || '254755660053';
                phoneNumber = String(phoneNumber).replace(/[^0-9]/g, '');

                console.log(chalk.green(`📱 Using phone number: ${phoneNumber}`));
                console.log(chalk.yellow(`⏳ Requesting pairing code...`));

                // ✅ RETRY LOGIC - TRY 3 TIMES
                const requestPairing = async (attempt) => {
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
                        
                        // ✅ WAIT FOR USER TO ENTER CODE
                        console.log(chalk.yellow(`⏳ Waiting for you to enter the code in WhatsApp...`));
                        console.log(chalk.yellow(`📌 If it doesn't work, wait 5 minutes and restart the bot.`));
                        console.log(``);
                        
                    } catch (error) {
                        console.log(chalk.red(`❌ Attempt ${attempt} failed: ${error.message}`));
                        
                        if (attempt < 3) {
                            console.log(chalk.yellow(`🔄 Retrying in 10 seconds... (Attempt ${attempt + 1}/${MAX_RETRIES})`));
                            setTimeout(() => requestPairing(attempt + 1), 10000);
                        } else {
                            console.log(chalk.red(`
╔═══════════════════════════════════════╗
║   ❌ PAIRING FAILED                  ║
║   Please wait 5 minutes and restart  ║
║   Or try using a different number    ║
╚═══════════════════════════════════════╝
                            `));
                        }
                    }
                };

                // ✅ START PAIRING WITH RETRY
                setTimeout(() => requestPairing(1), 5000);
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