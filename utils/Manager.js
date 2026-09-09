const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

// Stockage local centralisé pour les entités du projet
const db = {
    association: { solde: 0, factures: [] },
    postop: { solde: 0, factures: [] },
    annoncesAssoc: [],
    annoncesPostOp: [],
    commerces: [],
    partenaires: [],
    calendrier: []
};

// ==========================================
// 1. GESTION COMPTABILITÉ
// ==========================================
function getAccountingEmbed(entity) {
    const data = db[entity];
    const isPostOp = entity === 'postop';
    const title = isPostOp ? 'POST OP LOGISTICS — COMPTABILITÉ' : 'ARMENIAN ASSOCIATION OF VINEWOOD — TRÉSORERIE';
    const color = isPostOp ? 0x2b2d31 : 0xd4af37;

    let facturesList = data.factures.length === 0 
        ? 'Aucune facture enregistrée pour le moment.' 
        : data.factures.slice(-5).map((f, index) => `\`#${index + 1}\` • **${f.client}** : $${f.montant.toLocaleString()} — *(${f.statut})*`).join('\n');

    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(`Registre financier officiel et gestion des flux.\n\n**Solde Actuel :** \`$${data.solde.toLocaleString()}\``)
        .addFields({ name: '📋 Dernières Factures Émises', value: facturesList, inline: false })
        .setColor(color)
        .setTimestamp();
}

function getAccountingComponents(entity) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`acc_add_${entity}`).setLabel('Ajouter Recette').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`acc_sub_${entity}`).setLabel('Retirer Fonds').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`acc_inv_${entity}`).setLabel('Créer Facture').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(`acc_del_${entity}`).setLabel('Supprimer Facture').setStyle(ButtonStyle.Secondary)
    );
}

// ==========================================
// 2. GESTION ANNONCES
// ==========================================
function getAnnoncesEmbed(type) {
    const isPostOp = type === 'postop';
    const title = isPostOp ? 'POST OP LOGISTICS — CANAL D\'ANNONCES' : 'LITTLE ARMENIA — ANNONCES OFFICIELLES';
    const desc = isPostOp ? 'Communications opérationnelles et logistiques.' : 'Communiqués officiels de l\'Association de Vinewood.';
    
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(`${desc}\n\nUtilisez le bouton ci-dessous pour rédiger une nouvelle annonce officielle diffusée dans ce flux.`)
        .setColor(isPostOp ? 0x2b2d31 : 0xd4af37)
        .setTimestamp();
}

function getAnnoncesComponents(type) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`ann_publish_${type}`).setLabel('Rédiger une annonce').setStyle(ButtonStyle.Primary)
    );
}

// ==========================================
// 3. GESTION COMMERCES & PARTENAIRES
// ==========================================
function getCommercesPanelEmbed() {
    let commercesList = db.commerces.length === 0 ? 'Aucun commerce enregistré.' : db.commerces.map((c, i) => `**#${i+1} - ${c.nom}**\n${c.desc}`).join('\n\n');
    let partenairesList = db.partenaires.length === 0 ? 'Aucun partenaire enregistré.' : db.partenaires.map((p, i) => `**#${i+1} - ${p.nom}**\n${p.desc}`).join('\n\n');

    return new EmbedBuilder()
        .setTitle('LITTLE ARMENIA — COMMERCES & PARTENAIRES')
        .setDescription('Répertoire officiel des enseignes du quartier et des partenaires extérieurs.')
        .addFields(
            { name: '🏪 Commerces Locaux', value: commercesList, inline: false },
            { name: '🤝 Partenaires', value: partenairesList, inline: false }
        )
        .setColor(0xd4af37)
        .setTimestamp();
}

function getCommercesPanelComponents() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('cp_add_commerce').setLabel('+ Ajouter Commerce').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('cp_del_commerce').setLabel('- Supprimer Commerce').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('cp_add_partenaire').setLabel('+ Ajouter Partenaire').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('cp_del_partenaire').setLabel('- Supprimer Partenaire').setStyle(ButtonStyle.Danger)
    );
}

// ==========================================
// 4. GESTION CALENDRIER 2026
// ==========================================
function getCalendrierPanelEmbed() {
    let eventsList = db.calendrier.length === 0 
        ? 'Aucun événement planifié pour le moment.' 
        : db.calendrier.map((e, i) => `\`#${i+1}\` **📅 ${e.date}** — **${e.titre}**\n> ${e.desc}`).join('\n\n');

    return new EmbedBuilder()
        .setTitle('LITTLE ARMENIA — CALENDRIER COMMUNAUTAIRE & CULTUREL 2026')
        .setDescription('Agenda des grands rendez-vous, fêtes de quartier et rassemblements.\n\n' + eventsList)
        .setColor(0xd4af37)
        .setTimestamp();
}

function getCalendrierPanelComponents() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('cal_add_event').setLabel('+ Ajouter Événement').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('cal_del_event').setLabel('- Supprimer Événement').setStyle(ButtonStyle.Danger)
    );
}

// ==========================================
// INITIALISATION DES PANNEAUX DANS LES SALONS
// ==========================================
async function initAllPanels(guild) {
    const channelsMap = {
        comptabilite: async (chan) => {
            const msgs = await chan.messages.fetch({ limit: 10 });
            if (!msgs.some(m => m.author.id === guild.client.user.id)) {
                await chan.send({ embeds: [getAccountingEmbed('association')], components: [getAccountingComponents('association')] });
                await chan.send({ embeds: [getAccountingEmbed('postop')], components: [getAccountingComponents('postop')] });
            }
        },
        'annonces': async (chan) => {
            const msgs = await chan.messages.fetch({ limit: 10 });
            if (!msgs.some(m => m.author.id === guild.client.user.id)) {
                await chan.send({ embeds: [getAnnoncesEmbed('association')], components: [getAnnoncesComponents('association')] });
            }
        },
        'annonces-post-op': async (chan) => {
            const msgs = await chan.messages.fetch({ limit: 10 });
            if (!msgs.some(m => m.author.id === guild.client.user.id)) {
                await chan.send({ embeds: [getAnnoncesEmbed('postop')], components: [getAnnoncesComponents('postop')] });
            }
        },
        'commerces-et-partenariats': async (chan) => {
            const msgs = await chan.messages.fetch({ limit: 10 });
            if (!msgs.some(m => m.author.id === guild.client.user.id)) {
                await chan.send({ embeds: [getCommercesPanelEmbed()], components: [getCommercesPanelComponents()] });
            }
        },
        'calendrier-2026': async (chan) => {
            const msgs = await chan.messages.fetch({ limit: 10 });
            if (!msgs.some(m => m.author.id === guild.client.user.id)) {
                await chan.send({ embeds: [getCalendrierPanelEmbed()], components: [getCalendrierPanelComponents()] });
            }
        }
    };

    for (const [chanName, initFn] of Object.entries(channelsMap)) {
        const chan = guild.channels.cache.find(c => c.name === chanName);
        if (chan) {
            try {
                await initFn(chan);
            } catch (err) {
                console.error(`[INIT] Erreur sur le salon ${chanName}:`, err);
            }
        }
    }
}

// ==========================================
// ROUTEUR D'INTERACTIONS GLOBAL
// ==========================================
async function handleManagersInteraction(interaction) {
    if (!interaction.isButton() && !interaction.isModalSubmit()) return;
    const id = interaction.customId;

    // --- GESTION COMPTABILITÉ ---
    if (id.startsWith('acc_')) {
        const [, action, entity] = id.split('_');
        if (interaction.isModalSubmit()) {
            const val = interaction.fields.getTextInputValue('val_input');
            const val2 = interaction.fields.getTextInputValue('val2_input');
            if (action === 'modaladd') db[entity].solde += parseFloat(val);
            if (action === 'modalsub') db[entity].solde -= parseFloat(val);
            if (action === 'modalinv') db[entity].factures.push({ client: val, montant: parseFloat(val2), statut: 'Émise' });
            if (action === 'modaldel') db[entity].factures.splice(parseInt(val) - 1, 1);
            
            await updateComptabiliteMessage(interaction, entity);
            return interaction.reply({ content: 'Opération comptable mise à jour.', ephemeral: true });
        }

        const modal = new ModalBuilder().setCustomId(`acc_modal${action}_${entity}`);
        if (action === 'add' || action === 'sub') {
            modal.setTitle('Modifier Trésorerie').addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('val_input').setLabel('Montant ($)').setStyle(TextInputStyle.Short).setRequired(true)));
        } else if (action === 'inv') {
            modal.setTitle('Créer Facture').addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('val_input').setLabel('Nom Client').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('val2_input').setLabel('Montant ($)').setStyle(TextInputStyle.Short).setRequired(true))
            );
        } else if (action === 'del') {
            modal.setTitle('Supprimer Facture').addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('val_input').setLabel('Numéro de facture').setStyle(TextInputStyle.Short).setRequired(true)));
        }
        return interaction.showModal(modal);
    }

    // --- GESTION ANNONCES ---
    if (id.startsWith('ann_')) {
        const [, action, type] = id.split('_');
        if (interaction.isModalSubmit()) {
            const text = interaction.fields.getTextInputValue('ann_text');
            const targetChanName = type === 'postop' ? 'annonces-post-op' : 'annonces';
            const targetChan = interaction.guild.channels.cache.find(c => c.name === targetChanName);
            if (targetChan) {
                const embed = new EmbedBuilder()
                    .setTitle(type === 'postop' ? '📢 COMMUNIQUÉ POST OP LOGISTICS' : '📢 COMMUNIQUÉ OFFICIEL')
                    .setDescription(text)
                    .setColor(type === 'postop' ? 0x2b2d31 : 0xd4af37)
                    .setTimestamp();
                await targetChan.send({ embeds: [embed] });
            }
            return interaction.reply({ content: 'Annonce publiée avec succès.', ephemeral: true });
        }
        const modal = new ModalBuilder().setCustomId(`ann_pub_${type}`).setTitle('Rédiger une annonce')
            .addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('ann_text').setLabel('Contenu de l\'annonce').setStyle(TextInputStyle.Paragraph).setRequired(true)));
        return interaction.showModal(modal);
    }

    // --- GESTION COMMERCES & PARTENAIRES ---
    if (id.startsWith('cp_')) {
        const [, action, target] = id.split('_'); // ex: cp_add_commerce
        if (interaction.isModalSubmit()) {
            const nom = interaction.fields.getTextInputValue('cp_nom');
            const desc = interaction.fields.getTextInputValue('cp_desc');
            const logo = interaction.fields.getTextInputValue('cp_logo') || null;

            if (action === 'add') {
                const item = { nom, desc, logo };
                if (target === 'commerce') db.commerces.push(item);
                else db.partenaires.push(item);
            } else {
                const idx = parseInt(nom) - 1;
                if (target === 'commerce') db.commerces.splice(idx, 1);
                else db.partenaires.splice(idx, 1);
            }
            await updateCommercesMessage(interaction);
            return interaction.reply({ content: 'Mise à jour du registre effectuée.', ephemeral: true });
        }

        const modal = new ModalBuilder().setCustomId(`cp_${action}_${target}`).setTitle(`${action === 'add' ? 'Ajouter' : 'Supprimer'} ${target}`);
        if (action === 'add') {
            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('cp_nom').setLabel('Nom de l\'enseigne').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('cp_desc').setLabel('Descriptif').setStyle(TextInputStyle.Paragraph).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('cp_logo').setLabel('URL du Logo (Optionnel)').setStyle(TextInputStyle.Short).setRequired(false))
            );
        } else {
            modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('cp_nom').setLabel(`Numéro du ${target} à supprimer`).setStyle(TextInputStyle.Short).setRequired(true)));
        }
        return interaction.showModal(modal);
    }

    // --- GESTION CALENDRIER ---
    if (id.startsWith('cal_')) {
        const [, action] = id.split('_');
        if (interaction.isModalSubmit()) {
            const date = interaction.fields.getTextInputValue('cal_date');
            const titre = interaction.fields.getTextInputValue('cal_titre');
            const desc = interaction.fields.getTextInputValue('cal_desc');

            if (action === 'add') {
                db.calendrier.push({ date, titre, desc });
            } else {
                db.calendrier.splice(parseInt(date) - 1, 1);
            }
            await updateCalendrierMessage(interaction);
            return interaction.reply({ content: 'Calendrier mis à jour.', ephemeral: true });
        }

        const modal = new ModalBuilder().setCustomId(`cal_${action}_event`).setTitle(action === 'add' ? 'Ajouter Événement' : 'Supprimer Événement');
        if (action === 'add') {
            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('cal_date').setLabel('Date (ex: 20 Septembre)').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('cal_titre').setLabel('Titre de l\'événement').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('cal_desc').setLabel('Descriptif / Lieu').setStyle(TextInputStyle.Paragraph).setRequired(true))
            );
        } else {
            modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('cal_date').setLabel('Numéro de l\'événement à supprimer').setStyle(TextInputStyle.Short).setRequired(true)));
        }
        return interaction.showModal(modal);
    }
}

async function updateComptabiliteMessage(interaction, entity) {
    const msgs = await interaction.channel.messages.fetch({ limit: 10 });
    const target = msgs.find(m => m.embeds[0] && m.embeds[0].title.includes(entity === 'postop' ? 'POST OP' : 'ARMENIAN'));
    if (target) await target.edit({ embeds: [getAccountingEmbed(entity)], components: [getAccountingComponents(entity)] });
}

async function updateCommercesMessage(interaction) {
    const msgs = await interaction.channel.messages.fetch({ limit: 10 });
    const target = msgs.find(m => m.embeds[0] && m.embeds[0].title.includes('COMMERCES'));
    if (target) await target.edit({ embeds: [getCommercesPanelEmbed()], components: [getCommercesPanelComponents()] });
}

async function updateCalendrierMessage(interaction) {
    const msgs = await interaction.channel.messages.fetch({ limit: 10 });
    const target = msgs.find(m => m.embeds[0] && m.embeds[0].title.includes('CALENDRIER'));
    if (target) await target.edit({ embeds: [getCalendrierPanelEmbed()], components: [getCalendrierPanelComponents()] });
}

module.exports = { initAllPanels, handleManagersInteraction };
