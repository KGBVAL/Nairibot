const { Client, GatewayIntentBits, REST, Routes, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Importation de la fonction de setup (assure-toi que le fichier s'appelle bien setup.js dans le même dossier)
const { setupCorporateStructure } = require('./setup'); 
const { handleInteraction } = require('./events/interactionCreate');

// Création du serveur HTTP pour Render
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

// Chargement des commandes slash
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

// Événement de démarrage
client.once(Events.ClientReady, async () => {
    console.log(`[NAIRI OS] Connecté en tant que ${client.user.tag}`);

    // --- INITIALISATION DE LA STRUCTURE CORPORATE ---
    for (const [id, guild] of client.guilds.cache) {
        try {
            await setupCorporateStructure(guild);
            console.log(`[NAIRI OS] Structure corporate vérifiée/initialisée pour : ${guild.name}`);
        } catch (error) {
            console.error(`[NAIRI OS] Erreur lors de l'initialisation pour ${guild.name}:`, error);
        }
    }

    // Enregistrement des commandes slash
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log('[NAIRI OS] Enregistrement des commandes slash...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('[NAIRI OS] Commandes slash enregistrées avec succès !');
    } catch (error) {
        console.error('[NAIRI OS] Erreur enregistrement commandes :', error);
    }
});

// Gestionnaire central des interactions
client.on(Events.InteractionCreate, async (interaction) => {
    try {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (command) {
                await command.execute(interaction);
                return;
            }
        }

        await handleInteraction(interaction);

    } catch (error) {
        console.error("Erreur interaction :", error);
        if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: "Une erreur est survenue lors de l'exécution.", ephemeral: true }).catch(() => {});
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
