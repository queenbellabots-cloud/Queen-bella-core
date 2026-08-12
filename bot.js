/**
 * 👑 QUEEN BELLA MD V1.0.1
 * 🔒 CORE BOT CODE - PRIVATE
 */

const config = global.__config || require('./config.js');

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const fs = require('fs');
const chalk = require('chalk');
const express = require('express');
const path = require('path');

async function startBot() {
    console.log(chalk.cyan('╔═══════════════════════════════════╗'));
    console.log(chalk.cyan('║   👑 QUEEN BELLA MD V1.0.1      ║'));
    console.log(chalk.cyan('║   Created by Dev RODGERS         ║'));
    console.log(chalk.cyan('╚═══════════════════════════════════╝'));

    if (!config.sessionId) {
        console.log(chalk.red('❌ No Session ID found!'));
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

    // 📥 MESSAGE HANDLER
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek || !mek.message) return;

            const text = mek.message?.conversation || 
                        mek.message?.extendedTextMessage?.text || '';

            if (!text) return;

            if (text.startsWith('.menu')) {
                await sock.sendMessage(mek.key.remoteJid, {
                    text: `👑 *QUEEN BELLA MD*\n\n📌 Commands:\n.menu - Show menu\n.ping - Check latency\n.alive - Check bot status\n.owner - Owner info\n.uptime - Uptime\n\n${config.footer}`
                });
            }

            if (text.startsWith('.ping')) {
                await sock.sendMessage(mek.key.remoteJid, {
                    text: `🏓 *PONG!*\n\n📡 Latency: ${Date.now() - mek.messageTimestamp}ms\n✅ Status: Online\n\n${config.footer}`
                });
            }

            if (text.startsWith('.alive')) {
                await sock.sendMessage(mek.key.remoteJid, {
                    text: `👑 *QUEEN BELLA MD IS ALIVE!*\n\n✅ Status: Online\n⏰ Uptime: ${process.uptime().toFixed(0)}s\n\n${config.footer}`
                });
            }

            if (text.startsWith('.owner')) {
                await sock.sendMessage(mek.key.remoteJid, {
                    text: `👑 *OWNER INFO*\n\n👤 Name: ${config.ownerName}\n📱 Number: ${config.ownerNumber}\n📢 Channel: ${config.channelName}\n🔗 ${config.channelLink}\n\n${config.footer}`
                });
            }

            if (text.startsWith('.uptime')) {
                const uptime = process.uptime();
                const hours = Math.floor(uptime / 3600);
                const minutes = Math.floor((uptime % 3600) / 60);
                const seconds = Math.floor(uptime % 60);
                await sock.sendMessage(mek.key.remoteJid, {
                    text: `⏰ *UPTIME*\n\nHours: ${hours}\nMinutes: ${minutes}\nSeconds: ${seconds}\n\n${config.footer}`
                });
            }
        } catch (error) {
            console.error('Message error:', error);
        }
    });

    // 🚀 ANTI-CALL
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

    // 🌐 WEB SERVER
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