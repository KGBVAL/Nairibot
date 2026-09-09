const { Client, GatewayIntentBits, REST, Routes, Events, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Importation des gestionnaires
const { initAllPanels, handleManagersInteraction } = require('./utils/Manager');
const { initPostOpPanels, handlePostOpInteraction } = require('./postop');

// Serveur Web pour Render
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Little Armenia & Post Op Bot est en ligne !\n');
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

// Fonction de création de l'arborescence complète et propre
async function setupCommunityStructure(guild) {
    try {
        console.log(`[LITTLE ARMENIA] Vérification de la structure pour : ${guild.name}`);

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
            },
            {
                categoryName: '💼 ┆ ADMINISTRATION',
                channels: [
                    { name: 'comptabilite', type: ChannelType.GuildText },
                    { name: 'bureau', type: ChannelType.GuildText }
                ]
            }
        ];

        for (const catData of structure) {
            let category = guild.channels.cache.find(
                c => c.type === ChannelType.GuildCategory && c.name.toLowerCase() === catData.categoryName.toLowerCase()
            );

            if (!category) {
                category = await guild.channels.create({
                    name: catData.categoryName,
                    type: ChannelType.GuildCategory,
                });
                console.log(`[SETUP] Catégorie créée : ${catData.categoryName}`);
            }

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
                    console.log(`[SETUP] Salon créé : #${chanData.name}`);
                }
            }
        }

        // Lancement de l'initialisation des panneaux après un court délai pour laisser le cache se synchroniser
        setTimeout(async () => {
            await initAllPanels(guild);
            await initPostOpPanels(guild);
            console.log(`[LITTLE ARMENIA & POST OP] Panneaux initialisés avec succès pour ${guild.name}`);
        }, 4000);

    } catch (error) {
        console.error(`[LITTLE ARMENIA] Erreur lors de la configuration de la structure :`, error);
    }
}

client.once(Events.ClientReady, async () => {
    console.log(`[LITTLE ARMENIA BOT] Connecté en tant que ${client.user.tag}`);

    for (const [id, guild] of client.guilds.cache) {
        try {
            await setupCommunityStructure(guild);
        } catch (error) {
            console.error(`[LITTLE ARMENIA BOT] Erreur init structure pour ${guild.name}:`, error);
        }
    }

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

// Routeur central des interactions (gestionnaires unifiés + postop + commandes slash)
client.on(Events.InteractionCreate, async (interaction) => {
    try {
        // Routeur Manager existant
        if (
            interaction.customId && 
            (
                interaction.customId.startsWith('ctrl_') || 
                interaction.customId.startsWith('acc_') || 
                interaction.customId.startsWith('mod_')
            )
        ) {
            await handleManagersInteraction(interaction);
            return;
        }

        // Routeur Post Op Logistics (`postop.js`)
        if (
            interaction.customId &&
            (
                interaction.customId === 'menu_ticket_commande' ||
                interaction.customId === 'menu_ticket_recrutement' ||
                interaction.customId.startsWith('mod_ticket_') ||
                interaction.customId.startsWith('btn_claim_') ||
                interaction.customId.startsWith('btn_close_')
            )
        ) {
            await handlePostOpInteraction(interaction);
            return;
        }

        // Commandes Slash
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (command) await command.execute(interaction);
            return;
        }
    } catch (error) {
        console.error("Erreur interaction :", error);
    }
});

console.log("[DEBUG] Tentative de connexion avec le token...");
client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error("[LITTLE ARMENIA BOT] Erreur fatale lors de la connexion à Discord :", error);
});
