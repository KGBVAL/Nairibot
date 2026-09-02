const { ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, MessageFlags } = require('discord.js');

const CATEGORY_IMEX = "IMEX CORPORATION";
const CATEGORY_ADMIN = "ADMINISTRATION";
const CATEGORY_COMPTA = "COMPTABILITÉ";
const CATEGORY_LOGISTICS = "IMEX TRUCKING & LOGISTICS";
const ROLE_NAME = "DIRECTEUR";
const ROLE_DIRECTION = "Direction";

async function setupCorporateStructure(guild) {
    try {
        let directorRole = guild.roles.cache.find(r => r.name === ROLE_NAME);
        if (!directorRole) {
            directorRole = await guild.roles.create({
                name: ROLE_NAME,
                color: 0x111111,
                permissions: [PermissionsBitField.Flags.Administrator],
                reason: "Rôle exécutif requis pour le pilotage de l'OS IMEX."
            });
        }

        let directionRole = guild.roles.cache.find(r => r.name === ROLE_DIRECTION);
        if (!directionRole) {
            directionRole = await guild.roles.create({
                name: ROLE_DIRECTION,
                color: 0x111111,
                reason: "Rôle de direction opérationnelle."
            });
        }

        // --- NETTOYAGE DES ANCIENS SALONS / DOUBLONS OBSOLÈTES ---
        const obsoleteChannelsIds = ["1541800519918690314", "1541800535181758615", "1544789313731170305"];
        for (const chId of obsoleteChannelsIds) {
            const ch = guild.channels.cache.get(chId);
            if (ch) {
                await ch.delete("Suppression de l'ancienne infrastructure / doublons obsolètes").catch(() => {});
            }
        }
        
        const oldCatNairi = guild.channels.cache.find(c => c.name === "NAIRI CORPORATION" && c.type === ChannelType.GuildCategory);
        if (oldCatNairi) {
            await oldCatNairi.delete("Mise à jour vers IMEX Corporation").catch(() => {});
        }
        const oldCatLog = guild.channels.cache.find(c => c.name === "NAIRI LOGISTICS & AUTOMOTIVE" && c.type === ChannelType.GuildCategory);
        if (oldCatLog) {
            await oldCatLog.delete("Mise à jour vers IMEX Trucking").catch(() => {});
        }

        // --- SECTION 1 : IMEX CORPORATION ---
        let catImex = guild.channels.cache.find(c => c.name === CATEGORY_IMEX && c.type === ChannelType.GuildCategory);
        if (!catImex) {
            catImex = await guild.channels.create({ name: CATEGORY_IMEX, type: ChannelType.GuildCategory });
        }

        let secretariat = guild.channels.cache.find(c => c.name === "secrétariat" && c.parentId === catImex.id);
        if (!secretariat) {
            secretariat = await guild.channels.create({
                name: "secrétariat",
                type: ChannelType.GuildText,
                parent: catImex.id,
                topic: "Terminal sécurisé IMEX Corporation. Initialisation des requêtes de transport.",
                permissionOverwrites: [{
                    id: guild.roles.everyone,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
                    deny: [PermissionsBitField.Flags.SendMessages],
                }]
            });
            await sendSecretariatPanel(secretariat);
        } else {
            await ensurePanelExists(secretariat, "IMEX CORPORATION — SECRÉTARIAT EXÉCUTIF", sendSecretariatPanel);
        }

        let annonces = guild.channels.cache.find(c => c.name === "annonces" && c.parentId === catImex.id);
        if (!annonces) {
            annonces = await guild.channels.create({
                name: "annonces",
                type: ChannelType.GuildText,
                parent: catImex.id,
                topic: "Flux officiel des communiqués d'IMEX Corporation.",
                permissionOverwrites: [{
                    id: guild.roles.everyone,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
                    deny: [PermissionsBitField.Flags.SendMessages],
                }]
            });
        }

        let allServicesChannels = guild.channels.cache.filter(c => c.name === "services" && c.type === ChannelType.GuildText);
        let servicesImex = allServicesChannels.find(c => c.parentId === catImex.id);
        if (!servicesImex) {
            servicesImex = await guild.channels.create({
                name: "services",
                type: ChannelType.GuildText,
                parent: catImex.id,
                topic: "Catalogue des services et prestations de transport IMEX.",
                permissionOverwrites: [{
                    id: guild.roles.everyone,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
                    deny: [PermissionsBitField.Flags.SendMessages],
                }]
            });
            await sendServicesPanel(servicesImex);
        } else {
            await ensurePanelExists(servicesImex, "IMEX CORPORATION  //  NOS SERVICES", sendServicesPanel);
        }

        // --- SECTION 2 : ADMINISTRATION ---
        let catAdmin = guild.channels.cache.find(c => c.name === CATEGORY_ADMIN && c.type === ChannelType.GuildCategory);
        if (!catAdmin) {
            catAdmin = await guild.channels.create({ name: CATEGORY_ADMIN, type: ChannelType.GuildCategory });
        }

        let bureau = guild.channels.cache.find(c => c.name === "bureau" && c.parentId === catAdmin.id);
        if (!bureau) {
            bureau = await guild.channels.create({
                name: "bureau",
                type: ChannelType.GuildText,
                parent: catAdmin.id,
                topic: "Poste de commandement exécutif de la direction IMEX.",
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    ...(directorRole ? [{
                        id: directorRole.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.ManageChannels],
                    }] : [])
                ]
            });
            await sendBureauPanel(bureau);
        } else {
            await ensurePanelExists(bureau, "IMEX OS // POSTE DE COMMANDEMENT EXÉCUTIF", sendBureauPanel);
        }

        // --- SECTION 3 : COMPTABILITÉ ---
        let catCompta = guild.channels.cache.find(c => c.name === CATEGORY_COMPTA && c.type === ChannelType.GuildCategory);
        if (!catCompta) {
            catCompta = await guild.channels.create({ name: CATEGORY_COMPTA, type: ChannelType.GuildCategory });
        }

        let finance = guild.channels.cache.find(c => c.name === "finance" && c.parentId === catCompta.id);
        if (!finance) {
            finance = await guild.channels.create({
                name: "finance",
                type: ChannelType.GuildText,
                parent: catCompta.id,
                topic: "Registre financier, bilans de fret et flux de trésorerie.",
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    ...(directorRole ? [{
                        id: directorRole.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                    }] : [])
                ]
            });
        }

        let logistiqueCompta = guild.channels.cache.find(c => c.name === "logistique" && c.parentId === catCompta.id);
        if (!logistiqueCompta) {
            logistiqueCompta = await guild.channels.create({
                name: "logistique",
                type: ChannelType.GuildText,
                parent: catCompta.id,
                topic: "Suivi comptable des lignes de transport et contrats de fret.",
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    ...(directorRole ? [{
                        id: directorRole.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                    }] : [])
                ]
            });
        }

        // --- SECTION 4 : IMEX TRUCKING & LOGISTICS ---
        let catLogistics = guild.channels.cache.find(c => c.name === CATEGORY_LOGISTICS && c.type === ChannelType.GuildCategory);
        if (!catLogistics) {
            catLogistics = await guild.channels.create({ name: CATEGORY_LOGISTICS, type: ChannelType.GuildCategory });
        }

        let livraison = guild.channels.cache.find(c => c.name === "livraison" && c.parentId === catLogistics.id);
        if (!livraison) {
            livraison = await guild.channels.create({
                name: "livraison",
                type: ChannelType.GuildText,
                parent: catLogistics.id,
                topic: "Terminal logistique transport. Planifiez vos livraisons par nos semi-remorques et camions.",
                permissionOverwrites: [{
                    id: guild.roles.everyone,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
                    deny: [PermissionsBitField.Flags.SendMessages],
                }]
            });
            await sendLivraisonPanel(livraison);
        } else {
            await ensurePanelExists(livraison, "IMEX TRUCKING — SERVICE DE LIVRAISON", sendLivraisonPanel);
        }

        let recrutement = guild.channels.cache.find(c => c.name === "recrutement" && c.parentId === catLogistics.id);
        if (!recrutement) {
            recrutement = await guild.channels.create({
                name: "recrutement",
                type: ChannelType.GuildText,
                parent: catLogistics.id,
                topic: "Rejoignez l'équipe IMEX Trucking en tant que chauffeur routier.",
                permissionOverwrites: [{
                    id: guild.roles.everyone,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
                    deny: [PermissionsBitField.Flags.SendMessages],
                }]
            });
            await sendRecrutementPanel(recrutement);
        } else {
            await ensurePanelExists(recrutement, "IMEX TRUCKING — RECRUTEMENT CHAUFFEURS", sendRecrutementPanel);
        }

        // Salon spécifique ID : 1544790338001047563 (prise-de-service)
        let priseService = guild.channels.cache.get("1544790338001047563") || guild.channels.cache.find(c => c.name === "prise-de-service" && c.parentId === catLogistics.id);
        if (!priseService) {
            priseService = await guild.channels.create({
                name: "prise-de-service",
                type: ChannelType.GuildText,
                parent: catLogistics.id,
                topic: "Prise de service des chauffeurs et verrouillage/gestion des camions de la flotte.",
                permissionOverwrites: [{
                    id: guild.roles.everyone,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
                    deny: [PermissionsBitField.Flags.SendMessages],
                }]
            });
            await sendPriseServicePanel(priseService);
        } else {
            // S'assure qu'il est bien placé dans la catégorie logistique
            if (priseService.parentId !== catLogistics.id) {
                await priseService.setParent(catLogistics.id).catch(() => {});
            }
            await ensurePanelExists(priseService, "IMEX TRUCKING — PRISE DE SERVICE & CAMIONS", sendPriseServicePanel);
        }

    } catch (error) {
        console.error("Erreur critique d'infrastructure :", error);
    }
}

async function ensurePanelExists(channel, titleIdentifier, sendFunction) {
    try {
        const messages = await channel.messages.fetch({ limit: 10 });
        const exists = messages.some(m => m.embeds && m.embeds.length > 0 && m.embeds[0].title && m.embeds[0].title.includes(titleIdentifier));
        if (!exists) {
            await sendFunction(channel);
        }
    } catch (e) {
        console.error(`Erreur lors de la vérification du panneau dans ${channel.name}:`, e);
    }
}

async function sendSecretariatPanel(channel) {
    const embed = {
        color: 0x111111,
        title: "IMEX CORPORATION — SECRÉTARIAT EXÉCUTIF",
        description: "Canal de transmission officiel. Ce terminal permet l'enregistrement de contrats de fret, de mandats logistiques et de dossiers administratifs.\n\n*Cliquez ci-dessous pour ouvrir un dossier sécurisé.*",
        footer: { text: "IMEX OS • SECURE PROTOCOL v5.0" },
        timestamp: new Date().toISOString()
    };

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('open_secretariat_modal').setLabel('OUVRIR UN DOSSIER').setStyle(ButtonStyle.Secondary)
    );

    await channel.send({ embeds: [embed], components: [row] });
}

async function sendServicesPanel(channel) {
    const embed = {
        color: 0x111111,
        title: "IMEX CORPORATION  //  NOS SERVICES",
        description: "Bienvenue chez IMEX Corporation, expert en transport routier et logistique de fret.\n\nNous assurons l'acheminement de vos marchandises et connectons les acteurs du transport.",
        fields: [
            {
                name: "01  •  Transport Routier & Fret",
                value: "Acheminement sécurisé de marchandises en lots complets ou partiels à travers tout le réseau."
            },
            {
                name: "02  •  Logistique & Gestion de Flotte",
                value: "Mise à disposition de véhicules industriels et gestion rigoureuse des plannings de livraison."
            },
            {
                name: "03  •  Partenariats & Sous-traitance",
                value: "Interconnexion avec des transporteurs agréés pour absorber les pics de fret.\n\n*Fonctionnement en synergie professionnelle sécurisée.*"
            },
            {
                name: "04  •  Comptabilité & Facturation",
                value: "Suivi financier précis des missions de transport et des règlements de fret."
            }
        ],
        footer: { text: "IMEX CORPORATION  •  RÉPERTOIRE DES PRESTATIONS" },
        timestamp: new Date().toISOString()
    };

    await channel.send({ embeds: [embed] });
}

async function sendBureauPanel(channel) {
    const embed = {
        color: 0x111111,
        title: "IMEX OS // POSTE DE COMMANDEMENT EXÉCUTIF",
        description: "Terminal de gestion centralisé de la direction.\n\nUtilisez l'interface ci-dessous pour administrer les flux de communication vers le salon direction (`1544638192618307644`), les registres et la sécurité globale de l'infrastructure.",
        footer: { text: "RESTREINT • DIRECTION" },
        timestamp: new Date().toISOString()
    };

    const rowButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('bureau_announcement').setLabel('Publier un Communiqué Interne').setStyle(ButtonStyle.Secondary)
    );

    const rowMenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('bureau_management_menu')
            .setPlaceholder('Sélectionner un protocole de gestion...')
            .addOptions([
                { label: "Registre des Transports", description: 'Consulter la liste des missions et dossiers', value: 'nav_finance' },
                { label: 'Gestion des Partenaires', description: 'Consulter et gérer les alliances de transport', value: 'nav_partners' },
                { label: 'Expulser un membre (Kick)', description: 'Sélectionner un membre à expulser', value: 'mod_kick_select' },
                { label: 'Bannir un membre (Ban)', description: 'Sélectionner un membre à bannir', value: 'mod_ban_select' },
                { label: 'Nettoyer le salon (Purge)', description: 'Effacer les messages en masse', value: 'mod_purge' },
                { label: 'Verrouillage d\'urgence (Lockdown)', description: 'Bloquer l\'écriture sur le serveur en cas de crise', value: 'mod_lockdown' }
            ])
    );

    await channel.send({ embeds: [embed], components: [rowButton, rowMenu] });
}

async function sendLivraisonPanel(channel) {
    const embed = {
        color: 0x111111,
        title: "IMEX TRUCKING — SERVICE DE LIVRAISON",
        description: "Besoin d'acheminer du fret ou de planifier un transport par semi-remorque ? Soumettez votre demande directement via notre terminal.\n\n*Cliquez ci-dessous pour initialiser une demande de livraison.*",
        footer: { text: "IMEX TRUCKING • FREIGHT TERMINAL" },
        timestamp: new Date().toISOString()
    };

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('open_livraison_modal').setLabel('DEMANDER UNE LIVRAISON').setStyle(ButtonStyle.Secondary)
    );

    await channel.send({ embeds: [embed], components: [row] });
}

async function sendRecrutementPanel(channel) {
    const embed = {
        color: 0x111111,
        title: "IMEX TRUCKING — RECRUTEMENT CHAUFFEURS",
        description: "Nous recherchons des **Chauffeurs Routiers** qualifiés pour assurer le transport de fret et piloter notre flotte de camions.\n\n**Profils recherchés :**\n• Maîtrise de la conduite de poids lourds.\n• Ponctualité, rigueur et respect des délais de livraison.\n• Respect strict des consignes de sécurité routière.\n\n*Cliquez ci-dessous pour postuler et ouvrir un ticket de recrutement.*",
        footer: { text: "IMEX TRUCKING • RECRUTEMENT" },
        timestamp: new Date().toISOString()
    };

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('open_logistics_recrutement_modal').setLabel('POSTULER (CHAUFFEUR)').setStyle(ButtonStyle.Secondary)
    );

    await channel.send({ embeds: [embed], components: [row] });
}

async function sendPriseServicePanel(channel) {
    const embed = {
        color: 0x111111,
        title: "IMEX TRUCKING — PRISE DE SERVICE & CAMIONS",
        description: "Terminal opérateur pour la gestion de service et la flotte.\n\n• **Prendre / Quitter son service** pour enregistrer en temps réel votre vacation et indiquer obligatoirement le nom de votre camion.\n• **Verrouiller/Déverrouiller son camion** assigné pour sécuriser votre matériel.",
        footer: { text: "IMEX TRUCKING • FLEET & DUTY CONTROL" },
        timestamp: new Date().toISOString()
    };

    // Le bouton déclenche un Modal demandant le nom du camion et le statut
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('open_duty_modal').setLabel('GÉRER SON SERVICE & CAMION').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('toggle_truck_lock').setLabel('VERROUILLER / DÉVERROUILLER CAMION').setStyle(ButtonStyle.Secondary)
    );

    await channel.send({ embeds: [embed], components: [row] });
}

// --- GESTIONNAIRE D'INTERACTION ASSOCIÉ (À placer dans votre gestionnaire d'événements global interactionCreate) ---
async function handleDutyInteractions(interaction) {
    // 1. Clic sur le bouton de gestion de service -> Ouvre la modale
    if (interaction.isButton() && interaction.customId === 'open_duty_modal') {
        const modal = new ModalBuilder()
            .setCustomId('modal_duty_submit')
            .setTitle('IMEX TRUCKING // GESTION DE SERVICE');

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('truck_name')
                    .setLabel("NOM / NUMÉRO DU CAMION")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder("Ex: Mack Anthem #04, Kenworth W900...")
                    .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('duty_action')
                    .setLabel("STATUT (EN SERVICE ou FIN DE SERVICE)")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder("Tapez 'EN SERVICE' ou 'FIN DE SERVICE'")
                    .setRequired(true)
            )
        );

        return await interaction.showModal(modal);
    }

    // 2. Validation de la modale de service -> Enregistrement en temps réel dans le salon
    if (interaction.isModalSubmit() && interaction.customId === 'modal_duty_submit') {
        const truckName = interaction.fields.getTextInputValue('truck_name');
        const dutyAction = interaction.fields.getTextInputValue('duty_action').toUpperCase();
        const user = interaction.user;

        const isOnDuty = dutyAction.includes('ENTRER') || dutyAction.includes('EN SERVICE') || dutyAction.includes('ON') || dutyAction.includes('DEBUT');
        const statusText = isOnDuty ? "🟢 EN SERVICE" : "🔴 FIN DE SERVICE";

        // Publication en temps réel dans le salon "prise-de-service" (ID: 1544790338001047563 ou par nom)
        const dutyChannel = interaction.guild.channels.cache.get("1544790338001047563") || interaction.guild.channels.cache.find(c => c.name === "prise-de-service");
        
        if (dutyChannel) {
            await dutyChannel.send({
                content: `Mise à jour flotte & service : L'opérateur **${user}** passe **${statusText}** à bord du véhicule désigné : \`${truckName}\`.`
            }).catch(() => {});
        }

        return await interaction.reply({
            content: `Votre statut a bien été pris en compte : **${statusText}** avec le camion **${truckName}**.`,
            flags: MessageFlags.Ephemeral
        });
    }
}

module.exports = { setupCorporateStructure, handleDutyInteractions };
