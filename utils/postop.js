const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');

const CONFIG_POSTOP = {
    staffRoles: ['1539267928762097770', '1539400476536217690'],
    channels: {
        commandes: '1547194706671308860',
        services: '1547194707799703563',
        recrutement: '1547194709049479178'
    }
};

function getCommandesEmbed() {
    return new EmbedBuilder()
        .setTitle('POST OP LOGISTICS — DIVISION COMMANDE & FRET')
        .setDescription('Bienvenue au département centralisé de Post Op Logistics.\n\nNos équipes assurent l\'acheminement de vos marchandises et la gestion de vos flux logistiques avec rigueur et discrétion. Veuillez initier votre demande via le sélecteur ci-dessous.')
        .setColor(0x2B2D31)
        .setFooter({ text: 'Post Op Logistics • Division Commerciale' })
        .setTimestamp();
}

function getCommandesComponents() {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('menu_ticket_commande')
            .setPlaceholder('Sélectionner une typologie de commande...')
            .addOptions([
                { label: 'Ouverture de dossier de commande', value: 'cmd_standard', description: 'Initier une demande de transport ou d\'approvisionnement' }
            ])
    );
}

function getServiceEmbed() {
    return new EmbedBuilder()
        .setTitle('POST OP LOGISTICS — CATALOGUE DES PRESTATIONS')
        .setDescription('Infrastructure logistique de référence dédiée aux professionnels, aux entreprises et aux acteurs institutionnels.')
        .setColor(0x2B2D31)
        .addFields(
            {
                name: '📦 Transport & Fret Sécurisé',
                value: 'Acheminement terrestre de marchandises en volume, adapté à tous types de cargaisons et planifié selon vos exigences opérationnelles.',
                false: true
            },
            {
                name: '🏢 Logistique d\'Entreprise',
                value: 'Gestion optimisée des stocks, inventaires rigoureux et réapprovisionnement régulier de structures commerciales et points de vente.',
                false: true
            },
            {
                name: '🔒 Convoi Protégé',
                value: 'Transfert sécurisé sous haute surveillance et escorte armée pour les actifs sensibles ou à forte valeur ajoutée.',
                false: true
            },
            {
                name: '📑 Affrètement Contractuel',
                value: 'Mise en place de partenariats logistiques à long terme, contrats-cadres et solutions de sous-traitance sur-mesure.',
                false: true
            }
        )
        .setFooter({ text: 'Post Op Logistics • Services Professionnels' })
        .setTimestamp();
}

function getRecrutementEmbed() {
    return new EmbedBuilder()
        .setTitle('POST OP LOGISTICS — RECRUTEMENT INSTITUTIONNEL')
        .setDescription('L\'expansion constante de nos activités logistiques requiert l\'intégration de profils qualifiés, disciplinés et investis.\n\nConsultez les postes vacants et soumettez votre dossier de candidature par l\'intermédiaire du module ci-dessous.')
        .setColor(0x2B2D31)
        .setFooter({ text: 'Post Op Logistics • Ressources Humaines' })
        .setTimestamp();
}

function getRecrutementComponents() {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('menu_ticket_recrutement')
            .setPlaceholder('Sélectionner un poste à pourvoir...')
            .addOptions([
                { label: 'Chauffeur / Livreur', value: 'rec_chauffeur', description: 'Affectation aux lignes de transport et tournées' },
                { label: 'Logisticien / Gestionnaire', value: 'rec_logisticien', description: 'Supervision des stocks et centralisation' },
                { label: 'Sécurité / Escorte', value: 'rec_securite', description: 'Protection des convois et sécurisation des actifs' }
            ])
    );
}

async function initPostOpPanels(guild) {
    const client = guild.client;

    if (!client._postOpListenerRegistered) {
        client._postOpListenerRegistered = true;
        client.on('interactionCreate', async (interaction) => {
            try {
                await handlePostOpInteraction(interaction);
            } catch (err) {
                console.error("Erreur critique interaction PostOp:", err);
            }
        });
    }

    await guild.channels.fetch();

    const cmdChan = guild.channels.cache.get(CONFIG_POSTOP.channels.commandes) || guild.channels.cache.find(c => c.name === 'commandes' && c.type === ChannelType.GuildText);
    const srvChan = guild.channels.cache.get(CONFIG_POSTOP.channels.services) || guild.channels.cache.find(c => c.name === 'services' && c.type === ChannelType.GuildText);
    const recChan = guild.channels.cache.get(CONFIG_POSTOP.channels.recrutement) || guild.channels.cache.find(c => (c.name === 'recrutement-interne' || c.name === 'recrutement') && c.type === ChannelType.GuildText);

    if (cmdChan) {
        try {
            const msgs = await cmdChan.messages.fetch({ limit: 10 });
            const botMsg = msgs.find(m => m.author.id === client.user.id && m.embeds[0]?.title?.includes('DIVISION COMMANDE'));
            if (!botMsg) {
                await cmdChan.send({ embeds: [getCommandesEmbed()], components: [getCommandesComponents()] });
                console.log(`[POSTOP] Panel Commandes envoyé dans #${cmdChan.name}`);
            } else {
                await botMsg.edit({ embeds: [getCommandesEmbed()], components: [getCommandesComponents()] });
                console.log(`[POSTOP] Panel Commandes mis à jour dans #${cmdChan.name}`);
            }
        } catch (e) {
            console.error("[POSTOP] Erreur salon Commandes :", e);
        }
    }

    if (srvChan) {
        try {
            const msgs = await srvChan.messages.fetch({ limit: 10 });
            const botMsg = msgs.find(m => m.author.id === client.user.id && m.embeds[0]?.title?.includes('CATALOGUE DES PRESTATIONS'));
            if (!botMsg) {
                await srvChan.send({ embeds: [getServiceEmbed()] });
                console.log(`[POSTOP] Panel Services envoyé dans #${srvChan.name}`);
            } else {
                await botMsg.edit({ embeds: [getServiceEmbed()] });
                console.log(`[POSTOP] Panel Services mis à jour dans #${srvChan.name}`);
            }
        } catch (e) {
            console.error("[POSTOP] Erreur salon Services :", e);
        }
    }

    if (recChan) {
        try {
            const msgs = await recChan.messages.fetch({ limit: 10 });
            const botMsg = msgs.find(m => m.author.id === client.user.id && m.embeds[0]?.title?.includes('RECRUTEMENT INSTITUTIONNEL'));
            if (!botMsg) {
                await recChan.send({ embeds: [getRecrutementEmbed()], components: [getRecrutementComponents()] });
                console.log(`[POSTOP] Panel Recrutement envoyé dans #${recChan.name}`);
            } else {
                await botMsg.edit({ embeds: [getRecrutementEmbed()], components: [getRecrutementComponents()] });
                console.log(`[POSTOP] Panel Recrutement mis à jour dans #${recChan.name}`);
            }
        } catch (e) {
            console.error("[POSTOP] Erreur salon Recrutement :", e);
        }
    }
}

async function handlePostOpInteraction(interaction) {
    const id = interaction.customId;
    if (!id) return;

    const isPostOpAction = id === 'menu_ticket_commande' || id === 'menu_ticket_recrutement' || id.startsWith('mod_ticket_') || id.startsWith('btn_claim_') || id.startsWith('btn_close_');
    if (!isPostOpAction) return;

    if (interaction.handledByPostOp) return;
    interaction.handledByPostOp = true;

    if (interaction.isStringSelectMenu()) {
        const val = interaction.values[0];

        if (id === 'menu_ticket_commande') {
            const modal = new ModalBuilder()
                .setCustomId('mod_ticket_commande')
                .setTitle('Dossier de Commande')
                .addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('prenom').setLabel('Prénom').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nom').setLabel('Nom').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('telephone').setLabel('Téléphone').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('description').setLabel('Description de la demande').setStyle(TextInputStyle.Paragraph).setRequired(true))
                );
            return await interaction.showModal(modal);
        }

        if (id === 'menu_ticket_recrutement') {
            const posteNames = { 'rec_chauffeur': 'Chauffeur / Livreur', 'rec_logisticien': 'Logisticien', 'rec_securite': 'Sécurité / Escorte' };
            const modal = new ModalBuilder()
                .setCustomId(`mod_ticket_rec_${val}`)
                .setTitle(`Candidature — ${posteNames[val] || 'Poste'}`)
                .addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('prenom').setLabel('Prénom').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nom').setLabel('Nom').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('telephone').setLabel('Téléphone').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('experience').setLabel('Expérience').setStyle(TextInputStyle.Paragraph).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('motivations').setLabel('Motivations').setStyle(TextInputStyle.Paragraph).setRequired(true))
                );
            return await interaction.showModal(modal);
        }
    }

    if (interaction.isModalSubmit()) {
        const modId = interaction.customId;

        if (modId === 'mod_ticket_commande' || modId.startsWith('mod_ticket_rec_')) {
            const guild = interaction.guild;
            const user = interaction.user;
            const isRecrutement = modId.startsWith('mod_ticket_rec_');
            const ticketType = isRecrutement ? 'recrutement' : 'commande';

            const prenom = interaction.fields.getTextInputValue('prenom');
            const nom = interaction.fields.getTextInputValue('nom');
            const telephone = interaction.fields.getTextInputValue('telephone');

            let descriptionField = '';
            if (isRecrutement) {
                const experience = interaction.fields.getTextInputValue('experience');
                const motivations = interaction.fields.getTextInputValue('motivations');
                descriptionField = `**Expérience :**\n${experience}\n\n**Motivations :**\n${motivations}`;
            } else {
                descriptionField = `**Description de la demande :**\n${interaction.fields.getTextInputValue('description')}`;
            }

            let dossierCategory = guild.channels.cache.find(
                c => c.type === ChannelType.GuildCategory && (c.name.toLowerCase().includes('dossier') || c.name.toLowerCase().includes('en cours'))
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

            const ticketChannel = await guild.channels.create({
                name: `${ticketType}-${user.username}`,
                type: ChannelType.GuildText,
                parent: dossierCategory.id,
                permissionOverwrites: permissionOverwrites
            });

            const embedTicket = new EmbedBuilder()
                .setTitle(`DOSSIER ADMINISTRATIF — ${ticketType.toUpperCase()}`)
                .setDescription(`Demandeur : <@${user.id}>\n\n**État civil & Contact :**\n• Identité : ${prenom} ${nom}\n• Téléphone : ${telephone}\n\n${descriptionField}\n\n*Statut : En attente de prise en charge.*`)
                .setColor(0x2B2D31)
                .setTimestamp();

            const rowButtons = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`btn_claim_${ticketChannel.id}`).setLabel('Prendre en charge').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId(`btn_close_${ticketChannel.id}`).setLabel('Clôturer le dossier').setStyle(ButtonStyle.Danger)
            );

            await ticketChannel.send({
                content: `<@${user.id}> <@&${CONFIG_POSTOP.staffRoles.join('> <@&')}>`,
                embeds: [embedTicket],
                components: [rowButtons]
            });

            return await interaction.reply({ content: `Votre dossier a été généré avec succès : <#${ticketChannel.id}>`, ephemeral: true });
        }
    }

    if (interaction.isButton()) {
        const member = interaction.member;
        const hasStaffRole = member.roles.cache.some(role => CONFIG_POSTOP.staffRoles.includes(role.id));

        if (id.startsWith('btn_claim_')) {
            if (!hasStaffRole) {
                return await interaction.reply({ content: 'Accès restreint aux agents habilités.', ephemeral: true });
            }

            const message = interaction.message;
            const embed = EmbedBuilder.from(message.embeds[0]);
            embed.setDescription(embed.data.description.replace('*Statut : En attente de prise en charge.*', `*Statut : Pris en charge par **${member.user.tag}***`));

            await message.edit({ embeds: [embed], components: message.components });
            return await interaction.reply({ content: 'Dossier pris en charge.', ephemeral: true });
        }

        if (id.startsWith('btn_close_')) {
            if (!hasStaffRole) {
                return await interaction.reply({ content: 'Accès restreint aux agents habilités.', ephemeral: true });
            }

            await interaction.reply({ content: 'Clôture du dossier en cours... Archivage imminent.', ephemeral: false });

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

module.exports = { initPostOpPanels, handlePostOpInteraction };
