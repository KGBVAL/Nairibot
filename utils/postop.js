const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');

const CONFIG_POSTOP = {
    staffRoles: ['1539267928762097770', '1539400476536217690'],
    chanCommandes: '1547194706671308860',
    chanService: '1547194707799703563',
    chanRecrutement: '1547194709049479178'
};

function getCommandesEmbed() {
    return new EmbedBuilder()
        .setTitle('POST OP LOGISTICS — CENTRALISTE & COMMANDES')
        .setDescription('Besoin d\'une livraison ou d\'une commande de marchandises ? Ouvrez un dossier de commande via le menu ci-dessous.')
        .setColor(0x202225)
        .setTimestamp();
}

function getCommandesComponents() {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('menu_ticket_commande')
            .setPlaceholder('Effectuer une demande de commande...')
            .addOptions([
                { label: 'Passer une commande / Livraison', value: 'cmd_standard', description: 'Ouvrir un ticket de commande personnalisé' }
            ])
    );
}

function getServiceEmbed() {
    return new EmbedBuilder()
        .setTitle('POST OP LOGISTICS — CATALOGUE DES SERVICES')
        .setDescription('Retrouvez ci-dessous l\'ensemble des prestations assurées par Post Op Logistics :\n\n📦 **Transport & Fret Sécurisé** : Acheminement de marchandises en tout genre.\n🚚 **Logistique d\'Entreprise** : Gestion de stocks et approvisionnement de buralistes/commerces.\n🔒 **Convoi Protégé** : Transport sous haute surveillance pour cargaisons sensibles.\n📑 **Affrètement Sur-Mesure** : Contrats de sous-traitance logistique longue durée.')
        .setColor(0x202225)
        .setTimestamp();
}

function getRecrutementEmbed() {
    return new EmbedBuilder()
        .setTitle('POST OP LOGISTICS — RECRUTEMENT')
        .setDescription('Vous souhaitez rejoindre nos équipes et intégrer la logistique ? Sélectionnez votre poste de prédilection dans le menu ci-dessous pour ouvrir votre dossier de recrutement.')
        .setColor(0x202225)
        .setTimestamp();
}

function getRecrutementComponents() {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('menu_ticket_recrutement')
            .setPlaceholder('Choisir un poste à postuler...')
            .addOptions([
                { label: 'Chauffeur / Livreur', value: 'rec_chauffeur', description: 'Rejoindre l\'équipe de terrain' },
                { label: 'Logisticien / Gestionnaire', value: 'rec_logisticien', description: 'Gérer la centralisation et les stocks' },
                { label: 'Sécurité / Escorte', value: 'rec_securite', description: 'Protéger les convois sensibles' }
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

    // Force la mise en cache des salons pour éviter les retours vides au démarrage
    await guild.channels.fetch();

    // Salon Commandes
    const cmdChan = guild.channels.cache.get(CONFIG_POSTOP.chanCommandes);
    if (cmdChan) {
        try {
            const msgs = await cmdChan.messages.fetch({ limit: 10 });
            const botMsg = msgs.find(m => m.author.id === client.user.id && m.embeds[0]?.title?.includes('CENTRALISTE'));
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
    } else {
        console.warn(`[POSTOP] Salon Commandes introuvable avec l'ID : ${CONFIG_POSTOP.chanCommandes}`);
    }

    // Salon Service
    const srvChan = guild.channels.cache.get(CONFIG_POSTOP.chanService);
    if (srvChan) {
        try {
            const msgs = await srvChan.messages.fetch({ limit: 10 });
            const botMsg = msgs.find(m => m.author.id === client.user.id && m.embeds[0]?.title?.includes('CATALOGUE'));
            if (!botMsg) {
                await srvChan.send({ embeds: [getServiceEmbed()] });
                console.log(`[POSTOP] Panel Service envoyé dans #${srvChan.name}`);
            } else {
                await botMsg.edit({ embeds: [getServiceEmbed()] });
                console.log(`[POSTOP] Panel Service mis à jour dans #${srvChan.name}`);
            }
        } catch (e) {
            console.error("[POSTOP] Erreur salon Service :", e);
        }
    } else {
        console.warn(`[POSTOP] Salon Service introuvable avec l'ID : ${CONFIG_POSTOP.chanService}`);
    }

    // Salon Recrutement
    const recChan = guild.channels.cache.get(CONFIG_POSTOP.chanRecrutement);
    if (recChan) {
        try {
            const msgs = await recChan.messages.fetch({ limit: 10 });
            const botMsg = msgs.find(m => m.author.id === client.user.id && m.embeds[0]?.title?.includes('RECRUTEMENT'));
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
    } else {
        console.warn(`[POSTOP] Salon Recrutement introuvable avec l'ID : ${CONFIG_POSTOP.chanRecrutement}`);
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
                .setTitle('Formulaire de Commande')
                .addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('details').setLabel('Détails de la commande / Marchandise').setStyle(TextInputStyle.Paragraph).setRequired(true))
                );
            return await interaction.showModal(modal);
        }

        if (id === 'menu_ticket_recrutement') {
            const posteNames = { 'rec_chauffeur': 'Chauffeur / Livreur', 'rec_logisticien': 'Logisticien', 'rec_securite': 'Sécurité / Escorte' };
            const modal = new ModalBuilder()
                .setCustomId(`mod_ticket_rec_${val}`)
                .setTitle(`Recrutement — ${posteNames[val] || 'Poste'}`)
                .addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('motivations').setLabel('Vos motivations et expériences').setStyle(TextInputStyle.Paragraph).setRequired(true))
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
            const contentInput = interaction.fields.getTextInputValue(isRecrutement ? 'motivations' : 'details');

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
                permissionOverwrites: permissionOverwrites
            });

            const embedTicket = new EmbedBuilder()
                .setTitle(`DOSSIER — ${ticketType.toUpperCase()}`)
                .setDescription(`Demandeur : <@${user.id}>\n\n**Contenu de la demande :**\n${contentInput}\n\n*Statut : En attente de prise en charge.*`)
                .setColor(0x202225)
                .setTimestamp();

            const rowButtons = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`btn_claim_${ticketChannel.id}`).setLabel('Prendre en charge').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId(`btn_close_${ticketChannel.id}`).setLabel('Clôturer le ticket').setStyle(ButtonStyle.Danger)
            );

            await ticketChannel.send({
                content: `<@${user.id}> <@&${CONFIG_POSTOP.staffRoles.join('> <@&')}>`,
                embeds: [embedTicket],
                components: [rowButtons]
            });

            return await interaction.reply({ content: `Votre ticket a été ouvert avec succès : <#${ticketChannel.id}>`, ephemeral: true });
        }
    }

    if (interaction.isButton()) {
        const member = interaction.member;
        const hasStaffRole = member.roles.cache.some(role => CONFIG_POSTOP.staffRoles.includes(role.id));

        if (id.startsWith('btn_claim_')) {
            if (!hasStaffRole) {
                return await interaction.reply({ content: 'Seuls les membres habilités peuvent prendre en charge ce ticket.', ephemeral: true });
            }

            const message = interaction.message;
            const embed = EmbedBuilder.from(message.embeds[0]);
            embed.setDescription(embed.data.description.replace('*Statut : En attente de prise en charge.*', `*Statut : Pris en charge par **${member.user.tag}***`));

            await message.edit({ embeds: [embed], components: message.components });
            return await interaction.reply({ content: `Vous avez pris en charge ce ticket.`, ephemeral: true });
        }

        if (id.startsWith('btn_close_')) {
            if (!hasStaffRole) {
                return await interaction.reply({ content: 'Seuls les rôles autorisés peuvent clôturer ce dossier.', ephemeral: true });
            }

            await interaction.reply({ content: 'Fermeture du dossier en cours... Transfert dans les archives privées dans 1 minute.', ephemeral: false });

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
                        await channel.setName(`ferme-${channel.name}`);
                    } else {
                        await channel.delete('Ticket archivé et fermé.');
                    }
                } catch (err) {
                    console.error("Erreur lors du déplacement ou de la suppression du ticket :", err);
                }
            }, 60000);
        }
    }
}

module.exports = { initPostOpPanels, handlePostOpInteraction };
