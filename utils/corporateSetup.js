const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, StringSelectMenuBuilder } = require('discord.js');

async function setupCorporateStructure(guild) {
    try {
        console.log(`[CorporateSetup] Initialisation de l'architecture pour ${guild.name}...`);

        // 1. Gestion des Rôles
        let directionRole = guild.roles.cache.find(r => r.name === 'Direction');
        if (!directionRole) {
            directionRole = await guild.roles.create({
                name: 'Direction',
                color: '#2b2d31',
                permissions: [PermissionFlagsBits.Administrator],
                reason: 'Rôle nécessaire pour la gestion de l\'entreprise.'
            });
        }

        let staffRole = guild.roles.cache.find(r => r.name === 'Employé');
        if (!staffRole) {
            staffRole = await guild.roles.create({
                name: 'Employé',
                color: '#5865F2',
                reason: 'Rôle de base pour les employés.'
            });
        }

        let clientRole = guild.roles.cache.find(r => r.name === 'Client');
        if (!clientRole) {
            clientRole = await guild.roles.create({
                name: 'Client',
                color: '#57F287',
                reason: 'Rôle attribué aux clients de l\'entreprise.'
            });
        }

        // 2. Configuration des Canaux et Catégories
        // --- CATÉGORIE 1 : NAIRI CORPORATION ---
        let corpCategory = guild.channels.cache.find(c => c.name === 'NAIRI CORPORATION' && c.type === ChannelType.GuildCategory);
        if (!corpCategory) {
            corpCategory = await guild.channels.create({
                name: 'NAIRI CORPORATION',
                type: ChannelType.GuildCategory,
            });
        }

        // Salon Secrétariat
        let secretariatChannel = guild.channels.cache.find(c => c.name === 'secrétariat' && c.parentId === corpCategory.id);
        if (!secretariatChannel) {
            secretariatChannel = await guild.channels.create({
                name: 'secrétariat',
                type: ChannelType.GuildText,
                parent: corpCategory.id,
                permissionOverwrites: [
                    { id: guild.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory], deny: [PermissionFlagsBits.SendMessages] },
                    { id: staffRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
                ]
            });

            const embedSecretariat = new EmbedBuilder()
                .setTitle('Secrétariat Général')
                .setDescription('Bienvenue dans le pôle d\'accueil de Nairi Corporation.\n\nPour toute demande de renseignements, ouverture de dossier ou prise de contact officielle avec nos services, veuillez cliquer sur le bouton ci-dessous.')
                .setColor('#2b2d31')
                .setFooter({ text: 'Nairi Corporation — Accueil et Orientation' });

            const rowSecretariat = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('open_ticket')
                    .setLabel('Ouvrir un dossier')
                    .setStyle(ButtonStyle.Secondary)
            );

            await secretariatChannel.send({ embeds: [embedSecretariat], components: [rowSecretariat] });
        }

        // Salon Annonces
        let annoncesChannel = guild.channels.cache.find(c => c.name === 'annonces' && c.parentId === corpCategory.id);
        if (!annoncesChannel) {
            annoncesChannel = await guild.channels.create({
                name: 'annonces',
                type: ChannelType.GuildText,
                parent: corpCategory.id,
                permissionOverwrites: [
                    { id: guild.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory], deny: [PermissionFlagsBits.SendMessages] }
                ]
            });

            const embedAnnonces = new EmbedBuilder()
                .setTitle('Communications Officielles')
                .setDescription('Cet espace est réservé aux communiqués officiels, notes de direction et actualités de Nairi Corporation.')
                .setColor('#2b2d31')
                .setFooter({ text: 'Flux officiel de l\'entreprise' });

            await annoncesChannel.send({ embeds: [embedAnnonces] });
        }

        // Salon Services Corporation
        let servicesCorpChannel = guild.channels.cache.find(c => c.name === 'services-corp' && c.parentId === corpCategory.id);
        if (!servicesCorpChannel) {
            servicesCorpChannel = await guild.channels.create({
                name: 'services-corp',
                type: ChannelType.GuildText,
                parent: corpCategory.id,
                permissionOverwrites: [
                    { id: guild.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory], deny: [PermissionFlagsBits.SendMessages] }
                ]
            });

            const embedServicesCorp = new EmbedBuilder()
                .setTitle('Prestations & Partenariats')
                .setDescription('Nairi Corporation propose des solutions adaptées aux professionnels et aux particuliers.')
                .addFields(
                    { name: 'Négoce & Distribution', value: 'Importation et fourniture de marchandises à grande échelle selon les besoins du marché.', inline: false },
                    { name: 'Courtage & Conseil', value: 'Accompagnement stratégique, audit et mise en relation d\'affaires.', inline: false }
                )
                .setColor('#2b2d31')
                .setFooter({ text: 'Catalogue des services généraux' });

            await servicesCorpChannel.send({ embeds: [embedServicesCorp] });
        }


        // --- CATÉGORIE 2 : ADMINISTRATION ---
        let adminCategory = guild.channels.cache.find(c => c.name === 'ADMINISTRATION' && c.type === ChannelType.GuildCategory);
        if (!adminCategory) {
            adminCategory = await guild.channels.create({
                name: 'ADMINISTRATION',
                type: ChannelType.GuildCategory,
                permissionOverwrites: [
                    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: directionRole.id, allow: [PermissionFlagsBits.ViewChannel] }
                ]
            });
        }

        // Salon Bureau (Direction)
        let bureauChannel = guild.channels.cache.find(c => c.name === 'bureau' && c.parentId === adminCategory.id);
        if (!bureauChannel) {
            bureauChannel = await guild.channels.create({
                name: 'bureau',
                type: ChannelType.GuildText,
                parent: adminCategory.id,
                permissionOverwrites: [
                    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: directionRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
                ]
            });

            const embedBureau = new EmbedBuilder()
                .setTitle('Centre de Contrôle Administratif')
                .setDescription('Interface de gestion réservée à la direction générale.\nUtilisez les options ci-dessous pour administrer les flux et la structure.')
                .setColor('#2b2d31')
                .setFooter({ text: 'Sécurité Interne — Direction' });

            const rowAdmin1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('admin_broadcast')
                    .setLabel('Diffuser un communiqué')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('admin_lockdown')
                    .setLabel('Verrouiller les salons')
                    .setStyle(ButtonStyle.Danger)
            );

            const rowAdmin2 = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('admin_management_menu')
                    .setPlaceholder('Actions de gestion rapide...')
                    .addOptions([
                        { label: 'Rapport d\'activité', description: 'Générer un état des dossiers en cours', value: 'report_activity' },
                        { label: 'Audit des effectifs', description: 'Afficher la liste des rôles et des accès', value: 'audit_staff' },
                        { label: 'Nettoyage des logs', description: 'Archiver les anciens messages système', value: 'clean_logs' }
                    ])
            );

            await bureauChannel.send({ embeds: [embedBureau], components: [rowAdmin1, rowAdmin2] });
        }


        // --- CATÉGORIE 3 : COMPTABILITÉ ---
        let comptaCategory = guild.channels.cache.find(c => c.name === 'COMPTABILITÉ' && c.type === ChannelType.GuildCategory);
        if (!comptaCategory) {
            comptaCategory = await guild.channels.create({
                name: 'COMPTABILITÉ',
                type: ChannelType.GuildCategory,
                permissionOverwrites: [
                    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: directionRole.id, allow: [PermissionFlagsBits.ViewChannel] }
                ]
            });
        }

        let financeChannel = guild.channels.cache.find(c => c.name === 'finance' && c.parentId === comptaCategory.id);
        if (!financeChannel) {
            await guild.channels.create({
                name: 'finance',
                type: ChannelType.GuildText,
                parent: comptaCategory.id,
                permissionOverwrites: [
                    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: directionRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
                ]
            });
        }

        let logistiqueComptaChannel = guild.channels.cache.find(c => c.name === 'logistique-compta' && c.parentId === comptaCategory.id);
        if (!logistiqueComptaChannel) {
            await guild.channels.create({
                name: 'logistique-compta',
                type: ChannelType.GuildText,
                parent: comptaCategory.id,
                permissionOverwrites: [
                    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: directionRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
                ]
            });
        }


        // --- CATÉGORIE 4 : NAIRI LOGISTICS & AUTOMOTIVE ---
        let logisticsCategory = guild.channels.cache.find(c => c.name === 'NAIRI LOGISTICS' && c.type === ChannelType.GuildCategory);
        if (!logisticsCategory) {
            logisticsCategory = await guild.channels.create({
                name: 'NAIRI LOGISTICS',
                type: ChannelType.GuildCategory,
            });
        }

        // Salon Livraison
        let livraisonChannel = guild.channels.cache.find(c => c.name === 'livraison' && c.parentId === logisticsCategory.id);
        if (!livraisonChannel) {
            livraisonChannel = await guild.channels.create({
                name: 'livraison',
                type: ChannelType.GuildText,
                parent: logisticsCategory.id,
                permissionOverwrites: [
                    { id: guild.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory], deny: [PermissionFlagsBits.SendMessages] },
                    { id: staffRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
                ]
            });

            const embedLivraison = new EmbedBuilder()
                .setTitle('Service de Transport & Fret')
                .setDescription('Commandez une prestation de transport sécurisé pour vos marchandises.\nCliquez sur le bouton ci-dessous pour initialiser une demande de livraison.')
                .setColor('#2b2d31')
                .setFooter({ text: 'Nairi Logistics — Département Fret' });

            const rowLivraison = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('request_delivery')
                    .setLabel('Commander un transport')
                    .setStyle(ButtonStyle.Secondary)
            );

            await livraisonChannel.send({ embeds: [embedLivraison], components: [rowLivraison] });
        }

        // Salon Recrutement Logistique
        let recrutementChannel = guild.channels.cache.find(c => c.name === 'recrutement' && c.parentId === logisticsCategory.id);
        if (!recrutementChannel) {
            recrutementChannel = await guild.channels.create({
                name: 'recrutement',
                type: ChannelType.GuildText,
                parent: logisticsCategory.id,
                permissionOverwrites: [
                    { id: guild.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory], deny: [PermissionFlagsBits.SendMessages] },
                    { id: staffRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
                ]
            });

            const embedRecrutement = new EmbedBuilder()
                .setTitle('Rejoindre les Équipes')
                .setDescription('Nairi Logistics recrute de nouveaux chauffeurs et agents de sécurité.\nPostulez en soumettant votre dossier via le formulaire sécurisé.')
                .setColor('#2b2d31')
                .setFooter({ text: 'Ressources Humaines — Logistique' });

            const rowRecrutement = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('apply_job')
                    .setLabel('Déposer une candidature')
                    .setStyle(ButtonStyle.Secondary)
            );

            await recrutementChannel.send({ embeds: [embedRecrutement], components: [rowRecrutement] });
        }

        // Salon Services Logistiques (SANS la location de véhicules)
        let servicesLogChannel = guild.channels.cache.find(c => c.name === 'services-logistique' && c.parentId === logisticsCategory.id);
        if (!servicesLogChannel) {
            servicesLogChannel = await guild.channels.create({
                name: 'services-logistique',
                type: ChannelType.GuildText,
                parent: logisticsCategory.id,
                permissionOverwrites: [
                    { id: guild.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory], deny: [PermissionFlagsBits.SendMessages] }
                ]
            });

            const embedServicesLog = new EmbedBuilder()
                .setTitle('Prestations Logistiques')
                .setDescription('Nos solutions de transport et d\'accompagnement sur mesure.')
                .addFields(
                    { name: 'Fret & Transport', value: 'Acheminement sécurisé de marchandises en tout genre avec une flotte dédiée et suivie en temps réel.', inline: false },
                    { name: 'Escorte & Sécurité', value: 'Protection rapprochée de convois sensibles et sécurisation de trajets à haut risque.', inline: false }
                )
                .setColor('#2b2d31')
                .setFooter({ text: 'Nairi Logistics — Prestations' });

            await servicesLogChannel.send({ embeds: [embedServicesLog] });
        }

        // Salon Catalogue Flotte (Direction)
        let catalogueChannel = guild.channels.cache.find(c => c.name === 'catalogue-flotte' && c.parentId === logisticsCategory.id);
        if (!catalogueChannel) {
            catalogueChannel = await guild.channels.create({
                name: 'catalogue-flotte',
                type: ChannelType.GuildText,
                parent: logisticsCategory.id,
                permissionOverwrites: [
                    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: directionRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
                ]
            });

            const embedCatalogue = new EmbedBuilder()
                .setTitle('Gestion de la Flotte')
                .setDescription('Interface de gestion du parc roulant et des véhicules de service.\nAjoutez ou retirez des unités de la flotte enregistrée.')
                .setColor('#2b2d31')
                .setFooter({ text: 'Direction Technique & Logistique' });

            const rowCatalogue = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('add_vehicle')
                    .setLabel('Ajouter un véhicule')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('remove_vehicle')
                    .setLabel('Retirer un véhicule')
                    .setStyle(ButtonStyle.Danger)
            );

            await catalogueChannel.send({ embeds: [embedCatalogue], components: [rowCatalogue] });
        }

        console.log('[CorporateSetup] Architecture du serveur initialisée avec succès.');
    } catch (error) {
        console.error('[CorporateSetup] Erreur lors de l\'initialisation :', error);
    }
}

module.exports = { setupCorporateStructure };
