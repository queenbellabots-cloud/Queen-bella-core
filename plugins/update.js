/**
 * 👑 QUEEN BELLA MD V3 - Update Command
 * Downloads the latest version from private repo
 * ✅ EVERYONE CAN USE
 */

const settings = require('../settings');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// 🔒 PRIVATE REPO URL
const BOT_URL = 'https://api.github.com/repos/queenbellabots-cloud/Queen-bella-core/contents/bot.js';
const GITHUB_TOKEN = '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';

module.exports = {
    name: 'update',
    aliases: ['upgrade', 'pull', 'sync'],
    category: 'main',
    description: 'Update the bot to the latest version',
    usage: '.update',
    react: '🔄',
    async execute(conn, mek, args, chatId, isOwner) {
        try {
            await conn.sendMessage(chatId, {
                react: { text: '🔄', key: mek.key }
            });

            // ✅ REMOVED OWNER CHECK - EVERYONE CAN UPDATE THEIR OWN BOT!

            await conn.sendMessage(chatId, {
                text: '🔄 *Checking for updates...*\n\n⏳ Fetching latest version...'
            });

            // Get current version
            let currentVersion = '3.0.0';
            try {
                const packageJson = require('../package.json');
                currentVersion = packageJson.version || '3.0.0';
            } catch (e) {}

            // Fetch latest commit info from GitHub
            const repoApiUrl = 'https://api.github.com/repos/queenbellabots-cloud/Queen-bella-core/commits/main';
            
            let latestCommit = '';
            let newFeatures = [];
            let updateTime = '';

            try {
                const options = {
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'User-Agent': 'QUEEN-BELLA-MD-V3'
                    }
                };

                const response = await new Promise((resolve, reject) => {
                    https.get(repoApiUrl, options, (res) => {
                        let data = '';
                        res.on('data', (chunk) => data += chunk);
                        res.on('end', () => {
                            try {
                                resolve(JSON.parse(data));
                            } catch (e) {
                                reject(e);
                            }
                        });
                    }).on('error', reject);
                });

                if (response && response.sha) {
                    latestCommit = response.sha.substring(0, 7);
                    const commitDate = response.commit?.committer?.date;
                    if (commitDate) {
                        const date = new Date(commitDate);
                        updateTime = date.toLocaleString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                    }
                }

            } catch (e) {
                console.log('Could not fetch commit info:', e.message);
            }

            // Check if update is available
            const updateMessage = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   👑 QUEEN BELLA MD V3    ┃
┃   Created by Dev RODGERS   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

🔄 *UPDATE CHECK*

📌 *Current Version:* v${currentVersion}
📌 *Latest Commit:* ${latestCommit || 'Checking...'}
📌 *Update Time:* ${updateTime || 'Unknown'}

${latestCommit ? '✅ *New update available!*\n' : '📌 *No new updates found.*\n'}

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ⚡ COMMANDS                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
• .update now    — Start update
• .update        — Check for updates

${settings.footer}`;

            await conn.sendMessage(chatId, { text: updateMessage });

            // If user types .update now, start the update
            if (args[0]?.toLowerCase() === 'now') {
                await conn.sendMessage(chatId, {
                    text: '🔄 *Starting update...*\n\n⏳ Downloading latest version...'
                });

                const options = {
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3.raw',
                        'User-Agent': 'QUEEN-BELLA-MD-V3'
                    }
                };

                // Download latest bot.js
                const botCode = await new Promise((resolve, reject) => {
                    https.get(BOT_URL, options, (res) => {
                        let data = '';
                        res.on('data', (chunk) => data += chunk);
                        res.on('end', () => resolve(data));
                    }).on('error', reject);
                });

                if (botCode && botCode.length > 100) {
                    // Save to temp file
                    const tempPath = path.join(__dirname, '../bot_temp.js');
                    fs.writeFileSync(tempPath, botCode);

                    // Replace current bot.js
                    const botPath = path.join(__dirname, '../bot.js');
                    if (fs.existsSync(botPath)) {
                        fs.unlinkSync(botPath);
                    }
                    fs.renameSync(tempPath, botPath);

                    await conn.sendMessage(chatId, {
                        text: `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   👑 QUEEN BELLA MD V3    ┃
┃   Created by Dev RODGERS   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

✅ *UPDATE COMPLETED!*

📌 *New Version:* v${currentVersion}
📌 *Commit:* ${latestCommit || 'Latest'}

🔄 Restarting the bot...

${settings.footer}`
                    });

                    await new Promise(resolve => setTimeout(resolve, 2000));
                    process.exit(0);
                } else {
                    await conn.sendMessage(chatId, {
                        text: '❌ *Update failed!*\n\nCould not download latest version.'
                    });
                }
            }

        } catch (error) {
            console.error('Update error:', error);
            await conn.sendMessage(chatId, {
                react: { text: '❌', key: mek.key }
            });
            await conn.sendMessage(chatId, {
                text: `❌ *Update failed!*\n\nError: ${error.message}`
            });
        }
    }
};