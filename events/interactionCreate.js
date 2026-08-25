const { 
    ChannelType, 
    PermissionsBitField, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    StringSelectMenuBuilder 
} = require('discord.js');
const { logAction, logFinancialTransaction } = require('./corporateRegisters');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        try {
            // --- GESTION DES BOUTONS ---
            if (interaction.isButton()) {
                // 1. Bouton "Ouvrir un dossier" (Secrétariat unique)
                if (interaction.customId === 'open_secretariat_modal') {
                    const modal = new ModalBuilder()
                        .setCustomId('modal_secretariat_submit')
                        .setTitle('Secrétariat Exécutif — Nouveau Dossier');

                    const typeInput = new TextInputBuilder()
                        .setCustomId('secretariat_type')
                        .setLabel("Objet de la demande (ex: Négoce, Partenariat...)")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);

                    const detailsInput = new TextInputBuilder()
                        .setCustomId('secretariat_details')
                        .setLabel("Détails précis de votre requête")
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true);

                    modal.addComponents(
                        new ActionRowBuilder().addComponents(typeInput),
                        new ActionRowBuilder().addComponents(detailsInput)
                    );

                    return await interaction.showModal(modal);
                }

                // 2. Bouton "Demander une livraison" (Nairi Logistics)
                if (interaction.customId === 'open_livraison_modal') {
                    const modal = new ModalBuilder()
                        .setCustomId('modal_livraison_submit')
                        .setTitle('Nairi Logistics — Demande de Fret');

                    const destinationInput = new TextInputBuilder()
                        .setCustomId('livraison_destination')
                        .setLabel("Lieu de livraison / Itinéraire")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);

                    const cargoInput = new TextInputBuilder()
                        .setCustomId('livraison_cargo')
                        .setLabel("Nature et volume de la marchandise")
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true);

                    modal.addComponents(
                        new ActionRowBuilder().addComponents(destinationInput),
                        new ActionRowBuilder().addComponents(cargoInput)
                    );

                    return await interaction.showModal(modal);
                }

                // 3. Bouton "Postuler Chauffeur" (Nairi Logistics)
                if (interaction.customId === 'open_logistics_recrutement_modal') {
                    const modal = new ModalBuilder()
                        .setCustomId('modal_logistics_recrutement_submit')
                        .setTitle('Nairi Logistics — Candidature Chauffeur');

                    const experienceInput = new TextInputBuilder()
                        .setCustomId('recrutement_experience')
                        .setLabel("Expérience dans le transport / conduite")
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true);

                    modal.addComponents(
                        new ActionRowBuilder().addComponents(experienceInput)
                    );

                    return await interaction.showModal(modal);
                }

                // 4. Bouton de publication de communiqué (Bureau de direction)
                if (interaction.customId === 'bureau_announcement') {
                    const modal = new ModalBuilder()
                        .setCustomId('modal_announcement_submit')
                        .setTitle('Publier un Communiqué Officiel');

                    const titleInput = new TextInputBuilder()
                        .setCustomId('announcement_title')
                        .setLabel("Titre du communiqué")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);

                    const contentInput = new TextInputBuilder()
                        .setCustomId('announcement_content')
                        .setLabel("Contenu du message")
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true);

                    modal.addComponents(
                        new ActionRowBuilder().addComponents(titleInput),
                        new ActionRowBuilder().addComponents(contentInput)
                    );

                    return await interaction.showModal(modal);
                }

                // 5. Fermeture / Archivage de ticket ou dossier
                if (interaction.customId === 'close_ticket') {
                    await interaction.reply({ content: "Fermeture et archivage du dossier en cours...", ephemeral: true });
                    setTimeout(async () => {
                        if (interaction.channel && interaction.channel.deletable) {
                            await interaction.channel.delete();
                        }
                    }, 3000);
                    return;
                }
            }

            // --- GESTION DES MENUS DÉROULANTS (SELECT MENUS) ---
            if (interaction.isStringSelectMenu()) {
                if (interaction.customId === 'bureau_management_menu') {
                    const choice = interaction.values[0];

                    if (choice === 'nav_finance') {
                        return await interaction.reply({ content: "Redirection vers les registres financiers... (Consultez le salon #finance)", ephemeral: true });
                    }
                    if (choice === 'nav_partners') {
                        return await interaction.reply({ content: "Module de gestion des partenaires actif.", ephemeral: true });
                    }
                    if (choice === 'mod_lockdown') {
                        const channel = interaction.channel;
                        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
                        return await interaction.reply({ content: "🔒 **Verrouillage d'urgence activé** sur ce salon.", ephemeral: true });
                    }
                    if (choice === 'mod_purge') {
                        await interaction.channel.bulkDelete(10, true).catch(() => {});
                        return await interaction.reply({ content: "🧹 Nettoyage des 10 derniers messages effectué.", ephemeral: true });
                    }
                }
            }

            // --- GESTION DES SOUMISSIONS DE MODALES ---
            if (interaction.isModalSubmit()) {
                // 1. Soumission Secrétariat
                if (interaction.customId === 'modal_secretariat_submit') {
                    const type = interaction.fields.getTextInputValue('secretariat_type');
                    const details = interaction.fields.getTextInputValue('secretariat_details');

                    const guild = interaction.guild;
                    const catNairi = guild.channels.cache.find(c => c.name === "NAIRI CORPORATION" && c.type === ChannelType.GuildCategory);

                    const ticketChannel = await guild.channels.create({
                        name: `dossier-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                        type: ChannelType.GuildText,
                        parent: catNairi ? catNairi.id : null,
                        permissionOverwrites: [
                            { id: guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
                            { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
                            { id: guild.roles.cache.find(r => r.name === "DIRECTEUR")?.id || guild.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
                        ]
                    });

                    const embed = {
                        color: 0x111111,
                        title: "NOUVEAU DOSSIER ENREGISTRÉ — SECRÉTARIAT",
                        fields: [
                            { name: "Demandeur", value: `<@${interaction.user.id}>`, inline: true },
                            { name: "Objet", value: type, inline: true },
                            { name: "Détails", value: details }
                        ],
                        footer: { text: "NAIRI OS • DOSSIER SÉCURISÉ" },
                        timestamp: new Date().toISOString()
                    };

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('close_ticket').setLabel('Clôturer le dossier').setStyle(ButtonStyle.Secondary)
                    );

                    await ticketChannel.send({ content: `<@${interaction.user.id}>, votre dossier a été ouvert avec succès. La direction va y répondre sous peu.`, embeds: [embed], components: [row] });

                    await logAction(guild, `Ouverture d'un dossier secrétariat par ${interaction.user.tag} (Objet: ${type})`);

                    return await interaction.reply({ content: `Votre dossier a été créé avec succès : <#${ticketChannel.id}>`, ephemeral: true });
                }

                // 2. Soumission Livraison (Logistics)
                if (interaction.customId === 'modal_livraison_submit') {
                    const destination = interaction.fields.getTextInputValue('livraison_destination');
                    const cargo = interaction.fields.getTextInputValue('livraison_cargo');

                    const guild = interaction.guild;
                    const catLogistics = guild.channels.cache.find(c => c.name === "NAIRI LOGISTICS" && c.type === ChannelType.GuildCategory);

                    const ticketChannel = await guild.channels.create({
                        name: `fret-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                        type: ChannelType.GuildText,
                        parent: catLogistics ? catLogistics.id : null,
                        permissionOverwrites: [
                            { id: guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
                            { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
                            { id: guild.roles.cache.find(r => r.name === "DIRECTEUR")?.id || guild.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
                        ]
                    });

                    const embed = {
                        color: 0x111111,
                        title: "NOUVELLE DEMANDE DE FRET — NAIRI LOGISTICS",
                        fields: [
                            { name: "Demandeur", value: `<@${interaction.user.id}>`, inline: true },
                            { name: "Destination", value: destination, inline: true },
                            { name: "Marchandise", value: cargo }
                        ],
                        footer: { text: "NAIRI LOGISTICS • FREIGHT DISPATCH" },
                        timestamp: new Date().toISOString()
                    };

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('close_ticket').setLabel('Clôturer la mission').setStyle(ButtonStyle.Secondary)
                    );

                    await ticketChannel.send({ content: `<@${interaction.user.id}>, votre demande de fret a été transmise à la régie logistique.`, embeds: [embed], components: [row] });

                    await logAction(guild, `Demande de fret créée par ${interaction.user.tag} vers ${destination}`);

                    return await interaction.reply({ content: `Votre dossier de livraison a été ouvert : <#${ticketChannel.id}>`, ephemeral: true });
                }

                // 3. Soumission Recrutement Chauffeur
                if (interaction.customId === 'modal_logistics_recrutement_submit') {
                    const experience = interaction.fields.getTextInputValue('recrutement_experience');
                    const guild = interaction.guild;

                    await logAction(guild, `Candidature chauffeur reçue de la part de ${interaction.user.tag}. Expérience: ${experience}`);

                    return await interaction.reply({ content: "Votre candidature au poste de chauffeur-livreur a bien été transmise à la direction logistique. Étude du dossier en cours.", ephemeral: true });
                }

                // 4. Soumission Communiqué Officiel
                if (interaction.customId === 'modal_announcement_submit') {
                    const title = interaction.fields.getTextInputValue('announcement_title');
                    const content = interaction.fields.getTextInputValue('announcement_content');

                    const guild = interaction.guild;
                    const catNairi = guild.channels.cache.find(c => c.name === "NAIRI CORPORATION" && c.type === ChannelType.GuildCategory);
                    const annoncesChannel = guild.channels.cache.find(c => c.name === "annonces" && c.parentId === catNairi?.id);

                    if (!annoncesChannel) {
                        return await interaction.reply({ content: "Salon #annonces introuvable dans la catégorie Nairi Corporation.", ephemeral: true });
                    }

                    const embed = {
                        color: 0x111111,
                        title: `📢 ${title}`,
                        description: content,
                        footer: { text: `COMMUNIQUÉ OFFICIEL • ${interaction.user.username}` },
                        timestamp: new Date().toISOString()
                    };

                    await annoncesChannel.send({ embeds: [embed] });
                    return await interaction.reply({ content: "Communiqué officiel publié avec succès dans `#annonces`.", ephemeral: true });
                }
            }
        } catch (error) {
            console.error("Erreur critique dans interactionCreate :", error);
            if (interaction.deferred || interaction.replied) {
                await interaction.followUp({ content: "Une erreur interne est survenue lors du traitement de l'interaction.", ephemeral: true }).catch(() => {});
            } else {
                await interaction.reply({ content: "Une erreur interne est survenue lors du traitement de l'interaction.", ephemeral: true }).catch(() => {});
            }
        }
    }
};
