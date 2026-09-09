const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionFlagsBits, MessageFlags } = require('discord.js');

const CONFIG_POSTOP = {
    staffRoles: ['1539267928762097770', '1539400476536217690'],
    channels: {
        services: '1547194699125760020', // Salon pour les services / prestations Post Op
        recrutement: '1547194702674001942'  // Salon pour le recrutement Post Op
    }
};

function getServicesEmbed() {
    return new EmbedBuilder()
        .setTitle('POST-OP LOGISTICS — DEMANDE DE PRESTATION')
        .setDescription('Bienvenue sur le portail officiel de Post-Op Logistics. Cet espace sécurisé vous permet de soumettre une demande de service, de logistique ou de transport.\n\nChaque dossier fait l\'objet d\'une instruction confidentielle par notre équipe opérationnelle avant prise en charge.')
        .setColor(0x2B2D31)
        .setFooter({ text: 'Post-Op Logistics • Département Commercial & Logistique' })
        .setTimestamp();
}

function getServicesComponents() {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('menu_ticket_postop_service')
            .setPlaceholder('Sélectionner une prestation...')
            .addOptions([
                { label: 'Demande de Transport & Logistique', value: 'srv_transport', description: 'Planification d\'une course ou d\'un convoi sécurisé' },
                { label: 'Prestation Spéciale & Sur-mesure', value: 'srv_custom', description: 'Étude d\'un contrat ou d\'une mission particulière' }
            ])
    );
}

function getRecrutementEmbed() {
    return new EmbedBuilder()
        .setTitle('POST-OP LOGISTICS — RECRUTEMENT')
        .setDescription('Intégrez les rangs de Post-Op Logistics et participez activement à nos opérations sur le terrain selon vos compétences et vos qualifications.\n\nSélectionnez le poste ou la filière souhaitée via le sélecteur ci-dessous.')
        .setColor(0x2B2D31)
        .setFooter({ text: 'Post-Op Logistics • Ressources Humaines' })
        .setTimestamp();
}

function getRecrutementComponents() {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('menu_ticket_postop_recrutement')
            .setPlaceholder('Sélectionner un poste à pourvoir...')
            .addOptions([
                { label: 'Chauffeur / Livreur Terrain', value: 'rec_chauffeur', description: 'Assurer les transports et le transit des cargaisons' },
                { label: 'Logisticien / Gestionnaire', value: 'rec_logisticien', description: 'Gérer les stocks et la coordination logistique' },
                { label: 'Agent de Sécurité & Escorte', value: 'rec_securite', description: 'Protéger les convois et sécuriser les périmètres' }
            ])
    );
}

async function initPostOpPanels(guild) {
    const client = guild.client;

    if (!client._postopListenerRegistered) {
        client._postopListenerRegistered = true;
        client.on('interactionCreate', async (interaction) => {
            try {
                await handlePostOpInteraction(interaction);
            } catch (err) {
                console.error("Erreur critique interaction PostOp:", err);
            }
        });
    }

    await guild.channels.fetch();

    const srvChan = guild.channels.cache.get(CONFIG_POSTOP.channels.services);
    const recChan = guild.channels.cache.get(CONFIG_POSTOP.channels.recrutement);

    if (srvChan) {
        try {
            const msgs = await srvChan.messages.fetch({ limit: 10 });
            const botMsg = msgs.find(m => m.author.id === client.user.id && m.embeds[0]?.title?.includes('DEMANDE DE PRESTATION'));
            if (!botMsg) {
                await srvChan.send({ embeds: [getServicesEmbed()], components: [getServicesComponents()] });
            } else {
                await botMsg.edit({ embeds: [getServicesEmbed()], components: [getServicesComponents()] });
            }
        } catch (e) {
            console.error("[POSTOP] Erreur salon Services :", e);
        }
    }

    if (recChan) {
        try {
            const msgs = await recChan.messages.fetch({ limit: 10 });
            const botMsg = msgs.find(m => m.author.id === client.user.id && m.embeds[0]?.title?.includes('RECRUTEMENT'));
            if (!botMsg) {
                await recChan.send({ embeds: [getRecrutementEmbed()], components: [getRecrutementComponents()] });
            } else {
                await botMsg.edit({ embeds: [getRecrutementEmbed()], components: [getRecrutementComponents()] });
            }
        } catch (e) {
            console.error("[POSTOP] Erreur salon Recrutement :", e);
        }
    }
}

async function handlePostOpInteraction(interaction) {
    const id = interaction.customId;
    if (!id) return;

    const isPostOpAction = id === 'menu_ticket_postop_service' || id === 'menu_ticket_postop_recrutement' || id.startsWith('mod_postop_') || id.startsWith('menu_staff_postop_') || id.startsWith('mod_postop_edit_');
    if (!isPostOpAction) return;

    if (interaction.handledByPostOp) return;
    interaction.handledByPostOp = true;

    if (interaction.isStringSelectMenu()) {
        const val = interaction.values[0];

        if (id === 'menu_ticket_postop_service') {
            const serviceNames = { 'srv_transport': 'Transport & Logistique', 'srv_custom': 'Prestation Sur-mesure' };
            const modal = new ModalBuilder()
                .setCustomId(`mod_postop_service_${val}`)
                .setTitle(`Demande — ${serviceNames[val] || 'Prestation'}`)
                .addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('prenom').setLabel('Prénom').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nom').setLabel('Nom').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('telephone').setLabel('Téléphone').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('cahier_charges').setLabel('Détails / Cahier des charges').setStyle(TextInputStyle.Paragraph).setRequired(true))
                );
            return await interaction.showModal(modal);
        }

        if (id === 'menu_ticket_postop_recrutement') {
            const postNames = { 'rec_chauffeur': 'Chauffeur / Livreur Terrain', 'rec_logisticien': 'Logisticien / Gestionnaire', 'rec_securite': 'Agent de Sécurité & Escorte' };
            const modal = new ModalBuilder()
                .setCustomId(`mod_postop_recrutement_${val}`)
                .setTitle(`Candidature — ${postNames[val] || 'Poste'}`)
                .addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('prenom').setLabel('Prénom').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nom').setLabel('Nom').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('telephone').setLabel('Téléphone').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('motivations').setLabel('Expériences & Motivations').setStyle(TextInputStyle.Paragraph).setRequired(true))
                );
            return await interaction.showModal(modal);
        }

        if (id.startsWith('menu_staff_postop_')) {
            const member = interaction.member;
            const hasStaffRole = member.roles.cache.some(role => CONFIG_POSTOP.staffRoles.includes(role.id));

            if (!hasStaffRole) {
                return await interaction.reply({ content: 'Accès restreint aux membres habilités de Post-Op Logistics.', flags: [MessageFlags.Ephemeral] });
            }

            const ticketId = id.replace('menu_staff_postop_', '');
            const actionVal = interaction.values[0];
            const message = interaction.message;
            const oldEmbed = message.embeds[0];

            if (actionVal === 'claim') {
                if (oldEmbed.description.includes('Pris en charge par')) {
                    return await interaction.reply({ content: 'Ce dossier a déjà été pris en charge par un autre membre. Impossible de le reprendre.', flags: [MessageFlags.Ephemeral] });
                }

                const embed = EmbedBuilder.from(oldEmbed);
                embed.setDescription(oldEmbed.description.replace('*Statut : En attente de prise en charge.*', `*Statut : Dossier pris en charge par **${member.user.tag}***`));

                await message.edit({ embeds: [embed], components: message.components });
                return await interaction.reply({ content: 'Vous avez pris en charge ce dossier avec succès.', flags: [MessageFlags.Ephemeral] });
            }

            if (actionVal === 'modify') {
                const modal = new ModalBuilder()
                    .setCustomId(`mod_postop_edit_${ticketId}`)
                    .setTitle('Mise à jour du dossier')
                    .addComponents(
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nouveau_contenu').setLabel('Nouvelles informations / Consignes').setStyle(TextInputStyle.Paragraph).setRequired(true))
                    );
                return await interaction.showModal(modal);
            }

            if (actionVal === 'close') {
                await interaction.reply({ content: 'Clôture administrative du dossier en cours...', flags: [MessageFlags.Ephemeral] });
                setTimeout(async () => {
                    try {
                        const channel = interaction.channel;
                        const closedCategory = channel.guild.channels.cache.find(c => c.name.toLowerCase().includes('dossier traité') || c.name.toLowerCase().includes('archives'));
                        if (closedCategory) {
                            await channel.setParent(closedCategory.id);
                            await channel.permissionOverwrites.set([
                                { id: channel.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                                ...CONFIG_POSTOP.staffRoles.map(rId => ({ id: rId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory] }))
                            ]);
                            await channel.setName(`archive-${channel.name}`.substring(0, 100));
                        } else {
                            await channel.delete('Dossier clôturé.');
                        }
                    } catch (err) {
                        console.error("Erreur clôture postop :", err);
                    }
                }, 5000);
                return;
            }
        }
    }

    if (interaction.isModalSubmit()) {
        const modId = interaction.customId;

        if (modId.startsWith('mod_postop_service_') || modId.startsWith('mod_postop_recrutement_') || modId.startsWith('mod_postop_edit_')) {
            const guild = interaction.guild;
            const user = interaction.user;

            if (modId.startsWith('mod_postop_edit_')) {
                const ticketId = modId.replace('mod_postop_edit_', '');
                const nouveauContenu = interaction.fields.getTextInputValue('nouveau_contenu');
                const channel = guild.channels.cache.get(ticketId);

                if (channel) {
                    try {
                        const fetchedMsg = await channel.messages.fetch({ limit: 10 });
                        const targetMsg = fetchedMsg.find(m => m.embeds.length > 0 && m.embeds[0].title?.includes('DOSSIER OPÉRATIONNEL'));
                        if (targetMsg) {
                            const oldEmbed = targetMsg.embeds[0];
                            const embed = EmbedBuilder.from(oldEmbed);
                            let desc = oldEmbed.description;
                            
                            desc = desc.replace(/(📄 \*\*CONTENU DU DOSSIER\*\*)\n[\s\S]*?(?=\n\n────────────────────────────────────────)/, `$1\n${nouveauContenu}`);
                            
                            embed.setDescription(desc);
                            await targetMsg.edit({ embeds: [embed] });
                        }
                    } catch (err) {
                        console.error("Erreur MAJ message postop :", err);
                    }
                }
                return await interaction.reply({ content: 'Le contenu du dossier a été mis à jour avec succès.', flags: [MessageFlags.Ephemeral] });
            }

            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

            const isRecrutement = modId.startsWith('mod_postop_recrutement_');
            const subType = isRecrutement ? modId.replace('mod_postop_recrutement_', '') : modId.replace('mod_postop_service_', '');
            
            const typeLabel = isRecrutement ? 'recrutement' : 'prestation';

            const prenom = interaction.fields.getTextInputValue('prenom');
            const nom = interaction.fields.getTextInputValue('nom');
            const telephone = interaction.fields.getTextInputValue('telephone');
            const champPrincipal = isRecrutement ? interaction.fields.getTextInputValue('motivations') : interaction.fields.getTextInputValue('cahier_charges');

            let dossierCategory = guild.channels.cache.find(
                c => c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes('dossier en cours')
            );

            if (!dossierCategory) {
                dossierCategory = await guild.channels.create({
                    name: 'DOSSIER EN COURS',
                    type: ChannelType.GuildCategory
                });
            }

            const permissionOverwrites = [
                { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
            ];

            for (const roleId of CONFIG_POSTOP.staffRoles) {
                permissionOverwrites.push({ id: roleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });
            }

            const cleanChannelName = `${isRecrutement ? ' rec' : ' srv'}-${user.username}`.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 90);
            const ticketChannel = await guild.channels.create({
                name: cleanChannelName,
                type: ChannelType.GuildText,
                parent: dossierCategory.id,
                permissionOverwrites: permissionOverwrites
            });

            const embedTicket = new EmbedBuilder()
                .setTitle(`📋 DOSSIER OPÉRATIONNEL — ${typeLabel.toUpperCase()}`)
                .setDescription(
                    `L'ouverture de ce dossier fait suite à une requête enregistrée auprès des services de Post-Op Logistics.\n\n` +
                    `────────────────────────────────────────\n` +
                    `👤 **INFORMATIONS DU DEMANDEUR**\n` +
                    `• **Identité :** ${prenom} ${nom}\n` +
                    `• **Contact Téléphonique :** ${telephone}\n` +
                    `• **Compte Discord :** <@${user.id}>\n` +
                    `• **Filière / Type :** ${subType}\n` +
                    `────────────────────────────────────────\n` +
                    `📄 **CONTENU DU DOSSIER**\n` +
                    `${champPrincipal}\n\n` +
                    `────────────────────────────────────────\n` +
                    `*Statut : En attente de prise en charge.*`
                )
                .setColor(0x2B2D31)
                .setFooter({ text: 'Post-Op Logistics • Centre de Traitement' })
                .setTimestamp();

            const staffSelectMenu = new StringSelectMenuBuilder()
                .setCustomId(`menu_staff_postop_${ticketChannel.id}`)
                .setPlaceholder('⚙️ Gestion opérationnelle du dossier...')
                .addOptions([
                    { label: 'Prendre en charge le dossier', value: 'claim', description: 'Assigner la responsabilité de la mission à votre profil' },
                    { label: 'Modifier les informations', value: 'modify', description: 'Actualiser ou compléter le contenu du dossier' },
                    { label: 'Clôturer le dossier', value: 'close', description: 'Archiver et fermer définitivement le dossier' }
                ]);

            const componentsList = [
                new ActionRowBuilder().addComponents(staffSelectMenu)
            ];

            await ticketChannel.send({
                content: `<@${user.id}> ${CONFIG_POSTOP.staffRoles.map(rId => `<@&${rId}>`).join(' ')}`,
                embeds: [embedTicket],
                components: componentsList
            });

            return await interaction.editReply({ content: `Votre dossier officiel a été ouvert avec succès : <#${ticketChannel.id}>` });
        }
    }
}

module.exports = { initPostOpPanels, handlePostOpInteraction };
