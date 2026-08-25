const { 
    ActionRowBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ChannelType, 
    PermissionsBitField, 
    ButtonBuilder, 
    ButtonStyle, 
    UserSelectMenuBuilder,
    StringSelectMenuBuilder,
    MessageFlags 
} = require('discord.js');

const { handleRegisterInteraction, handleRegisterModal } = require('../utils/corporateRegisters');

// Stockage temporaire en mémoire
const addressBook = new Map(); 
const partnersBook = new Map(); // Système de gestion des partenaires

async function handleInteraction(interaction) {
    const guild = interaction.guild;
    const member = interaction.member;

    if (!guild || !member) return;

    // Recherche insensible à la casse et aux espaces ("Directeur", "DIRECTEUR", "Directeur Général", etc.)
    const directorRole = guild.roles.cache.find(r => r.name.toLowerCase().includes("directeur"));
    
    const isDirector = member.permissions.has(PermissionsBitField.Flags.Administrator) || 
                       (directorRole && member.roles.cache.has(directorRole.id));

    // A. Gestion des interactions des Registres (Finance & Logistique)[cite: 1]
    if (interaction.isStringSelectMenu() && ['fin_select_action', 'log_select_action', 'log_select_item_remove', 'trans_set_status'].includes(interaction.customId)) {
        if (!isDirector) return await interaction.reply({ content: "Accès restreint à la direction.", flags: MessageFlags.Ephemeral });
        return await handleRegisterInteraction(interaction);
    }

    // B. Gestion des boutons des Transports logistiques (Suppression)[cite: 1]
    if (interaction.isButton() && interaction.customId === 'trans_delete') {
        if (!isDirector) return await interaction.reply({ content: "Accès restreint à la direction.", flags: MessageFlags.Ephemeral });
        return await handleRegisterInteraction(interaction);
    }

    // C. Gestion de la soumission des modaux des Registres[cite: 1]
    if (interaction.isModalSubmit() && (interaction.customId.startsWith('modal_fin_') || interaction.customId.startsWith('modal_log_') || interaction.customId.startsWith('modal_remove_stock_'))) {
        if (!isDirector) return;
        return await handleRegisterModal(interaction);
    }

    // ==========================================
    // 0. GESTION DES COMMANDES SLASH POUR LES PARTENAIRES[cite: 1]
    // ==========================================
    if (interaction.isChatInputCommand() && interaction.commandName === 'partenaire') {
        if (!isDirector) {
            return await interaction.reply({ content: "Accès restreint.", flags: MessageFlags.Ephemeral });
        }

        const subCommand = interaction.options.getSubcommand();

        if (subCommand === 'lister') {
            if (partnersBook.size === 0) {
                return await interaction.reply({ content: "Aucun partenaire enregistré pour le moment.", flags: MessageFlags.Ephemeral });
            }

            const options = [];
            for (const [id, data] of partnersBook.entries()) {
                options.push({
                    label: data.name.substring(0, 100),
                    description: `Domaine: ${data.domain}`.substring(0, 100),
                    value: id
                });
            }

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('partner_select_manage')
                .setPlaceholder('Gérer un partenaire...')
                .addOptions(options.slice(0, 25));

            const row = new ActionRowBuilder().addComponents(selectMenu);

            return await interaction.reply({
                content: "🤝 **LISTE DES PARTENAIRES**\nSélectionnez un partenaire ci-dessous pour le consulter ou le supprimer :",
                components: [row],
                flags: MessageFlags.Ephemeral
            });
        }
    }

    // ==========================================
    // 1. BOUTON SECRÉTARIAT -> Formulaire client[cite: 1]
    // ==========================================
    if (interaction.isButton() && interaction.customId === 'open_secretariat_modal') {
        const modal = new ModalBuilder()
            .setCustomId('secretariat_form')
            .setTitle('NAIRI CORPORATION // CONTACT');

        const identityInput = new TextInputBuilder()
            .setCustomId('client_identity')
            .setLabel("NOM & PRÉNOM")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("John Doe")
            .setRequired(true);

        const phoneInput = new TextInputBuilder()
            .setCustomId('client_phone')
            .setLabel("TÉLÉPHONE")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("+1 (555) 019-2834")
            .setRequired(true);

        const detailsInput = new TextInputBuilder()
            .setCustomId('client_request')
            .setLabel("VOTRE DEMANDE")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Exprimez votre projet, vos volumes ou vos besoins...")
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(identityInput),
            new ActionRowBuilder().addComponents(phoneInput),
            new ActionRowBuilder().addComponents(detailsInput)
        );

        return await interaction.showModal(modal);
    }

    // ==========================================
    // 1.1 BOUTONS LOGISTIQUE & AUTOMOTIVE (MODALS & CATALOGUE)[cite: 1]
    // ==========================================
    if (interaction.isButton() && interaction.customId === 'open_livraison_modal') {
        const modal = new ModalBuilder()
            .setCustomId('livraison_form')
            .setTitle('NAIRI LOGISTICS // DEMANDE DE LIVRAISON');

        const identityInput = new TextInputBuilder()
            .setCustomId('client_identity')
            .setLabel("NOM & PRÉNOM / ENTREPRISE")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("John Doe ou Société X")
            .setRequired(true);

        const phoneInput = new TextInputBuilder()
            .setCustomId('client_phone')
            .setLabel("TÉLÉPHONE")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("+1 (555) 019-2834")
            .setRequired(true);

        const detailsInput = new TextInputBuilder()
            .setCustomId('client_request')
            .setLabel("DÉTAILS DE LA MARCHANDISE & TRAJET")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Nature du fret, volume, points de départ et d'arrivée...")
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(identityInput),
            new ActionRowBuilder().addComponents(phoneInput),
            new ActionRowBuilder().addComponents(detailsInput)
        );

        return await interaction.showModal(modal);
    }

    if (interaction.isButton() && interaction.customId === 'open_logistics_recrutement_modal') {
        const modal = new ModalBuilder()
            .setCustomId('logistics_recrutement_form')
            .setTitle('NAIRI LOGISTICS // CANDIDATURE');

        const identityInput = new TextInputBuilder()
            .setCustomId('candidate_identity')
            .setLabel("NOM & PRÉNOM")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("John Doe")
            .setRequired(true);

        const experienceInput = new TextInputBuilder()
            .setCustomId('candidate_experience')
            .setLabel("EXPÉRIENCE & COMPÉTENCES")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Décrivez votre expérience en conduite / logistique...")
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(identityInput),
            new ActionRowBuilder().addComponents(experienceInput)
        );

        return await interaction.showModal(modal);
    }

    // --- CATALOGUE : Bouton d'ouverture du formulaire d'ajout de véhicule[cite: 1] ---
    if (interaction.isButton() && interaction.customId === 'open_add_vehicle_modal') {
        if (!isDirector) {
            return await interaction.reply({ content: "❌ Accès réservé à la direction.", flags: MessageFlags.Ephemeral });
        }

        const modal = new ModalBuilder()
            .setCustomId('add_vehicle_form')
            .setTitle('Enregistrement Véhicule');

        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('vehicule_name').setLabel("Nom du véhicule").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('vehicule_desc').setLabel("Description / État").setStyle(TextInputStyle.Paragraph).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('vehicule_price').setLabel("Prix de location").setStyle(TextInputStyle.Short).setRequired(true))
        );
        return await interaction.showModal(modal);
    }

    // --- CATALOGUE : Actions de location (Seul ou Avec Chauffeur) -> Création de ticket[cite: 1] ---
    if (interaction.isButton() && (interaction.customId.startsWith('rent_solo_') || interaction.customId.startsWith('rent_driver_'))) {
        const isSolo = interaction.customId.startsWith('rent_solo_');
        const typeLocation = isSolo ? 'Location Seule' : 'Location avec Chauffeur';
        
        let vehiculeName = interaction.customId;
        if (interaction.customId.startsWith('rent_solo_')) {
            vehiculeName = interaction.customId.replace('rent_solo_', '');
        } else if (interaction.customId.startsWith('rent_driver_')) {
            vehiculeName = interaction.customId.replace('rent_driver_', '');
        }
        vehiculeName = vehiculeName.replace(/_/g, ' ');

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        let ticketCategory = guild.channels.cache.find(
            c => c.name === "DOSSIERS EN COURS" && c.type === ChannelType.GuildCategory
        );
        if (!ticketCategory) {
            ticketCategory = await guild.channels.create({
                name: "DOSSIERS EN COURS",
                type: ChannelType.GuildCategory,
            });
        }

        const sanitizedUser = member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 15);
        const ticketChannel = await guild.channels.create({
            name: `location-${sanitizedUser}`,
            type: ChannelType.GuildText,
            parent: ticketCategory.id,
            topic: `Demande de location — ${vehiculeName} (${typeLocation})`,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: member.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                },
                ...(directorRole ? [{
                    id: directorRole.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.ManageChannels],
                }] : [])
            ]
        });

        const ticketEmbed = {
            color: 0x111111,
            title: `LOCATION DE VÉHICULE // ${vehiculeName.toUpperCase()}`,
            description: "Canal de location établi. La direction automotive prend en charge votre demande ci-dessous.",
            fields: [
                { name: "CLIENT", value: `${member} (${member.user.tag})`, inline: true },
                { name: "TYPE DE FORMULE", value: typeLocation, inline: true },
                { name: "VÉHICULE SÉLECTIONNÉ", value: vehiculeName },
                { name: "STATUT DU DOSSIER", value: "EN ATTENTE DE PRISE EN CHARGE" }
            ],
            footer: { text: "NAIRI LOGISTICS • AUTOMOTIVE DIVISION" },
            timestamp: new Date().toISOString()
        };

        const controlRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_pending').setLabel('Mettre en attente').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('ticket_take').setLabel('Prendre en charge').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('ticket_close').setLabel('Clôturer le dossier').setStyle(ButtonStyle.Danger)
        );

        await ticketChannel.send({ 
            content: `${member} | ${directorRole ? directorRole : ''}`, 
            embeds: [ticketEmbed], 
            components: [controlRow] 
        });

        return await interaction.editReply({ 
            content: `✅ Demande validée ! Votre canal sécurisé a été créé avec succès : ${ticketChannel}` 
        });
    }

    // ==========================================
    // 2. SOUMISSION FORMULAIRE -> Création Ticket + Carnet d'adresses[cite: 1]
    // ==========================================
    if (interaction.isModalSubmit() && interaction.customId === 'secretariat_form') {
        const identity = interaction.fields.getTextInputValue('client_identity');
        const phone = interaction.fields.getTextInputValue('client_phone');
        const request = interaction.fields.getTextInputValue('client_request');

        await interaction.reply({ 
            content: "TRANSMISSION VALIDÉE. Génération de votre canal sécurisé et enregistrement...", 
            flags: MessageFlags.Ephemeral 
        });

        const user = interaction.user;

        let ticketCategory = guild.channels.cache.find(
            c => c.name === "DOSSIERS EN COURS" && c.type === ChannelType.GuildCategory
        );
        if (!ticketCategory) {
            ticketCategory = await guild.channels.create({
                name: "DOSSIERS EN COURS",
                type: ChannelType.GuildCategory,
            });
        }

        const sanitizedUser = user.username.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 15);
        const ticketChannel = await guild.channels.create({
            name: `dossier-${sanitizedUser}`,
            type: ChannelType.GuildText,
            parent: ticketCategory.id,
            topic: `Dossier confidentiel — ${identity} | Tél: ${phone}`,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: user.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                },
                ...(directorRole ? [{
                    id: directorRole.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.ManageChannels],
                }] : [])
            ]
        });

        const contactId = `contact_${Date.now()}`;
        addressBook.set(contactId, {
            id: contactId,
            identity,
            phone,
            request,
            notes: "Aucune note pour le moment.",
            channelId: ticketChannel.id,
            userId: user.id
        });

        const ticketEmbed = {
            color: 0x111111,
            title: `DOSSIER INSTITUTIONNEL // ${identity.toUpperCase()}`,
            description: "Canal de négociation sécurisé établi. La direction examine votre requête ci-dessous.",
            fields: [
                { name: "REQUÉRANT", value: identity, inline: true },
                { name: "CONTACT TÉLÉPHONIQUE", value: phone, inline: true },
                { name: "CONTENU DE LA REQUÊTE", value: request },
                { name: "STATUT DU DOSSIER", value: "EN ATTENTE DE PRISE EN CHARGE" }
            ],
            footer: { text: "NAIRI CORPORATION • SYSTÈMES UNIFIÉS" },
            timestamp: new Date().toISOString()
        };

        const controlRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_pending').setLabel('Mettre en attente').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('ticket_take').setLabel('Prendre en charge').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('ticket_close').setLabel('Clôturer le dossier').setStyle(ButtonStyle.Danger)
        );

        return await ticketChannel.send({ 
            content: `${user} | ${directorRole ? directorRole : ''}`, 
            embeds: [ticketEmbed], 
            components: [controlRow] 
        });
    }

    // ==========================================
    // 2.1 SOUMISSION FORMULAIRES LOGISTIQUE & CATALOGUE[cite: 1]
    // ==========================================
    if (interaction.isModalSubmit() && (interaction.customId === 'livraison_form' || interaction.customId === 'logistics_recrutement_form')) {
        const isRecrutement = interaction.customId === 'logistics_recrutement_form';
        const identity = interaction.fields.getTextInputValue(isRecrutement ? 'candidate_identity' : 'client_identity');
        const phoneOrExp = interaction.fields.getTextInputValue(isRecrutement ? 'candidate_experience' : 'client_phone');
        const request = isRecrutement ? null : interaction.fields.getTextInputValue('client_request');

        await interaction.reply({ 
            content: "TRANSMISSION LOGISTIQUE VALIDÉE. Génération de votre canal dédié...", 
            flags: MessageFlags.Ephemeral 
        });

        const user = interaction.user;

        let ticketCategory = guild.channels.cache.find(
            c => c.name === "DOSSIERS EN COURS" && c.type === ChannelType.GuildCategory
        );
        if (!ticketCategory) {
            ticketCategory = await guild.channels.create({
                name: "DOSSIERS EN COURS",
                type: ChannelType.GuildCategory,
            });
        }

        const prefixChannel = isRecrutement ? 'recrutement' : 'livraison';
        const sanitizedUser = user.username.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 15);
        const ticketChannel = await guild.channels.create({
            name: `${prefixChannel}-${sanitizedUser}`,
            type: ChannelType.GuildText,
            parent: ticketCategory.id,
            topic: `${isRecrutement ? 'Candidature chauffeur' : 'Demande de livraison'} — ${identity}`,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: user.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                },
                ...(directorRole ? [{
                    id: directorRole.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.ManageChannels],
                }] : [])
            ]
        });

        const ticketEmbed = {
            color: 0x111111,
            title: isRecrutement ? `CANDIDATURE CHAUFFEUR // ${identity.toUpperCase()}` : `LIVRAISON FREIGHT // ${identity.toUpperCase()}`,
            description: "Canal opérationnel établi. La direction logistique examine votre dossier ci-dessous.",
            fields: isRecrutement ? [
                { name: "CANDIDAT", value: identity, inline: true },
                { name: "EXPÉRIENCE & COMPÉTENCES", value: phoneOrExp },
                { name: "STATUT DU DOSSIER", value: "EN ATTENTE DE PRISE EN CHARGE" }
            ] : [
                { name: "DEMANDEUR", value: identity, inline: true },
                { name: "TÉLÉPHONE", value: phoneOrExp, inline: true },
                { name: "DÉTAILS DU FRET", value: request },
                { name: "STATUT DU DOSSIER", value: "EN ATTENTE DE PRISE EN CHARGE" }
            ],
            footer: { text: "NAIRI LOGISTICS • SYSTÈMES UNIFIÉS" },
            timestamp: new Date().toISOString()
        };

        const controlRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_pending').setLabel('Mettre en attente').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('ticket_take').setLabel('Prendre en charge').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('ticket_close').setLabel('Clôturer le dossier').setStyle(ButtonStyle.Danger)
        );

        return await ticketChannel.send({ 
            content: `${user} | ${directorRole ? directorRole : ''}`, 
            embeds: [ticketEmbed], 
            components: [controlRow] 
        });
    }

    // --- CATALOGUE : Soumission du formulaire d'ajout de véhicule[cite: 1] ---
    if (interaction.isModalSubmit() && interaction.customId === 'add_vehicle_form') {
        const name = interaction.fields.getTextInputValue('vehicule_name');
        const desc = interaction.fields.getTextInputValue('vehicule_desc');
        const price = interaction.fields.getTextInputValue('vehicule_price');

        const embed = {
            color: 0x111111,
            title: `🚗 ${name}`,
            description: desc,
            fields: [{ name: "💰 Tarif de location", value: price, inline: true }],
            footer: { text: "NAIRI LOGISTICS • CATALOGUE FLOTTE" },
            timestamp: new Date().toISOString()
        };

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`rent_solo_${name.toLowerCase().replace(/\s+/g, '_')}`).setLabel('Louer (Seul)').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`rent_driver_${name.toLowerCase().replace(/\s+/g, '_')}`).setLabel('Louer (Avec Chauffeur)').setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({ content: "✅ Véhicule ajouté au catalogue avec succès.", flags: MessageFlags.Ephemeral });
        return await interaction.channel.send({ embeds: [embed], components: [row] });
    }

    // ==========================================
    // 3. BOUTON BUREAU -> Formulaire de Communiqué[cite: 1]
    // ==========================================
    if (interaction.isButton() && interaction.customId === 'bureau_announcement') {
        if (!isDirector) return await interaction.reply({ content: "Accès restreint.", flags: MessageFlags.Ephemeral });

        const modal = new ModalBuilder()
            .setCustomId('announcement_form')
            .setTitle('NAIRI OS // PUBLICATION COMMUNIQUÉ');

        const titleInput = new TextInputBuilder()
            .setCustomId('ann_title')
            .setLabel("TITRE DU COMMUNIQUÉ")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Ex: Expansion stratégique Q3")
            .setRequired(true);

        const contentInput = new TextInputBuilder()
            .setCustomId('ann_content')
            .setLabel("CONTENU OFFICIEL")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Texte du communiqué destiné au salon #annonces...")
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(contentInput)
        );

        return await interaction.showModal(modal);
    }

    // ==========================================
    // 4. MENU DÉROULANT DU BUREAU (Modifié : Registre logistique remplacé par Partenaire)
    // ==========================================
    if (interaction.isStringSelectMenu() && interaction.customId === 'bureau_management_menu') {
        if (!isDirector) return await interaction.reply({ content: "Accès restreint.", flags: MessageFlags.Ephemeral });

        const selected = interaction.values[0];

        if (selected === 'nav_finance') {
            if (addressBook.size === 0) {
                return await interaction.reply({ content: "Le carnet d'adresses est actuellement vide (aucun dossier enregistré).", flags: MessageFlags.Ephemeral });
            }

            const options = [];
            for (const [id, data] of addressBook.entries()) {
                options.push({
                    label: data.identity.substring(0, 100),
                    description: `Tél: ${data.phone}`.substring(0, 100),
                    value: id
                });
            }

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('address_book_select')
                .setPlaceholder('Sélectionner un dossier dans le carnet d’adresses...')
                .addOptions(options.slice(0, 25));

            const row = new ActionRowBuilder().addComponents(selectMenu);

            return await interaction.reply({ 
                content: "📖 **CARNET D'ADRESSES & DOSSIERS CLIENTS**\nSélectionnez un membre ci-dessous pour consulter son dossier, modifier ses informations, ajouter des notes ou supprimer la fiche :", 
                components: [row], 
                flags: MessageFlags.Ephemeral 
            });
        } 
        
        if (selected === 'nav_partners') {
            // Ouverture de la modale d'ajout de partenaire directement depuis le menu du bureau
            const modal = new ModalBuilder()
                .setCustomId('bureau_add_partner_form')
                .setTitle('NAIRI // AJOUTER UN PARTENAIRE');

            const nameInput = new TextInputBuilder()
                .setCustomId('partner_name')
                .setLabel("NOM DE L'ENTREPRISE")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Ex: Nairi Tech")
                .setRequired(true);

            const domainInput = new TextInputBuilder()
                .setCustomId('partner_domain')
                .setLabel("DOMAINE D'ACTIVITÉ")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Ex: Automobile / Logistique")
                .setRequired(true);

            const logoInput = new TextInputBuilder()
                .setCustomId('partner_logo')
                .setLabel("LIEN DE L'IMAGE (LOGO)")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Colle le lien direct de l'image uploadée")
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(nameInput),
                new ActionRowBuilder().addComponents(domainInput),
                new ActionRowBuilder().addComponents(logoInput)
            );

            return await interaction.showModal(modal);
        }
        
        if (selected === 'mod_purge') {
            try {
                const messages = await interaction.channel.messages.fetch({ limit: 50 });
                await interaction.channel.bulkDelete(messages, true);
                return await interaction.reply({ content: "Salon nettoyé avec succès (purge des 50 derniers messages).", flags: MessageFlags.Ephemeral });
            } catch (err) {
                return await interaction.reply({ content: "Erreur lors de la purge.", flags: MessageFlags.Ephemeral });
            }
        } 
        
        if (selected === 'mod_lockdown') {
            try {
                await interaction.channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false });
                return await interaction.reply({ content: "🔒 **Verrouillage activé.** Le salon a été bloqué pour sécuriser la zone.", flags: MessageFlags.Ephemeral });
            } catch (err) {
                return await interaction.reply({ content: "Erreur lors du verrouillage.", flags: MessageFlags.Ephemeral });
            }
        } 
        
        if (selected === 'mod_kick_select' || selected === 'mod_ban_select') {
            const actionType = selected === 'mod_kick_select' ? 'kick' : 'ban';
             
            const userSelectRow = new ActionRowBuilder().addComponents(
                new UserSelectMenuBuilder()
                    .setCustomId(`target_user_${actionType}`)
                    .setPlaceholder('Choisissez le membre ciblé dans la liste...')
                    .setMinValues(1)
                    .setMaxValues(1)
            );

            return await interaction.reply({ 
                content: `Sélectionnez le membre à **${actionType === 'kick' ? 'expulser' : 'bannir'}** ci-dessous :`, 
                components: [userSelectRow], 
                flags: MessageFlags.Ephemeral 
            });
        }
        
        return;
    }

    // ==========================================
    // 4.1 SOUMISSION DE LA MODALE PARTENAIRE -> Publication DA (1539402971614417057)
    // ==========================================
    if (interaction.isModalSubmit() && interaction.customId === 'bureau_add_partner_form') {
        if (!isDirector) return;

        const name = interaction.fields.getTextInputValue('partner_name');
        const domain = interaction.fields.getTextInputValue('partner_domain');
        const logo = interaction.fields.getTextInputValue('partner_logo');

        const partnerId = `partner_${Date.now()}`;
        partnersBook.set(partnerId, {
            id: partnerId,
            name,
            domain,
            details: "Partenariat officiel enregistré via le bureau.",
            logo
        });

        // Récupération directe du salon DA par son ID précis
        const daChannelId = '1539402971614417057';
        const daChannel = guild.channels.cache.get(daChannelId) || await guild.channels.fetch(daChannelId).catch(() => null);

        const partnerEmbed = {
            color: 0x111111,
            title: `🤝 NOUVEAU PARTENAIRE // ${name.toUpperCase()}`,
            description: "Un nouveau partenariat institutionnel vient d'être officialisé et enregistré par la direction.",
            fields: [
                { name: "ENTREPRISE", value: name, inline: true },
                { name: "DOMAINE D'ACTIVITÉ", value: domain, inline: true }
            ],
            footer: { text: "NAIRI CORPORATION • DIRECTION ARTISTIQUE & GÉNÉRALE" },
            timestamp: new Date().toISOString()
        };

        if (logo) {
            partnerEmbed.thumbnail = { url: logo };
        }

        if (daChannel) {
            await daChannel.send({ embeds: [partnerEmbed] });
            return await interaction.reply({ content: `✅ Le partenaire **${name}** a été enregistré et publié avec succès dans le salon de la DA !`, flags: MessageFlags.Ephemeral });
        } else {
            return await interaction.reply({ content: `⚠️ Partenaire enregistré en mémoire, mais le salon DA (ID: ${daChannelId}) est introuvable.`, flags: MessageFlags.Ephemeral });
        }
    }

    // ==========================================
    // 5. GESTION DU CARNET D'ADRESSES[cite: 1]
    // ==========================================
    if (interaction.isStringSelectMenu() && interaction.customId === 'address_book_select') {
        if (!isDirector) return await interaction.reply({ content: "Accès restreint.", flags: MessageFlags.Ephemeral });

        const contactId = interaction.values[0];
        const contact = addressBook.get(contactId);

        if (!contact) {
            return await interaction.reply({ content: "Ce dossier n'existe plus ou a été supprimé.", flags: MessageFlags.Ephemeral });
        }

        const actionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`addr_notes_${contactId}`).setLabel('📝 Inscrire des notes').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`addr_goto_${contactId}`).setLabel('📂 Consulter le salon').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`addr_edit_${contactId}`).setLabel('✏️ Modifier').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`addr_delete_${contactId}`).setLabel('🗑️ Supprimer').setStyle(ButtonStyle.Danger)
        );

        return await interaction.update({
            content: `📄 **DOSSIER DE : ${contact.identity.toUpperCase()}**\n\n` +
                     `📞 **Téléphone :** ${contact.phone}\n` +
                     `💬 **Demande initiale :** ${contact.request}\n` +
                     `📌 **Notes internes :** ${contact.notes}`,
            components: [actionRow]
        });
    }

    if (interaction.isButton() && interaction.customId.startsWith('addr_')) {
        if (!isDirector) return await interaction.reply({ content: "Accès restreint.", flags: MessageFlags.Ephemeral });

        const parts = interaction.customId.split('_');
        const action = parts[1];
        const contactId = parts.slice(2).join('_');
        const contact = addressBook.get(contactId);

        if (!contact && action !== 'delete') {
            return await interaction.reply({ content: "Dossier introuvable.", flags: MessageFlags.Ephemeral });
        }

        if (action === 'goto') {
            const channel = guild.channels.cache.get(contact.channelId);
            if (!channel) {
                return await interaction.reply({ content: "Le salon associé à ce dossier a été supprimé ou archivé.", flags: MessageFlags.Ephemeral });
            }
            return await interaction.reply({ content: `Accès au salon du dossier : ${channel}`, flags: MessageFlags.Ephemeral });
        }

        if (action === 'notes') {
            const modal = new ModalBuilder()
                .setCustomId(`modal_addr_notes_${contactId}`)
                .setTitle('CARNET D\'ADRESSES // NOTES');

            const notesInput = new TextInputBuilder()
                .setCustomId('contact_notes')
                .setLabel("NOTES INTERNES SUR LE DOSSIER")
                .setStyle(TextInputStyle.Paragraph)
                .setValue(contact.notes === "Aucune note pour le moment." ? "" : contact.notes)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(notesInput));
            return await interaction.showModal(modal);
        }

        if (action === 'edit') {
            const modal = new ModalBuilder()
                .setCustomId(`modal_addr_edit_${contactId}`)
                .setTitle('CARNET D\'ADRESSES // MODIFICATION');

            const identityInput = new TextInputBuilder()
                .setCustomId('edit_identity')
                .setLabel("NOM & PRÉNOM")
                .setStyle(TextInputStyle.Short)
                .setValue(contact.identity)
                .setRequired(true);

            const phoneInput = new TextInputBuilder()
                .setCustomId('edit_phone')
                .setLabel("TÉLÉPHONE")
                .setStyle(TextInputStyle.Short)
                .setValue(contact.phone)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(identityInput),
                new ActionRowBuilder().addComponents(phoneInput)
            );

            return await interaction.showModal(modal);
        }

        if (action === 'delete') {
            addressBook.delete(contactId);
            return await interaction.update({
                content: "🗑️ **Dossier supprimé du carnet d'adresses avec succès.**",
                components: []
            });
        }
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_addr_')) {
        if (!isDirector) return;

        const parts = interaction.customId.split('_');
        const actionType = parts[2];
        const contactId = parts.slice(3).join('_');

        const contact = addressBook.get(contactId);
        if (!contact) {
            return await interaction.reply({ content: "Dossier introuvable.", flags: MessageFlags.Ephemeral });
        }

        if (actionType === 'notes') {
            const newNotes = interaction.fields.getTextInputValue('contact_notes');
            contact.notes = newNotes;
            return await interaction.reply({ content: "✅ Notes mises à jour avec succès dans le carnet d'adresses.", flags: MessageFlags.Ephemeral });
        }

        if (actionType === 'edit') {
            contact.identity = interaction.fields.getTextInputValue('edit_identity');
            contact.phone = interaction.fields.getTextInputValue('edit_phone');
            return await interaction.reply({ content: "✅ Informations du contact mises à jour avec succès.", flags: MessageFlags.Ephemeral });
        }
    }

    // ==========================================
    // 5.2 GESTION DE LA LISTE DES PARTENAIRES[cite: 1]
    // ==========================================
    if (interaction.isStringSelectMenu() && interaction.customId === 'partner_select_manage') {
        if (!isDirector) return await interaction.reply({ content: "Accès restreint.", flags: MessageFlags.Ephemeral });

        const partnerId = interaction.values[0];
        const partner = partnersBook.get(partnerId);

        if (!partner) {
            return await interaction.reply({ content: "Ce partenaire n'existe plus.", flags: MessageFlags.Ephemeral });
        }

        const actionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`partner_del_${partnerId}`).setLabel('🗑️ Supprimer le partenaire').setStyle(ButtonStyle.Danger)
        );

        let content = `🤝 **PARTENAIRE : ${partner.name.toUpperCase()}**\n\n🌐 **Domaine :** ${partner.domain}\n📄 **Détails / Accord :**\n${partner.details}`;
        if (partner.logo) {
            content += `\n🖼️ **Logo :** ${partner.logo}`;
        }

        return await interaction.update({
            content: content,
            components: [actionRow]
        });
    }
    
    if (interaction.isButton() && interaction.customId.startsWith('partner_del_')) {
        if (!isDirector) return await interaction.reply({ content: "Accès restreint.", flags: MessageFlags.Ephemeral });

        const partnerId = interaction.customId.replace('partner_del_', '');
        if (partnersBook.has(partnerId)) {
            partnersBook.delete(partnerId);
            return await interaction.update({
                content: "🗑️ **Partenaire supprimé avec succès.**",
                components: []
            });
        }
        return await interaction.reply({ content: "Partenaire introuvable.", flags: MessageFlags.Ephemeral });
    }

    // ==========================================
    // 6. SANCTIONS[cite: 1]
    // ==========================================
    if (interaction.isUserSelectMenu() && interaction.customId.startsWith('target_user_')) {
        if (!isDirector) return;

        const actionType = interaction.customId.split('_')[2]; 
        const targetId = interaction.values[0];

        const modal = new ModalBuilder()
            .setCustomId(`modal_exec_${actionType}_${targetId}`)
            .setTitle(`NAIRI OS // MOTIF DE LA SANCTION`);

        const reasonInput = new TextInputBuilder()
            .setCustomId('sanction_reason')
            .setLabel("MOTIF DE L'ACTION")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Comportement non conforme / Spam / Troll...")
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
        return await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_exec_')) {
        if (!isDirector) return;

        const parts = interaction.customId.split('_');
        const actionType = parts[2]; 
        const targetId = parts[3];

        const reason = interaction.fields.getTextInputValue('sanction_reason');

        try {
            const targetMember = await guild.members.fetch(targetId);
            if (!targetMember) {
                return await interaction.reply({ content: "Membre introuvable sur ce serveur.", flags: MessageFlags.Ephemeral });
            }

            if (actionType === 'kick') {
                await targetMember.kick(reason);
                return await interaction.reply({ content: `Membre **${targetMember.user.tag}** expulsé avec succès. Motif : ${reason}`, flags: MessageFlags.Ephemeral });
            } else {
                await targetMember.ban({ reason });
                return await interaction.reply({ content: `Membre **${targetMember.user.tag}** banni définitivement. Motif : ${reason}`, flags: MessageFlags.Ephemeral });
            }
        } catch (err) {
            return await interaction.reply({ content: "Erreur d'exécution. Vérifiez vos permissions.", flags: MessageFlags.Ephemeral });
        }
    }

    // ==========================================
    // 7. COMMUNIQUÉ[cite: 1]
    // ==========================================
    if (interaction.isModalSubmit() && interaction.customId === 'announcement_form') {
        if (!isDirector) return;

        const title = interaction.fields.getTextInputValue('ann_title');
        const content = interaction.fields.getTextInputValue('ann_content');

        const annoncesChannel = guild.channels.cache.find(c => c.name === "annonces");
        if (!annoncesChannel) {
            return await interaction.reply({ content: "Erreur : Le salon #annonces est introuvable.", flags: MessageFlags.Ephemeral });
        }

        const embed = {
            color: 0x111111,
            title: `COMMUNIQUÉ OFFICIEL // ${title.toUpperCase()}`,
            description: content,
            footer: { text: "NAIRI CORPORATION • DIRECTION GÉNÉRALE" },
            timestamp: new Date().toISOString()
        };

        await annoncesChannel.send({ embeds: [embed] });
        return await interaction.reply({ content: "Communiqué publié avec succès dans le salon **#annonces**.", flags: MessageFlags.Ephemeral });
    }

    // ==========================================
    // 8. TICKETS[cite: 1]
    // ==========================================
    if (interaction.isButton() && ['ticket_pending', 'ticket_take', 'ticket_close'].includes(interaction.customId)) {
        const channel = interaction.channel;

        if (!isDirector) {
            return await interaction.reply({ content: "Accès restreint. Réservé à la direction.", flags: MessageFlags.Ephemeral });
        }

        const message = interaction.message;
        const embed = message.embeds[0];
        if (!embed) return;

        const updatedEmbed = {
            ...embed,
            fields: [...embed.fields]
        };

        const statusFieldIndex = updatedEmbed.fields.findIndex(f => f.name === "STATUT DU DOSSIER");

        if (interaction.customId === 'ticket_pending') {
            if (statusFieldIndex !== -1) {
                updatedEmbed.fields[statusFieldIndex] = { name: "STATUT DU DOSSIER", value: "EN ATTENTE DE TRAITEMENT" };
            }
            await message.edit({ embeds: [updatedEmbed] });
            return await interaction.reply({ content: "Statut mis à jour : En attente.", flags: MessageFlags.Ephemeral });
        } 
        
        if (interaction.customId === 'ticket_take') {
            if (statusFieldIndex !== -1) {
                updatedEmbed.fields[statusFieldIndex] = { name: "STATUT DU DOSSIER", value: `PRIS EN CHARGE PAR ${interaction.user.username.toUpperCase()}` };
            }
            await message.edit({ embeds: [updatedEmbed] });
            return await interaction.reply({ content: "Statut mis à jour : Pris en charge.", flags: MessageFlags.Ephemeral });
        } 
        
        if (interaction.customId === 'ticket_close') {
            await interaction.reply({ content: "Clôture et archivage du dossier en cours.", flags: MessageFlags.Ephemeral });

            let archiveCategory = guild.channels.cache.find(
                c => c.name === "DOSSIERS CLÔTURÉS" && c.type === ChannelType.GuildCategory
            );
            if (!archiveCategory) {
                archiveCategory = await guild.channels.create({
                    name: "DOSSIERS CLÔTURÉS",
                    type: ChannelType.GuildCategory,
                });
            }

            await channel.setParent(archiveCategory.id);
            await channel.permissionOverwrites.set([
                {
                    id: guild.roles.everyone,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                ...(directorRole ? [{
                    id: directorRole.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
                    deny: [PermissionsBitField.Flags.SendMessages],
                }]: [])
            ]);

            await message.edit({ 
                embeds: [updatedEmbed], 
                components: [] 
            });

            return await channel.send("Ce dossier a été officiellement clôturé et archivé par la direction.");
        }
    }
}

module.exports = { handleInteraction };
