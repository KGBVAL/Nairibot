const { ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

const CATEGORY_NAIRI = "NAIRI CORPORATION";
const CATEGORY_ADMIN = "ADMINISTRATION";
const CATEGORY_COMPTA = "COMPTABILITÉ";
const CATEGORY_LOGISTICS = "NAIRI LOGISTICS & AUTOMOTIVE";
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
                topic: "Terminal sécurisé Nairi Corporation. Initialisation des requêtes.",
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

        // --- SECTION 4 : NAIRI LOGISTICS & AUTOMOTIVE ---
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
                topic: "Rejoignez l'équipe Nairi Logistics & Automotive.",
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

        // 4. Salon #catalogue
        let catalogue = guild.channels.cache.find(c => c.name === "catalogue" && c.parentId === catLogistics.id);
        if (!catalogue) {
            catalogue = await guild.channels.create({
                name: "catalogue",
                type: ChannelType.GuildText,
                parent: catLogistics.id,
                topic: "Flotte de véhicules disponibles à la location (Seule ou avec chauffeur).",
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
                        deny: [PermissionsBitField.Flags.SendMessages],
                    },
                    ...(directorRole ? [{
                        id: directorRole.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageMessages],
                    }] : []),
                    ...(directionRole ? [{
                        id: directionRole.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageMessages],
                    }] : [])
                ]
            });
            await sendCatalogueAdminPanel(catalogue);
        } else {
            await ensurePanelExists(catalogue, "NAIRI LOGISTICS — GESTION DU CATALOGUE", sendCatalogueAdminPanel);
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
        description: "Canal de transmission officiel. Ce terminal permet l'enregistrement de mandats, d'opérations de négoce et de dossiers administratifs.\n\n*Cliquez ci-dessous pour ouvrir un dossier sécurisé.*",
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
        description: "Bienvenue chez Nairi Corporation.\n\nNous sommes une maison de négoce et de courtage. Notre rôle est de vous accompagner de A à Z : que ce soit pour gérer vos papiers, trouver un client, dénicher un fournisseur ou connecter les bonnes personnes entre elles.",
        fields: [
            {
                name: "01  •  Secrétariat & Gestion Administrative",
                value: "On s'occupe de vos dossiers de A à Z : rédaction de contrats, paperasse, accords et formalités.\n\n*Pour lancer une demande, passez par le salon secrétariat.*"
            },
            {
                name: "02  •  Négoce & Recherche de Partenaires",
                value: "Vous cherchez un produit précis, un fournisseur fiable ou un client pour écouler vos biens ? On fouille notre réseau pour vous trouver la perle rare et on négocie à votre place."
            },
            {
                name: "03  •  Mise en Relation & Commission (%)",
                value: "Vous avez un besoin particulier hors de notre champ direct ? On active nos entreprises partenaires pour y répondre.\n\n*Comment ça marche ? On fonctionne à la commission : on prend un pourcentage fixe sur chaque transaction réussie.*"
            },
            {
                name: "04  •  Comptabilité & Trésorerie",
                value: "Suivi rigoureux des comptes, vérification des règlements et sécurisation de l'argent échangé entre les différentes parties lors des transactions."
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
        description: "Besoin d'acheminer de la marchandise ou de faire appel à nos camions ? Soumettez votre demande de transport directement via notre terminal.\n\n*Cliquez ci-dessous pour initialiser une demande de livraison.*",
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
        description: "Nous recherchons des **Chauffeurs-Livreurs** qualifiés pour assurer le transport de marchandises et la conduite de notre flotte automobile.\n\n**Profils recherchés :**\n• Maîtrise de la conduite poids lourds / utilitaires.\n• Ponctualité, rigueur et discrétion.\n• Respect strict des consignes logistiques.\n\n*Cliquez ci-dessous pour postuler et ouvrir un ticket de recrutement.*",
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
        description: "Découvrez l'ensemble de nos solutions de transport et de prestation automobile.",
        fields: [
            {
                name: "01  •  Transport par Camion & Fret",
                value: "Acheminement de marchandises en lots complets ou partiels par notre flotte de poids lourds."
            },
            {
                name: "02  •  Location de Véhicules (Seule ou Chauffeur)",
                value: "Mise à disposition de véhicules de notre flotte pour vos besoins personnels ou professionnels (avec ou sans chauffeur accrédité)."
            },
            {
                name: "03  •  Escorte de Convoi",
                value: "Sécurisation et accompagnement logistique de vos transports sensibles."
            }
        ],
        footer: { text: "NAIRI LOGISTICS • PRESTATIONS" },
        timestamp: new Date().toISOString()
    };

    await channel.send({ embeds: [embed] });
}

async function sendCatalogueAdminPanel(channel) {
    const embed = {
        color: 0x111111,
        title: "NAIRI LOGISTICS — GESTION DU CATALOGUE",
        description: "Ce terminal permet d'ajouter de nouveaux véhicules à la flotte de location.\n\n*Seuls les membres de la **Direction** et les **Directeurs** peuvent utiliser le bouton ci-dessous pour enregister un véhicule.*",
        footer: { text: "NAIRI LOGISTICS • ADMINISTRATION FLOTTE" },
        timestamp: new Date().toISOString()
    };

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('open_add_vehicle_modal').setLabel('➕ Ajouter un véhicule').setStyle(ButtonStyle.Secondary)
    );

    await channel.send({ embeds: [embed], components: [row] });
}

module.exports = { setupCorporateStructure };
