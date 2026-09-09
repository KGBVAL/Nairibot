const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionFlagsBits, MessageFlags } = require('discord.js');

const CONFIG_POSTOP = {
    staffRoles: ['1539267928762097770', '1539400476536217690'],
    channels: {
        commandes: '1547194706671308860',
        recrutement: '1547194709049479178',
        service: '1547194707799703563'
    }
};

function getCommandesEmbed() {
    return new EmbedBuilder()
        .setTitle('POST-OP LOGISTICS — COMMANDES & LIVRAISONS')
        .setDescription('Bienvenue sur le portail de commande de Post-Op Logistics. Utilisez le sélecteur ci-dessous pour initier une demande de livraison, de fret ou de ravitaillement sécurisé.\n\nChaque dossier fait l\'objet d\'une instruction rigoureuse par notre département opérationnel.')
        .setColor(0x2B2D31)
        .setFooter({ text: 'Post-Op Logistics • Département Commandes' })
        .setTimestamp();
}

function getCommandesComponents() {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('menu_ticket_postop_commande')
            .setPlaceholder('Sélectionner un type de commande...')
            .addOptions([
                { label: 'Livraison / Fret Standard', value: 'cmd_standard', description: 'Commander une livraison de marchandises ou de matériel' },
                { label: 'Ravitaillement en Gros', value: 'cmd_vrac', description: 'Demande de convoi ou de réapprovisionnement massif' }
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

function getServiceEmbed() {
    return new EmbedBuilder()
        .setTitle('POST-OP LOGISTICS — SUPPORT & SERVICES')
        .setDescription('Besoin d\'assistance technique, de renseignements généraux ou d\'un service particulier ? Ouvrez un dossier auprès de notre permanence via le sélecteur ci-dessous.')
        .setColor(0x2B2D31)
        .setFooter({ text: 'Post-Op Logistics • Support & Services' })
        .setTimestamp();
}

function getServiceComponents() {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('menu_ticket_postop_service')
            .setPlaceholder('Sélectionner un type de service...')
            .addOptions([
                { label: 'Assistance & Support Client', value: 'srv_support', description: 'Poser une question ou régler un litige' },
                { label: 'Partenariat / Autre Demande', value: 'srv_autre', description: 'Proposer une collaboration ou un contrat spécifique' }
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

    const cmdChan = guild.channels.cache.get(CONFIG_POSTOP.channels.commandes);
    const recChan = guild.channels.cache.get(CONFIG_POSTOP.channels.recrutement);
    const srvChan = guild.channels.cache.get(CONFIG_POSTOP.channels.service);

    if (cmdChan) {
        try {
            const msgs = await cmdChan.messages.fetch({ limit: 10 });
            const botMsg = msgs.find(m => m.author.id === client.user.id && m.embeds[0]?.title?.includes('COMMANDES & LIVRAISONS'));
            if (!botMsg) {
                await cmdChan.send({ embeds: [getCommandesEmbed()], components: [getCommandesComponents()] });
            } else {
                await botMsg.edit({ embeds: [getCommandesEmbed()], components: [getCommandesComponents()] });
            }
        } catch (e) {
            console.error("[POSTOP] Erreur salon Commandes :", e);
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

    if (srvChan) {
        try {
            const msgs = await srvChan.messages.fetch({ limit: 10 });
            const botMsg = msgs.find(m => m.author.id === client.user.id && m.embeds[0]?.title?.includes('SUPPORT & SERVICES'));
            if (!botMsg) {
                await srvChan.send({ embeds: [getServiceEmbed()], components: [getServiceComponents()] });
            } else {
                await botMsg.edit({ embeds: [getServiceEmbed()], components: [getServiceComponents()] });
            }
        } catch (e) {
            console.error("[POSTOP] Erreur salon Service :", e);
        }
    }
}

async function handlePostOpInteraction(interaction) {
    const id = interaction.customId;
    if (!id) return;

    const isPostOpAction = id === 'menu_ticket_postop_commande' || id === 'menu_ticket_postop_recrutement' || id === 'menu_ticket_postop_service' || id.startsWith('mod_postop_') || id.startsWith('menu_staff_postop_') || id.startsWith('mod_postop_edit_');
    if (!isPostOpAction) return;

    if (interaction.handledByPostOp) return;
    interaction.handledByPostOp = true;

    if (interaction.isStringSelectMenu()) {
        const val = interaction.values[0];

        if (id === 'menu_ticket_postop_commande') {
            const cmdNames = { 'cmd_standard': 'Livraison / Fret Standard', 'cmd_vrac': 'Ravitaillement en Gros' };
            const modal = new ModalBuilder()
                .setCustomId(`mod_postop_commande_${val}`)
                .setTitle(`Commande — ${cmdNames[val] || 'Prestation'}`)
                .addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('prenom').setLabel('Prénom').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nom').setLabel('Nom').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('telephone').setLabel('Téléphone').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('details').setLabel('Détails de la commande / articles').setStyle(TextInputStyle.Paragraph).setRequired(true))
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

        if (id === 'menu_ticket_postop_service') {
            const srvNames = { 'srv_support': 'Assistance & Support Client', 'srv_autre': 'Partenariat / Autre Demande' };
            const modal = new ModalBuilder()
                .setCustomId(`mod_postop_service_${val}`)
                .setTitle(`Service — ${srvNames[val] || 'Support'}`)
                .addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('prenom').setLabel('Prénom').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nom').setLabel('Nom').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('telephone').setLabel('Téléphone').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('requete').setLabel('Objet de votre demande').setStyle(TextInputStyle.Paragraph).setRequired(true))
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
                    return await interaction.reply({ content: 'Ce dossier a déjà été pris en charge par un autre opérateur.', flags: [MessageFlags.Ephemeral] });
                }

                const embed = EmbedBuilder.from(oldEmbed);
                embed.setDescription(oldEmbed.description.replace('*Statut : En attente d\'instruction.*', `*Statut : Dossier pris en charge par **${member.user.tag}***`));

                await message.edit({ embeds: [embed], components: message.components });
                return await interaction.reply({ content: 'Dossier assigné à votre profil avec succès.', flags: [MessageFlags.Ephemeral] });
            }

            if (actionVal === 'modify') {
                const modal = new ModalBuilder()
                    .setCustomId(`mod_postop_edit_${ticketId}`)
                    .setTitle('Mise à jour du dossier')
                    .addComponents(
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nouveau_contenu').setLabel('Informations complémentaires / Consignes').setStyle(TextInputStyle.Paragraph).setRequired(true))
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

        if (modId.startsWith('mod_postop_commande_') || modId.startsWith('mod_postop_recrutement_') || modId.startsWith('mod_postop_service_') || modId.startsWith('mod_postop_edit_')) {
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
                            
                            desc = desc.replace(/(📄 \*\*DÉTAILS DE LA REQUÊTE\*\*)\n[\s\S]*?(?=\n\n────────────────────────────────────────)/, `$1\n${nouveauContenu}`);
                            
                            embed.setDescription(desc);
                            await targetMsg.edit({ embeds: [embed] });
                        }
                    } catch (err) {
                        console.error("Erreur MAJ message postop :", err);
                    }
                }
                return await interaction.reply({ content: 'Les éléments du dossier ont été actualisés avec succès.', flags: [MessageFlags.Ephemeral] });
            }

            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

            let typeLabel = 'commande';
            let subType = '';
            let champPrincipal = '';

            if (modId.startsWith('mod_postop_commande_')) {
                typeLabel = 'commandes & livraisons';
                subType = modId.replace('mod_postop_commande_', '');
                champPrincipal = interaction.fields.getTextInputValue('details');
            } else if (modId.startsWith('mod_postop_recrutement_')) {
                typeLabel = 'recrutement';
                subType = modId.replace('mod_postop_recrutement_', '');
                champPrincipal = interaction.fields.getTextInputValue('motivations');
            } else if (modId.startsWith('mod_postop_service_')) {
                typeLabel = 'support & services';
                subType = modId.replace('mod_postop_service_', '');
                champPrincipal = interaction.fields.getTextInputValue('requete');
            }

            const prenom = interaction.fields.getTextInputValue('prenom');
            const nom = interaction.fields.getTextInputValue('nom');
            const telephone = interaction.fields.getTextInputValue('telephone');

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

            const prefixMap = { 'commandes & livraisons': 'cmd', 'recrutement': 'rec', 'support & services': 'srv' };
            const cleanChannelName = `${prefixMap[typeLabel] || 'ticket'}-${user.username}`.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 90);
            
            const ticketChannel = await guild.channels.create({
                name: cleanChannelName,
                type: ChannelType.GuildText,
                parent: dossierCategory.id,
                permissionOverwrites: permissionOverwrites
            });

            const embedTicket = new EmbedBuilder()
                .setTitle(`POST-OP LOGISTICS — DOSSIER #${ticketChannel.name.toUpperCase()}`)
                .setDescription(
                    `**RÉFÉRENCE :** ${typeLabel.toUpperCase()} (${subType})\n\n` +
                    `────────────────────────────────────────\n` +
                    `🏢 **IDENTIFICATION DU DEMANDEUR**\n` +
                    `• **Titulaire :** ${prenom} ${nom}\n` +
                    `• **Ligne directe :** ${telephone}\n` +
                    `────────────────────────────────────────\n` +
                    `📄 **DÉTAILS DE LA REQUÊTE**\n` +
                    `${champPrincipal}\n\n` +
                    `────────────────────────────────────────\n` +
                    `*Statut : En attente d'instruction.*`
                )
                .setColor(0x2B2D31)
                .setFooter({ text: 'Post-Op Logistics • Département Opérationnel' })
                .setTimestamp();

            const staffSelectMenu = new StringSelectMenuBuilder()
                .setCustomId(`menu_staff_postop_${ticketChannel.id}`)
                .setPlaceholder('Gestion administrative du dossier...')
                .addOptions([
                    { label: 'Prendre en charge', value: 'claim', description: 'Assumer la responsabilité opérationnelle du dossier' },
                    { label: 'Modifier les informations', value: 'modify', description: 'Ajouter des notes ou mettre à jour le contenu' },
                    { label: 'Clôturer le dossier', value: 'close', description: 'Archiver et clore définitivement la procédure' }
                ]);

            const componentsList = [
                new ActionRowBuilder().addComponents(staffSelectMenu)
            ];

            await ticketChannel.send({
                content: `<@${user.id}> ${CONFIG_POSTOP.staffRoles.map(rId => `<@&${rId}>`).join(' ')}`,
                embeds: [embedTicket],
                components: componentsList
            });

            return await interaction.editReply({ content: `Votre dossier a été enregistré avec succès : <#${ticketChannel.id}>` });
        }
    }
}

module.exports = { initPostOpPanels, handlePostOpInteraction };
