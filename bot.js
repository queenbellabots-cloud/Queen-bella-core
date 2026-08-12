/**
 * 👑 QUEEN BELLA MD V3 - CORE BOT
 * 🔒 ALL YOUR HIDDEN CODE HERE!
 * 
 * User deploys → Gets pair code → Enters in WhatsApp → Bot connects!
 * NO SESSION ID NEEDED!
 */

const config = require('./config.js');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const fs = require('fs');
const chalk = require('chalk');
const express = require('express');
const path = require('path');

// ==========================================
// 📦 GLOBAL VARIABLES
// ==========================================

global.commands = new Map();
global.botMode = 'public'; // public or private

// ==========================================
// 📦 LOAD ALL YOUR COMMANDS
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
// 🚀 CHECK IF SENDER IS OWNER
// ==========================================

function isOwner(sender) {
    const ownerNumber = config.ownerNumber || '254755660053';
    const senderNumber = sender ? sender.split('@')[0] : '';
    return sender === ownerNumber + '@s.whatsapp.net' || 
           sender === ownerNumber + '@c.us' ||
           senderNumber === ownerNumber;
}

// ==========================================
# 🤖 MAIN BOT FUNCTION
// ==========================================

async function startBot() {
    console.log(chalk.cyan(`
╔═══════════════════════════════════════╗
║   👑 QUEEN BELLA MD V3               ║
║   Created by Dev RODGERS             ║
║   🔒 CODE PROTECTED                  ║
╚═══════════════════════════════════════╝
    `));

    // Load all commands
    loadAllCommands();

    // Create session folder
    const sessionFolder = './session';
    if (!fs.existsSync(sessionFolder)) {
        fs.mkdirSync(sessionFolder, { recursive: true });
    }

    // Check if session already exists (bot already connected)
    const credsPath = path.join(sessionFolder, 'creds.json');
    let hasSession = fs.existsSync(credsPath);

    if (hasSession) {
        console.log(chalk.green('✅ Session found! Bot will connect automatically.'));
    } else {
        console.log(chalk.yellow('📱 No session found. Will generate pairing code.'));
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        browser: ['QUEEN BELLA MD', 'Chrome', '1.0.1'],
        markOnlineOnConnect: false,
        syncFullHistory: false,
        downloadHistory: false,
    });

    sock.ev.on('creds.update', saveCreds);

    // ==========================================
    // 🔑 GENERATE PAIRING CODE (SHOWN IN CONSOLE)
    // ==========================================

    let pairingDone = false;

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        // 🔥 GENERATE PAIRING CODE AND SHOW IN CONSOLE
        if (connection === 'open' && !pairingDone && !hasSession) {
            pairingDone = true;
            try {
                const phoneNumber = config.ownerNumber || '254755660053';
                console.log(chalk.yellow(`📱 Using phone number: ${phoneNumber}`));
                console.log(chalk.yellow(`⏳ Requesting pairing code...`));

                const code = await sock.requestPairingCode(phoneNumber);
                const formattedCode = code.match(/.{1,4}/g)?.join('-') || code;

                console.log(``);
                console.log(chalk.black(chalk.bgGreen(`✅ PAIRING CODE: `)), chalk.black(chalk.white(formattedCode)));
                console.log(``);
                console.log(chalk.yellow(`📱 Enter this code in WhatsApp Web/Linked Devices`));
                console.log(chalk.cyan(`⏰ Code expires in 10 minutes`));
                console.log(``);
                console.log(chalk.green(`🔄 After entering the code, the bot will connect automatically!`));
                console.log(``);
                
            } catch (error) {
                console.log(chalk.red('❌ Error getting pairing code:'), error.message);
            }
        }

        // ✅ BOT CONNECTED SUCCESSFULLY!
        if (connection === 'open' && hasSession) {
            console.log(chalk.green(`
╔═══════════════════════════════════════╗
║   ✅ BOT IS ONLINE!                  ║
║   👑 ${config.botName}                ║
║   📱 Connected as: ${sock.user.id}    ║
╚═══════════════════════════════════════╝
            `));
            
            // Send welcome message to owner
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

        // 🔄 RECONNECT IF DISCONNECTED
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

            if (statusCode === DisconnectReason.loggedOut) {
                try {
                    fs.rmSync(sessionFolder, { recursive: true, force: true });
                    console.log(chalk.yellow('Session cleared. Please re-authenticate.'));
                    console.log(chalk.yellow('🔄 Restart the bot to get a new pairing code.'));
                } catch (e) {}
            }

            if (shouldReconnect) {
                console.log(chalk.yellow('🔄 Reconnecting...'));
                setTimeout(startBot, 3000);
            }
        }
    });

    // ==========================================
    // 📥 MESSAGE HANDLER (Integrated from main.js)
    // ==========================================

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek || !mek.message) return;

            const chatId = mek.key.remoteJid;

            // Skip status and channel messages
            const isStatus = chatId === 'status@broadcast';
            const isChannel = chatId.includes('@newsletter');
            if (isStatus || isChannel) return;

            // Get text from message
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

            // Check if command exists
            if (text.startsWith(config.prefix || '.')) {
                const args = text.slice(1).trim().split(' ');
                const commandName = args.shift().toLowerCase();

                const sender = mek.key.participant || mek.key.remoteJid;
                const senderNumber = sender ? sender.split('@')[0] : 'Unknown';
                const isOwnerCheck = isOwner(sender);
                const botMode = global.botMode || 'public';

                // 🔐 PRIVATE MODE CHECK
                if (botMode === 'private' && !isOwnerCheck) {
                    await sock.sendMessage(mek.key.remoteJid, {
                        text: `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   👑 QUEEN BELLA MD V3           ┃
┃   Created by Dev RODGERS         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

🔒 *BOT IS IN PRIVATE MODE*

Only the bot owner can use commands.

👑 *Owner:* ${config.botOwner || 'QUEEN BELLA USER'}
📱 *Number:* ${config.ownerNumber}

📌 *Contact the owner to request access.*

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  📢 JOIN OUR CHANNEL         ┃
┃  👇 Click the button below    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

${config.footer}`
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
    // 👥 GROUP PARTICIPANT UPDATE
    // ==========================================

    sock.ev.on('group-participants.update', async (update) => {
        try {
            console.log('👥 Group update:', update);
        } catch (error) {
            console.error('Error in group update:', error);
        }
    });

    // ==========================================
    // 🚀 ANTI-CALL
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
    // 🌐 WEB SERVER
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
// 🚀 START
// ==========================================

startBot();