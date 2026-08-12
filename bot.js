/**
 * 👑 QUEEN BELLA MD V3 - CORE BOT
 * 🔒 ALL YOUR HIDDEN CODE HERE!
 * 
 * ⚠️ This is in the PRIVATE repo
 * ⚠️ Users NEVER see this!
 */

const config = require('./config.js');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const fs = require('fs');
const chalk = require('chalk');
const express = require('express');

// ==========================================
// 📦 LOAD ALL YOUR COMMANDS
// ==========================================

// Read all command files from plugins/ folder
function loadAllCommands() {
    const commandsDir = './plugins';
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
                console.log(`✅ Loaded: ${command.name}`);
            }
        } catch (error) {
            console.error(`❌ Failed to load ${file}:`, error.message);
        }
    }
    
    console.log(`✅ Loaded ${global.commands.size} commands successfully.`);
}

// ==========================================
# 🤖 MAIN BOT FUNCTION
// ==========================================

async function startBot() {
    console.log(chalk.cyan('╔═══════════════════════════════════╗'));
    console.log(chalk.cyan('║   👑 QUEEN BELLA MD V3           ║'));
    console.log(chalk.cyan('║   Created by Dev RODGERS         ║'));
    console.log(chalk.cyan('╚═══════════════════════════════════╝'));

    // Load all commands
    loadAllCommands();

    // Check session
    if (!config.sessionId) {
        console.log(chalk.red('❌ No Session ID found!'));
        console.log(chalk.yellow('📱 Get your Session ID from: https://queen-bella-pairing.vercel.app'));
        return;
    }

    const sessionFolder = './session';
    if (!fs.existsSync(sessionFolder)) fs.mkdirSync(sessionFolder);

    const credsPath = path.join(sessionFolder, 'creds.json');
    try {
        const sessionJson = Buffer.from(config.sessionId, 'base64').toString('utf8');
        fs.writeFileSync(credsPath, sessionJson);
        console.log(chalk.green('✅ Session loaded from config!'));
    } catch (e) {
        console.log(chalk.red('❌ Invalid Session ID!'));
        return;
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        browser: ['QUEEN BELLA MD', 'Chrome', '1.0.1']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            console.log(chalk.green(`✅ ${config.botName} is Online!`));
            console.log(chalk.green(`👑 Connected as: ${sock.user.id}`));
        }
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log(chalk.yellow('🔄 Reconnecting...'));
                setTimeout(startBot, 3000);
            }
        }
    });

    // ==========================================
    // 📥 MESSAGE HANDLER
    // ==========================================

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek || !mek.message) return;

            const chatId = mek.key.remoteJid;

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

                console.log(`📥 Command: ${commandName}`);

                if (global.commands && global.commands.has(commandName)) {
                    const command = global.commands.get(commandName);
                    try {
                        await command.execute(sock, mek, args, mek.key.remoteJid, false);
                        console.log(`✅ Executed: ${commandName}`);
                    } catch (error) {
                        console.error(`❌ Error executing ${commandName}:`, error);
                        await sock.sendMessage(mek.key.remoteJid, { 
                            text: '❌ Error executing command!'
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Message error:', error);
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