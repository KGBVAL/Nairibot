const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionFlagsBits, MessageFlags } = require('discord.js');

const CONFIG_ASSOCIATION = {
    staffRoles: ['1539267928762097770', '1539400476536217690'],
    channels: {
        propositions: '1547194699125760020',
        recrutementBenevoles: '1547194702674001942'
    }
};

function getPropositionsEmbed() {
    return new EmbedBuilder()
        .setTitle('ASSOCIATION — PROPOSITIONS CITOYENNES')
        .setDescription('Cet espace institutionnel permet aux concitoyens de soumettre des initiatives, des projets ou des doléances relatifs à la vie du quartier.\n\nChaque proposition fait l\'objet d\'une instruction rigoureuse par notre conseil avant éventuelle publication publique.')
        .setColor(0x2B2D31)
        .setFooter({ text: 'Association • Commission Citoyenne' })
        .setTimestamp();
}

function getPropositionsComponents() {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('menu_ticket_proposition')
            .setPlaceholder('Déposer une proposition citoyenne...')
            .addOptions([
                { label: 'Soumettre un projet ou une idée', value: 'prop_standard', description: 'Ouvrir un dossier d\'instruction confidentiel' }
            ])
    );
}

function getBenevolatEmbed() {
    return new EmbedBuilder()
        .setTitle('ASSOCIATION — ENGAGEMENT BÉNÉVOLE')
        .setDescription('Participez activement au développement de nos actions associatives et intégrez nos équipes de terrain selon vos compétences et vos disponibilités.\n\nSélectionnez le pôle d\'engagement souhaité via le sélecteur ci-dessous.')
        .setColor(0x2B2D31)
        .setFooter({ text: 'Association • Ressources Bénévoles' })
        .setTimestamp();
}

function getBenevolatComponents() {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('menu_ticket_benevolat')
            .setPlaceholder('Sélectionner un pôle d\'engagement...')
            .addOptions([
                { label: 'Action Sociale & Solidarité', value: 'ben_social', description: 'Soutien aux permanences et aide de terrain' },
                { label: 'Animation & Événementiel', value: 'ben_animation', description: 'Organisation des initiatives et manifestations du quartier' },
                { label: 'Logistique & Technique', value: 'ben_logistique', description: 'Appui opérationnel et gestion des équipements' }
            ])
    );
}

async function initAssociationPanels(guild) {
    const client = guild.client;

    if (!client._assocListenerRegistered) {
        client._assocListenerRegistered = true;
        client.on('interactionCreate', async (interaction) => {
            try {
                await handleAssociationInteraction(interaction);
            } catch (err) {
                console.error("Erreur critique interaction Association:", err);
            }
        });
    }

    await guild.channels.fetch();

    const propChan = guild.channels.cache.get(CONFIG_ASSOCIATION.channels.propositions);
    const benChan = guild.channels.cache.get(CONFIG_ASSOCIATION.channels.recrutementBenevoles);

    if (propChan) {
        try {
            const msgs = await propChan.messages.fetch({ limit: 10 });
            const botMsg = msgs.find(m => m.author.id === client.user.id && m.embeds[0]?.title?.includes('PROPOSITIONS CITOYENNES'));
            if (!botMsg) {
                await propChan.send({ embeds: [getPropositionsEmbed()], components: [getPropositionsComponents()] });
            } else {
                await botMsg.edit({ embeds: [getPropositionsEmbed()], components: [getPropositionsComponents()] });
            }
        } catch (e) {
            console.error("[ASSOCIATION] Erreur salon Propositions :", e);
        }
    }

    if (benChan) {
        try {
            const msgs = await benChan.messages.fetch({ limit: 10 });
            const botMsg = msgs.find(m => m.author.id === client.user.id && m.embeds[0]?.title?.includes('ENGAGEMENT BÉNÉVOLE'));
            if (!botMsg) {
                await benChan.send({ embeds: [getBenevolatEmbed()], components: [getBenevolatComponents()] });
            } else {
                await botMsg.edit({ embeds: [getBenevolatEmbed()], components: [getBenevolatComponents()] });
            }
        } catch (e) {
            console.error("[ASSOCIATION] Erreur salon Bénévolat :", e);
        }
    }
}

async function handleAssociationInteraction(interaction) {
    const id = interaction.customId;
    if (!id) return;

    const isAssocAction = id === 'menu_ticket_proposition' || id === 'menu_ticket_benevolat' || id.startsWith('mod_assoc_') || id.startsWith('menu_staff_action_') || id.startsWith('mod_prop_edit_');
    if (!isAssocAction) return;

    if (interaction.handledByAssociation) return;
    interaction.handledByAssociation = true;

    if (interaction.isStringSelectMenu()) {
        const val = interaction.values[0];

        if (id === 'menu_ticket_proposition') {
            const modal = new ModalBuilder()
                .setCustomId('mod_assoc_proposition')
                .setTitle('Instruction — Proposition Citoyenne')
                .addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('prenom').setLabel('Prénom').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nom').setLabel('Nom').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('telephone').setLabel('Téléphone').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('sujet').setLabel('Sujet de la proposition').setStyle(TextInputStyle.Paragraph).setRequired(true))
                );
            return await interaction.showModal(modal);
        }

        if (id === 'menu_ticket_benevolat') {
            const poleNames = { 'ben_social': 'Action Sociale & Solidarité', 'ben_animation': 'Animation & Événementiel', 'ben_logistique': 'Logistique & Technique' };
            const modal = new ModalBuilder()
                .setCustomId(`mod_assoc_benevolat_${val}`)
                .setTitle(`Candidature — ${poleNames[val] || 'Bénévole'}`)
                .addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('prenom').setLabel('Prénom').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nom').setLabel('Nom').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('telephone').setLabel('Téléphone').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('motivations').setLabel('Pourquoi souhaitez-vous vous engager ?').setStyle(TextInputStyle.Paragraph).setRequired(true))
                );
            return await interaction.showModal(modal);
        }

        if (id.startsWith('menu_staff_action_')) {
            const member = interaction.member;
            const hasStaffRole = member.roles.cache.some(role => CONFIG_ASSOCIATION.staffRoles.includes(role.id));

            if (!hasStaffRole) {
                return await interaction.reply({ content: 'Accès restreint aux membres habilités de l\'association.', flags: [MessageFlags.Ephemeral] });
            }

            const ticketId = id.replace('menu_staff_action_', '');
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

            if (actionVal === 'validate') {
                const embedDesc = oldEmbed.description;
                const matchNom = embedDesc.match(/• Nom : (.*?) (.*?)\n/);
                const prenom = matchNom ? matchNom[1] : 'A.';
                const nom = matchNom ? matchNom[2] : 'C.';
                const initiales = `${prenom.charAt(0).toUpperCase()}. ${nom.charAt(0).toUpperCase()}.`;

                const matchSujet = embedDesc.match(/📄 \*\*CONTENU DE LA REQUÊTE\*\*([\s\S]*?)(?=\n\n────────────────────────────────────────|\n\n\*Statut|$)/);
                const sujetTexte = matchSujet ? matchSujet[1].trim() : 'Proposition validée.';

                const publicChannel = interaction.guild.channels.cache.get(CONFIG_ASSOCIATION.channels.propositions);
                if (publicChannel) {
                    const publicEmbed = new EmbedBuilder()
                        .setTitle('PROPOSITION CITOYENNE VALIDÉE')
                        .setDescription(`> "${sujetTexte}"\n\n— *${initiales}*`)
                        .setColor(0x2B2D31)
                        .setTimestamp();
                    await publicChannel.send({ embeds: [publicEmbed] });
                }

                await interaction.reply({ content: 'La proposition a été officiellement validée et publiée.', flags: [MessageFlags.Ephemeral] });

                setTimeout(async () => {
                    try {
                        const channel = interaction.channel;
                        const closedCategory = channel.guild.channels.cache.find(c => c.name.toLowerCase().includes('dossier traité') || c.name.toLowerCase().includes('archives'));
                        if (closedCategory) {
                            await channel.setParent(closedCategory.id);
                            await channel.permissionOverwrites.set([
                                { id: channel.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                                ...CONFIG_ASSOCIATION.staffRoles.map(rId => ({ id: rId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory] }))
                            ]);
                            await channel.setName(`archive-${channel.name}`.substring(0, 100));
                        } else {
                            await channel.delete('Proposition validée et archivée.');
                        }
                    } catch (err) {
                        console.error("Erreur archivage :", err);
                    }
                }, 5000);
                return;
            }

            if (actionVal === 'modify') {
                const modal = new ModalBuilder()
                    .setCustomId(`mod_prop_edit_${ticketId}`)
                    .setTitle('Demande de modification')
                    .addComponents(
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nouveau_sujet').setLabel('Nouveau contenu actualisé').setStyle(TextInputStyle.Paragraph).setRequired(true))
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
                                ...CONFIG_ASSOCIATION.staffRoles.map(rId => ({ id: rId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory] }))
                            ]);
                            await channel.setName(`archive-${channel.name}`.substring(0, 100));
                        } else {
                            await channel.delete('Dossier clôturé.');
                        }
                    } catch (err) {
                        console.error("Erreur clôture :", err);
                    }
                }, 5000);
                return;
            }
        }
    }

    if (interaction.isModalSubmit()) {
        const modId = interaction.customId;

        if (modId === 'mod_assoc_proposition' || modId.startsWith('mod_assoc_benevolat_') || modId.startsWith('mod_prop_edit_')) {
            const guild = interaction.guild;
            const user = interaction.user;

            if (modId.startsWith('mod_prop_edit_')) {
                const ticketId = modId.replace('mod_prop_edit_', '');
                const nouveauSujet = interaction.fields.getTextInputValue('nouveau_sujet');
                const channel = guild.channels.cache.get(ticketId);

                if (channel) {
                    try {
                        const fetchedMsg = await channel.messages.fetch({ limit: 10 });
                        const targetMsg = fetchedMsg.find(m => m.embeds.length > 0 && m.embeds[0].title?.includes('DOSSIER ADMINISTRATIF'));
                        if (targetMsg) {
                            const oldEmbed = targetMsg.embeds[0];
                            const embed = EmbedBuilder.from(oldEmbed);
                            let desc = oldEmbed.description;
                            
                            // Remplacement du contenu de la requête dans l'embed corporate
                            desc = desc.replace(/(📄 \*\*CONTENU DE LA REQUÊTE\*\*)\n[\s\S]*?(?=\n\n────────────────────────────────────────)/, `$1\n${nouveauSujet}`);
                            
                            embed.setDescription(desc);
                            await targetMsg.edit({ embeds: [embed] });
                        }
                    } catch (err) {
                        console.error("Erreur MAJ message :", err);
                    }
                }
                return await interaction.reply({ content: 'Le contenu du dossier a été mis à jour avec succès.', flags: [MessageFlags.Ephemeral] });
            }

            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

            const isBenevolat = modId.startsWith('mod_assoc_benevolat_');
            const ticketType = isBenevolat ? 'candidature bénévole' : 'proposition citoyenne';
            const poleType = isBenevolat ? modId.replace('mod_assoc_benevolat_', '') : null;

            const prenom = interaction.fields.getTextInputValue('prenom');
            const nom = interaction.fields.getTextInputValue('nom');
            const telephone = interaction.fields.getTextInputValue('telephone');
            const champPrincipal = isBenevolat ? interaction.fields.getTextInputValue('motivations') : interaction.fields.getTextInputValue('sujet');

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

            for (const roleId of CONFIG_ASSOCIATION.staffRoles) {
                permissionOverwrites.push({ id: roleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });
            }

            const cleanChannelName = `${isBenevolat ? ' benevole' : ' prop'}-${user.username}`.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 90);
            const ticketChannel = await guild.channels.create({
                name: cleanChannelName,
                type: ChannelType.GuildText,
                parent: dossierCategory.id,
                permissionOverwrites: permissionOverwrites
            });

            const embedTicket = new EmbedBuilder()
                .setTitle(`📋 DOSSIER ADMINISTRATIF — ${ticketType.toUpperCase()}`)
                .setDescription(
                    `L'ouverture de ce dossier fait suite à une démarche officielle enregistrée auprès de l'administration.\n\n` +
                    `────────────────────────────────────────\n` +
                    `👤 **INFORMATIONS DU DEMANDEUR**\n` +
                    `• **Identité :** ${prenom} ${nom}\n` +
                    `• **Contact Téléphonique :** ${telephone}\n` +
                    `• **Compte Discord :** <@${user.id}>\n` +
                    (isBenevolat ? `• **Pôle sollicité :** ${poleType === 'ben_social' ? 'Action Sociale & Solidarité' : poleType === 'ben_animation' ? 'Animation & Événementiel' : 'Logistique & Technique'}\n` : ``) +
                    `────────────────────────────────────────\n` +
                    `📄 **CONTENU DE LA REQUÊTE**\n` +
                    `${champPrincipal}\n\n` +
                    `────────────────────────────────────────\n` +
                    `*Statut : En attente de prise en charge.*`
                )
                .setColor(0x2B2D31)
                .setFooter({ text: 'Association • Service d\'Instruction' })
                .setTimestamp();

            const selectOptions = [
                { label: 'Prendre en charge le dossier', value: 'claim', description: 'Assigner la responsabilité de l\'instruction à votre profil' }
            ];

            if (!isBenevolat) {
                selectOptions.push({ label: 'Valider et publier la proposition', value: 'validate', description: 'Diffuser la proposition dans le salon public' });
                selectOptions.push({ label: 'Demander une modification', value: 'modify', description: 'Inviter le demandeur à réviser le contenu' });
            }

            selectOptions.push({ label: 'Clôturer le dossier', value: 'close', description: 'Archiver et fermer définitivement le dossier' });

            const staffSelectMenu = new StringSelectMenuBuilder()
                .setCustomId(`menu_staff_action_${ticketChannel.id}`)
                .setPlaceholder('⚙️ Gestion administrative du dossier...')
                .addOptions(selectOptions);

            const componentsList = [
                new ActionRowBuilder().addComponents(staffSelectMenu)
            ];

            await ticketChannel.send({
                content: `<@${user.id}> ${CONFIG_ASSOCIATION.staffRoles.map(rId => `<@&${rId}>`).join(' ')}`,
                embeds: [embedTicket],
                components: componentsList
            });

            return await interaction.editReply({ content: `Votre dossier officiel a été ouvert avec succès : <#${ticketChannel.id}>` });
        }
    }
}

module.exports = { initAssociationPanels, handleAssociationInteraction };
