/**
 * 👑 QUEEN BELLA MD V3 - CORE BOT
 * 🔒 READS COMMANDS FROM plugins/ FOLDER
 */

const config = require('./config.js');
const settings = require('./settings.js');

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const fs = require('fs');
const chalk = require('chalk');
const express = require('express');
const path = require('path');
const pino = require('pino');

global.commands = new Map();

function loadCommands() {
    const commandsDir = path.join(process.cwd(), 'plugins');
    
    if (!fs.existsSync(commandsDir)) {
        fs.mkdirSync(commandsDir, { recursive: true });
        console.log(chalk.yellow('📁 Created plugins folder'));
    }

    const files = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));
    console.log(chalk.red.bold(`\n📦 Loading QUEEN BELLA MD Commands...`));
    global.commands.clear();

    for (const file of files) {
        try {
            const filePath = path.join(commandsDir, file);
            delete require.cache[require.resolve(filePath)];
            const command = require(filePath);
            
            if (command.name) {
                global.commands.set(command.name.toLowerCase(), command);
                if (command.aliases && Array.isArray(command.aliases)) {
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
                let phoneNumber = config.ownerNumber || settings.ownerNumber || '254755660053';
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
║   👑 ${config.botName || settings.botName} ║
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

📌 *Bot Name:* ${config.botName || settings.botName}
👤 *Owner:* ${config.botOwner || settings.botOwner}
⚡ *Prefix:* ${config.prefix || settings.prefix || '.'}
🟢 *Status:* Connected!

📌 *Commands:* Type ${config.prefix || '.'}menu to see all commands

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  📢 JOIN OUR CHANNEL         ┃
┃  👇 Click the button below    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

${config.footer || settings.footer}`
                });
                console.log(chalk.green('✅ Welcome message sent!'));
            } catch (e) {
                console.log('Could not send welcome message:', e.message);
            }
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
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

    // MESSAGE HANDLER
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

            const prefix = config.prefix || settings.prefix || '.';

            if (text.startsWith(prefix)) {
                const args = text.slice(1).trim().split(' ');
                const commandName = args.shift().toLowerCase();

                const sender = mek.key.participant || mek.key.remoteJid;
                const senderNumber = sender ? sender.split('@')[0] : 'Unknown';
                const ownerNumber = config.ownerNumber || settings.ownerNumber || '254755660053';
                const isOwner = sender === ownerNumber + '@s.whatsapp.net' || 
                                sender === ownerNumber + '@c.us' ||
                                senderNumber === ownerNumber;
                const botMode = config.mode || settings.mode || 'public';

                if (botMode === 'private' && !isOwner) {
                    await sock.sendMessage(mek.key.remoteJid, {
                        text: `🔒 *BOT IS IN PRIVATE MODE*\n\nOnly the bot owner can use commands.\n\n👑 Owner: ${config.botOwner || settings.botOwner}\n📱 Number: ${ownerNumber}`
                    });
                    return;
                }

                console.log(`📥 Command: ${commandName} from ${senderNumber}`);

                if (global.commands && global.commands.has(commandName)) {
                    const command = global.commands.get(commandName);
                    try {
                        await command.execute(sock, mek, args, mek.key.remoteJid, isOwner);
                        console.log(`✅ Executed: ${commandName}`);
                    } catch (error) {
                        console.error(`❌ Error executing ${commandName}:`, error);
                        await sock.sendMessage(mek.key.remoteJid, { 
                            text: '❌ Error executing command!'
                        });
                    }
                } else {
                    await sock.sendMessage(mek.key.remoteJid, { 
                        text: `❌ Unknown command: ${text}\nType ${prefix}menu for available commands.`
                    });
                }
            }
        } catch (error) {
            console.error('Message error:', error);
        }
    });

    sock.ev.on('group-participants.update', async (update) => {
        console.log('👥 Group update:', update);
    });

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