const { ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

const CATEGORY_NAIRI = "NAIRI CORPORATION";
const CATEGORY_ADMIN = "ADMINISTRATION";
const CATEGORY_COMPTA = "COMPTABILITÉ";
const CATEGORY_LOGISTICS = "NAIRI LOGISTICS";
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
                reason: "Rôle exécutif requis pour le pilotage de l'OS Nairi."
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

        // --- SECTION 1 : NAIRI CORPORATION ---
        let catNairi = guild.channels.cache.find(c => c.name === CATEGORY_NAIRI && c.type === ChannelType.GuildCategory);
        if (!catNairi) {
            catNairi = await guild.channels.create({ name: CATEGORY_NAIRI, type: ChannelType.GuildCategory });
        }

        let secretariat = guild.channels.cache.find(c => c.name === "secrétariat" && c.parentId === catNairi.id);
        if (!secretariat) {
            secretariat = await guild.channels.create({
                name: "secrétariat",
                type: ChannelType.GuildText,
                parent: catNairi.id,
                topic: "Terminal sécurisé Nairi Corporation. Point d'entrée unique pour toutes vos requêtes.",
                permissionOverwrites: [{
                    id: guild.roles.everyone,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
                    deny: [PermissionsBitField.Flags.SendMessages],
                }]
            });
            await sendSecretariatPanel(secretariat);
        } else {
            await ensurePanelExists(secretariat, "NAIRI CORPORATION — SECRÉTARIAT EXÉCUTIF", sendSecretariatPanel);
        }

        let annonces = guild.channels.cache.find(c => c.name === "annonces" && c.parentId === catNairi.id);
        if (!annonces) {
            annonces = await guild.channels.create({
                name: "annonces",
                type: ChannelType.GuildText,
                parent: catNairi.id,
                topic: "Flux officiel des communiqués de Nairi Corporation.",
                permissionOverwrites: [{
                    id: guild.roles.everyone,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
                    deny: [PermissionsBitField.Flags.SendMessages],
                }]
            });
        }

        let services = guild.channels.cache.find(c => c.name === "services" && c.parentId === catNairi.id);
        if (!services) {
            services = await guild.channels.create({
                name: "services",
                type: ChannelType.GuildText,
                parent: catNairi.id,
                topic: "Catalogue des services et prestations Nairi Corporation.",
                permissionOverwrites: [{
                    id: guild.roles.everyone,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
                    deny: [PermissionsBitField.Flags.SendMessages],
                }]
            });
            await sendServicesPanel(services);
        } else {
            await ensurePanelExists(services, "NAIRI CORPORATION  //  NOS SERVICES", sendServicesPanel);
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
                topic: "Poste de commandement exécutif de la direction.",
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
            await ensurePanelExists(bureau, "NAIRI OS // POSTE DE COMMANDEMENT EXÉCUTIF", sendBureauPanel);
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
                topic: "Registre financier et flux de trésorerie.",
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
                topic: "Suivi logistique et opérations de négoce.",
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

        // --- SECTION 4 : NAIRI LOGISTICS ---
        let catLogistics = guild.channels.cache.find(c => c.name === CATEGORY_LOGISTICS && c.type === ChannelType.GuildCategory);
        if (!catLogistics) {
            catLogistics = await guild.channels.create({ name: CATEGORY_LOGISTICS, type: ChannelType.GuildCategory });
        }

        // 1. Salon #livraison
        let livraison = guild.channels.cache.find(c => c.name === "livraison" && c.parentId === catLogistics.id);
        if (!livraison) {
            livraison = await guild.channels.create({
                name: "livraison",
                type: ChannelType.GuildText,
                parent: catLogistics.id,
                topic: "Terminal logistique. Demandez une livraison par nos camions ou planifiez vos transports.",
                permissionOverwrites: [{
                    id: guild.roles.everyone,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
                    deny: [PermissionsBitField.Flags.SendMessages],
                }]
            });
            await sendLivraisonPanel(livraison);
        } else {
            await ensurePanelExists(livraison, "NAIRI LOGISTICS — SERVICE DE LIVRAISON", sendLivraisonPanel);
        }

        // 2. Salon #recrutement
        let recrutement = guild.channels.cache.find(c => c.name === "recrutement" && c.parentId === catLogistics.id);
        if (!recrutement) {
            recrutement = await guild.channels.create({
                name: "recrutement",
                type: ChannelType.GuildText,
                parent: catLogistics.id,
                topic: "Rejoignez l'équipe Nairi Logistics.",
                permissionOverwrites: [{
                    id: guild.roles.everyone,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
                    deny: [PermissionsBitField.Flags.SendMessages],
                }]
            });
            await sendRecrutementPanel(recrutement);
        } else {
            await ensurePanelExists(recrutement, "NAIRI LOGISTICS — RECRUTEMENT CHAUFFEURS", sendRecrutementPanel);
        }

        // 3. Salon #services
        let servicesLog = guild.channels.cache.find(c => c.name === "services" && c.parentId === catLogistics.id);
        if (!servicesLog) {
            servicesLog = await guild.channels.create({
                name: "services",
                type: ChannelType.GuildText,
                parent: catLogistics.id,
                topic: "Catalogue des prestations de transport et solutions logistiques.",
                permissionOverwrites: [{
                    id: guild.roles.everyone,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
                    deny: [PermissionsBitField.Flags.SendMessages],
                }]
            });
            await sendServicesLogPanel(servicesLog);
        } else {
            await ensurePanelExists(servicesLog, "NAIRI LOGISTICS  //  SERVICES", sendServicesLogPanel);
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
        title: "NAIRI CORPORATION — SECRÉTARIAT EXÉCUTIF",
        description: "Canal de transmission officiel. Ce terminal centralisé permet l'enregistrement de vos mandats, demandes de négoce, contrats ou partenariats.\n\n*Cliquez ci-dessous pour ouvrir un dossier sécurisé.*",
        footer: { text: "NAIRI OS • SECURE PROTOCOL v5.0" },
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
        title: "NAIRI CORPORATION  //  NOS SERVICES",
        description: "Bienvenue chez Nairi Corporation.\n\nMaison de négoce et de courtage, nous vous accompagnons de A à Z dans la structuration de vos projets, la gestion administrative et la mise en relation stratégique.",
        fields: [
            {
                name: "01  •  Secrétariat & Gestion Administrative",
                value: "Prise en charge complète de vos dossiers : rédaction de contrats, paperasse et formalités institutionnelles."
            },
            {
                name: "02  •  Négoce & Courtage",
                value: "Recherche de produits ciblés, identification de fournisseurs fiables et négociation des meilleurs tarifs pour votre compte."
            },
            {
                name: "03  •  Mise en Relation & Partenariats",
                value: "Activation de notre consortium d'entreprises partenaires pour répondre à vos besoins spécifiques. Fonctionnement transparent par commission fixe sur transaction."
            },
            {
                name: "04  •  Comptabilité & Trésorerie",
                value: "Suivi rigoureux des flux financiers et sécurisation des règlements entre parties."
            }
        ],
        footer: { text: "NAIRI CORPORATION  •  RÉPERTOIRE DES PRESTATIONS" },
        timestamp: new Date().toISOString()
    };

    await channel.send({ embeds: [embed] });
}

async function sendBureauPanel(channel) {
    const embed = {
        color: 0x111111,
        title: "NAIRI OS // POSTE DE COMMANDEMENT EXÉCUTIF",
        description: "Terminal de gestion centralisé de la direction.\n\nUtilisez l'interface ci-dessous pour administrer les flux de communication, les registres et la sécurité globale de l'infrastructure.",
        footer: { text: "RESTREINT • DIRECTION" },
        timestamp: new Date().toISOString()
    };

    const rowButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('bureau_announcement').setLabel('Publier un Communiqué Officiel').setStyle(ButtonStyle.Secondary)
    );

    const rowMenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('bureau_management_menu')
            .setPlaceholder('Sélectionner un protocole de gestion...')
            .addOptions([
                { label: "Carnet d'adresses", description: 'Consulter la liste des clients et dossiers', value: 'nav_finance' },
                { label: 'Gestion des Partenaires', description: 'Consulter et gérer les alliances', value: 'nav_partners' },
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
        title: "NAIRI LOGISTICS — SERVICE DE LIVRAISON",
        description: "Besoin d'acheminer du fret ou de faire appel à notre flotte de transport ? Soumettez votre demande directement via notre terminal logistique.\n\n*Cliquez ci-dessous pour initialiser une demande de livraison.*",
        footer: { text: "NAIRI LOGISTICS • FREIGHT TERMINAL" },
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
        title: "NAIRI LOGISTICS — RECRUTEMENT CHAUFFEURS",
        description: "Nous recherchons des **Chauffeurs-Livreurs** qualifiés pour assurer le transport de marchandises au sein de notre réseau.\n\n**Profils recherchés :**\n• Maîtrise de la conduite poids lourds et utilitaires.\n• Ponctualité, rigueur et discrétion professionnelle.\n• Respect absolu des protocoles logistiques.\n\n*Cliquez ci-dessous pour postuler.*",
        footer: { text: "NAIRI LOGISTICS • RECRUTEMENT" },
        timestamp: new Date().toISOString()
    };

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('open_logistics_recrutement_modal').setLabel('POSTULER (CHAUFFEUR)').setStyle(ButtonStyle.Secondary)
    );

    await channel.send({ embeds: [embed], components: [row] });
}

async function sendServicesLogPanel(channel) {
    const embed = {
        color: 0x111111,
        title: "NAIRI LOGISTICS  //  SERVICES",
        description: "Découvrez nos solutions professionnelles dédiées au transport et au transit de marchandises.",
        fields: [
            {
                name: "01  •  Transport par Camion & Fret",
                value: "Acheminement sécurisé de marchandises en lots complets ou partiels."
            },
            {
                name: "02  •  Logistique & Planification",
                value: "Étude et mise en place de schémas d'approvisionnement sur-mesure pour vos entreprises."
            },
            {
                name: "03  •  Escorte & Sécurisation de Convoi",
                value: "Accompagnement et protection de vos transports sensibles à travers le réseau."
            }
        ],
        footer: { text: "NAIRI LOGISTICS • PRESTATIONS" },
        timestamp: new Date().toISOString()
    };

    await channel.send({ embeds: [embed] });
}

module.exports = { setupCorporateStructure };
