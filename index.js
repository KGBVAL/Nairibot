const { Client, GatewayIntentBits, REST, Routes, Events, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Importation depuis le dossier utils
const { handleInteraction } = require('./events/interactionCreate');

// Serveur Web pour Render
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Little Armenia Bot est en ligne !\n');
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
            client.commands.set(command.commandName || command.data.name, command);
            commands.push(command.data.toJSON());
        }
    }
}

// Fonction pour créer automatiquement l'arborescence du projet Little Armenia & Post Op
async function setupCommunityStructure(guild) {
    try {
        console.log(`[LITTLE ARMENIA] Vérification de la structure pour : ${guild.name}`);

        // Définition de l'arborescence souhaitée
        const structure = [
            {
                categoryName: '📌 ┆ INFORMATIONS',
                channels: [
                    { name: 'annonces', type: ChannelType.GuildText },
                    { name: 'calendrier-2026', type: ChannelType.GuildText },
                    { name: 'presse-et-medias', type: ChannelType.GuildText }
                ]
            },
            {
                categoryName: '🏛️ ┆ L\'ASSOCIATION',
                channels: [
                    { name: 'discussions', type: ChannelType.GuildText },
                    { name: 'propositions-citoyennes', type: ChannelType.GuildText },
                    { name: 'commerces-et-partenariats', type: ChannelType.GuildText },
                    { name: 'recrutement', type: ChannelType.GuildText }
                ]
            },
            {
                categoryName: '📦 ┆ POST OP LOGISTICS',
                channels: [
                    { name: 'annonces-post-op', type: ChannelType.GuildText },
                    { name: 'commandes', type: ChannelType.GuildText },
                    { name: 'services', type: ChannelType.GuildText },
                    { name: 'recrutement-interne', type: ChannelType.GuildText },
                    { name: 'salle-de-pause', type: ChannelType.GuildText }
                ]
            }
        ];

        for (const catData of structure) {
            // Cherche si la catégorie existe déjà
            let category = guild.channels.cache.find(
                c => c.type === ChannelType.GuildCategory && c.name.toLowerCase() === catData.categoryName.toLowerCase()
            );

            // Si elle n'existe pas, on la crée
            if (!category) {
                category = await guild.channels.create({
                    name: catData.categoryName,
                    type: ChannelType.GuildCategory,
                });
                console.log(`[LITTLE ARMENIA] Catégorie créée : ${catData.categoryName}`);
            }

            // Vérifie et crée les salons associés dans cette catégorie
            for (const chanData of catData.channels) {
                const existingChan = guild.channels.cache.find(
                    c => c.parentId === category.id && c.name === chanData.name
                );

                if (!existingChan) {
                    await guild.channels.create({
                        name: chanData.name,
                        type: chanData.type,
                        parent: category.id,
                    });
                    console.log(`[LITTLE ARMENIA] Salon créé : #${chanData.name} dans ${catData.categoryName}`);
                }
            }
        }
        console.log(`[LITTLE ARMENIA] Structure initialisée avec succès pour ${guild.name}`);
    } catch (error) {
        console.error(`[LITTLE ARMENIA] Erreur lors de la configuration de la structure :`, error);
    }
}

client.once(Events.ClientReady, async () => {
    console.log(`[LITTLE ARMENIA BOT] Connecté en tant que ${client.user.tag}`);

    // Initialisation de la structure sur chaque serveur où est le bot
    for (const [id, guild] of client.guilds.cache) {
        try {
            await setupCommunityStructure(guild);
        } catch (error) {
            console.error(`[LITTLE ARMENIA BOT] Erreur init structure pour ${guild.name}:`, error);
        }
    }

    // Enregistrement des commandes slash
    if (process.env.DISCORD_TOKEN) {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        try {
            await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
            console.log('[LITTLE ARMENIA BOT] Commandes slash enregistrées.');
        } catch (error) {
            console.error('[LITTLE ARMENIA BOT] Erreur enregistrement commandes :', error);
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

// Vérification du token et connexion à Discord
console.log("[DEBUG] Tentative de connexion avec le token :", process.env.DISCORD_TOKEN ? "Token présent (longueur: " + process.env.DISCORD_TOKEN.length + ")" : "AUCUN TOKEN TROUVÉ !");

client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error("[LITTLE ARMENIA BOT] Erreur fatale lors de la connexion à Discord :", error);
});
