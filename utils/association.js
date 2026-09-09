const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');

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
        .setDescription('Cet espace institutionnel permet aux concitoyens de soumettre des initiatives, des projets ou des doléances relatifs à la vie du quartier.\n\nChaque proposition fait l\'objet d\'une instruction par notre conseil avant éventuelle publication publique.')
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
                console.log(`[ASSOCIATION] Panel Propositions envoyé dans #${propChan.name}`);
            } else {
                await botMsg.edit({ embeds: [getPropositionsEmbed()], components: [getPropositionsComponents()] });
                console.log(`[ASSOCIATION] Panel Propositions mis à jour dans #${propChan.name}`);
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
                console.log(`[ASSOCIATION] Panel Bénévolat envoyé dans #${benChan.name}`);
            } else {
                await botMsg.edit({ embeds: [getBenevolatEmbed()], components: [getBenevolatComponents()] });
                console.log(`[ASSOCIATION] Panel Bénévolat mis à jour dans #${benChan.name}`);
            }
        } catch (e) {
            console.error("[ASSOCIATION] Erreur salon Bénévolat :", e);
        }
    }
}

async function handleAssociationInteraction(interaction) {
    const id = interaction.customId;
    if (!id) return;

    const isAssocAction = id === 'menu_ticket_proposition' || id === 'menu_ticket_benevolat' || id.startsWith('mod_assoc_') || id.startsWith('btn_assoc_claim_') || id.startsWith('btn_assoc_close_') || id.startsWith('btn_prop_validate_') || id.startsWith('btn_prop_modify_') || id.startsWith('mod_prop_edit_');
    if (!isAssocAction) return;

    if (interaction.handledByAssociation) return;
    interaction.handledByAssociation = true;

    if (interaction.isStringSelectMenu()) {
        const val = interaction.values[0];

        if (id === 'menu_ticket_proposition') {
            const modal = new ModalBuilder()
                .setCustomId('mod_assoc_proposition')
                .setTitle('Proposition Citoyenne')
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
                    const fetchedMsg = await channel.messages.fetch({ limit: 10 });
                    const targetMsg = fetchedMsg.find(m => m.embeds.length > 0 && m.embeds[0].title?.includes('PROPOSITION'));
                    if (targetMsg) {
                        const embed = EmbedBuilder.from(targetMsg.embeds[0]);
                        embed.setDescription(embed.data.description.replace(/Sujet :\n([\s\S]*?)(?=\n\n\*Statut|$)/, `Sujet :\n${nouveauSujet}`));
                        await targetMsg.edit({ embeds: [embed] });
                    }
                }
                return await interaction.reply({ content: 'Votre proposition a été mise à jour avec succès.', ephemeral: true });
            }

            const isBenevolat = modId.startsWith('mod_assoc_benevolat_');
            const ticketType = isBenevolat ? 'benevolat' : 'proposition';

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

            const ticketChannel = await guild.channels.create({
                name: `${ticketType}-${user.username}`,
                type: ChannelType.GuildText,
                parent: dossierCategory.id,
                permissionOverwrites: permissionOverwrites
            });

            const embedTicket = new EmbedBuilder()
                .setTitle(`DOSSIER ASSOCIATIF — ${ticketType.toUpperCase()}`)
                .setDescription(`Demandeur : <@${user.id}>\n\n**Identité & Contact :**\n• Nom : ${prenom} ${nom}\n• Téléphone : ${telephone}\n\n**${isBenevolat ? 'Motivations :' : 'Sujet :'}**\n${champPrincipal}\n\n*Statut : En attente de prise en charge.*`)
                .setColor(0x2B2D31)
                .setTimestamp();

            const componentsList = [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`btn_assoc_claim_${ticketChannel.id}`).setLabel('Prendre en charge').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId(`btn_assoc_close_${ticketChannel.id}`).setLabel('Clôturer le dossier').setStyle(ButtonStyle.Danger)
                )
            ];

            if (!isBenevolat) {
                componentsList.push(
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId(`btn_prop_validate_${ticketChannel.id}_${Buffer.from(prenom).toString('base64')}_${Buffer.from(nom).toString('base64')}`).setLabel('Valider et publier').setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId(`btn_prop_modify_${ticketChannel.id}`).setLabel('Demander une modification').setStyle(ButtonStyle.Secondary)
                    )
                );
            }

            await ticketChannel.send({
                content: `<@${user.id}> <@&${CONFIG_ASSOCIATION.staffRoles.join('> <@&')}>`,
                embeds: [embedTicket],
                components: componentsList
            });

            return await interaction.reply({ content: `Votre dossier a été ouvert avec succès : <#${ticketChannel.id}>`, ephemeral: true });
        }
    }

    if (interaction.isButton()) {
        const member = interaction.member;
        const hasStaffRole = member.roles.cache.some(role => CONFIG_ASSOCIATION.staffRoles.includes(role.id));

        if (!hasStaffRole) {
            return await interaction.reply({ content: 'Accès restreint aux membres habilités de l\'association.', ephemeral: true });
        }

        if (id.startsWith('btn_assoc_claim_')) {
            const message = interaction.message;
            const embed = EmbedBuilder.from(message.embeds[0]);
            embed.setDescription(embed.data.description.replace('*Statut : En attente de prise en charge.*', `*Statut : Pris en charge par **${member.user.tag}***`));

            await message.edit({ embeds: [embed], components: message.components });
            return await interaction.reply({ content: 'Dossier pris en charge.', ephemeral: true });
        }

        if (id.startsWith('btn_prop_modify_')) {
            const ticketId = interaction.channel.id;
            const modal = new ModalBuilder()
                .setCustomId(`mod_prop_edit_${ticketId}`)
                .setTitle('Modification de la Proposition')
                .addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nouveau_sujet').setLabel('Nouveau contenu de la proposition').setStyle(TextInputStyle.Paragraph).setRequired(true))
                );
            return await interaction.showModal(modal);
        }

        if (id.startsWith('btn_prop_validate_')) {
            const parts = id.split('_');
            const ticketId = parts[3];
            const prenomB64 = parts[4];
            const nomB64 = parts[5];

            const prenom = Buffer.from(prenomB64, 'base64').toString('utf8');
            const nom = Buffer.from(nomB64, 'base64').toString('utf8');
            const initiales = `${prenom.charAt(0).toUpperCase()}. ${nom.charAt(0).toUpperCase()}.`;

            const channel = interaction.channel;
            const fetchedMsg = await channel.messages.fetch({ limit: 10 });
            const targetMsg = fetchedMsg.find(m => m.embeds.length > 0 && m.embeds[0].title?.includes('PROPOSITION'));

            if (targetMsg) {
                const desc = targetMsg.embeds[0].description;
                const matchSujet = desc.match(/\*\*Sujet :\*\*\n([\s\S]*?)(?=\n\n\*Statut|$)/);
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
            }

            await interaction.reply({ content: 'La proposition a été validée et publiée dans le salon dédié.', ephemeral: false });
            
            setTimeout(async () => {
                try {
                    const closedCategory = interaction.guild.channels.cache.find(c => c.name.toLowerCase().includes('dossier traité') || c.name.toLowerCase().includes('archives'));
                    if (closedCategory) {
                        await channel.setParent(closedCategory.id);
                        await channel.permissionOverwrites.set([
                            { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                            ...CONFIG_ASSOCIATION.staffRoles.map(rId => ({ id: rId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory] }))
                        ]);
                        await channel.setName(`archive-${channel.name}`);
                    } else {
                        await channel.delete('Proposition validée et archivée.');
                    }
                } catch (err) {
                    console.error("Erreur lors de l'archivage de la proposition :", err);
                }
            }, 5000);
            return;
        }

        if (id.startsWith('btn_assoc_close_')) {
            await interaction.reply({ content: 'Clôture du dossier en cours... Archivage imminent.', ephemeral: false });

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
                        await channel.setName(`archive-${channel.name}`);
                    } else {
                        await channel.delete('Dossier clôturé et purgé.');
                    }
                } catch (err) {
                    console.error("Erreur lors de l'archivage du dossier :", err);
                }
            }, 60000);
        }
    }
}

module.exports = { initAssociationPanels, handleAssociationInteraction };
