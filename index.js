const { Client, GatewayIntentBits, REST, Routes, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Initialisation sécurisée des modules
let setupFuncs;
try {
    setupFuncs = require('./setup');
} catch (e) {
    console.error("[ERREUR] Impossible de charger ./setup.js :", e.message);
    setupFuncs = { setupCorporateStructure: null, initRegisters: null };
}

const { handleInteraction } = require('./events/interactionCreate');

// Serveur Web pour Render
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Nairibot est en ligne !\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`[RENDER] Serveur web actif sur le port ${PORT}`);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Map();
const commands = [];
const commandsPath = path.join(__dirname, 'commands');

if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
        }
    }
}

client.once(Events.ClientReady, async () => {
    console.log(`[NAIRI OS] Connecté en tant que ${client.user.tag}`);

    // Initialisation de la structure et des registres
    for (const [id, guild] of client.guilds.cache) {
        try {
            if (setupFuncs.setupCorporateStructure) {
                await setupFuncs.setupCorporateStructure(guild);
            }
            if (setupFuncs.initRegisters) {
                await setupFuncs.initRegisters(guild);
            }
            console.log(`[NAIRI OS] Initialisation terminée pour : ${guild.name}`);
        } catch (error) {
            console.error(`[NAIRI OS] Erreur init pour ${guild.name}:`, error);
        }
    }

    // Enregistrement commandes
    if (process.env.DISCORD_TOKEN) {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        try {
            await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
            console.log('[NAIRI OS] Commandes slash enregistrées.');
        } catch (error) {
            console.error('[NAIRI OS] Erreur enregistrement :', error);
        }
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    try {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (command) await command.execute(interaction);
            return;
        }
        await handleInteraction(interaction);
    } catch (error) {
        console.error("Erreur interaction :", error);
    }
});

client.login(process.env.DISCORD_TOKEN);
