const { Client, GatewayIntentBits, REST, Routes, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { setupCorporateStructure } = require('./utils/corporateSetup');
const { initRegisters } = require('./utils/corporateRegisters');
const { handleInteraction } = require('./events/interactionCreate');

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

// Événement de démarrage (Prêt) corrigé avec Events.ClientReady
client.once(Events.ClientReady, async () => {
    console.log(`[NAIRI OS] Connecté en tant que ${client.user.tag}`);

    // Enregistrement des commandes slash auprès de Discord
    const rest = new REST({ version: '10' }).setToken('MTUzOTI1MTgwMzY4MDQwNzU5Mg.GG3QRY.3qi7klhneFAp8hWdoIkEt9DYBbQFgRz2Y6Fy30');
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

    const guild = client.guilds.cache.first();
    if (!guild) {
        console.error("[NAIRI OS] Erreur : Aucun serveur trouvé.");
        return;
    }

    try {
        await setupCorporateStructure(guild);
        await initRegisters(guild);
        console.log("[NAIRI OS] Infrastructure et registres synchronisés.");
    } catch (error) {
        console.error("[NAIRI OS] Erreur lors de l'initialisation :", error);
    }
});

// Gestionnaire central des interactions
client.on(Events.InteractionCreate, async (interaction) => {
    try {
        // Si c'est une commande slash, on gère l'exécution ici
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (command) {
                await command.execute(interaction);
                return;
            }
        }
        // Sinon, on passe au gestionnaire global existant
        await handleInteraction(interaction);
    } catch (error) {
        console.error("Erreur interaction :", error);
        if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: "Une erreur est survenue lors de l'exécution.", ephemeral: true }).catch(() => {});
        }
    }
});

// Connexion du bot
client.login('MTUzOTI1MTgwMzY4MDQwNzU5Mg.GG3QRY.3qi7klhneFAp8hWdoIkEt9DYBbQFgRz2Y6Fy30');