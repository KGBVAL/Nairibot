const { Client, GatewayIntentBits, REST, Routes, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const http = require('http'); // Indispensable pour garder le Web Service Render éveillé

// Création du serveur HTTP configuré pour être parfaitement détecté par Render
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

// Événement de démarrage (Prêt)
client.once(Events.ClientReady, async () => {
    console.log(`[NAIRI OS] Connecté en tant que ${client.user.tag}`);

    // Enregistrement des commandes slash auprès de Discord
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
        if (!interaction.isChatInputCommand()) return;
        const command = client.commands.get(interaction.commandName);
        if (command) {
            await command.execute(interaction);
        }
    } catch (error) {
        console.error("Erreur interaction :", error);
        if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: "Une erreur est survenue lors de l'exécution.", ephemeral: true }).catch(() => {});
        }
    }
});

// Connexion du bot via la variable d'environnement
client.login(process.env.DISCORD_TOKEN);
