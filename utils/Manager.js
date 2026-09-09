const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

// Stockage local centralisé
const db = {
    association: { solde: 0, factures: [] },
    postop: { solde: 0, factures: [] },
    commerces: [],
    partenaires: [],
    calendrier: []
};

// ==========================================
// PANNEAU DE CONTRÔLE CENTRALISÉ (POUR LE BUREAU)
// ==========================================
function getBureauControlEmbed() {
    return new EmbedBuilder()
        .setTitle('LITTLE ARMENIA & POST OP — BUREAU DE DIRECTION')
        .setDescription('Panneau de commande unifié.\n\nUtilisez les boutons ci-dessous pour administrer les annonces, alimenter les registres de commerces/partenaires, planifier le calendrier 2026 ou gérer la comptabilité des deux entités de manière totalement étanche.')
        .addFields(
            { name: '📢 Communication', value: 'Rédigez vos communiqués officiels (Association ou Post Op).', inline: false },
            { name: '🏪 Répertoire & Agenda', value: 'Ajoutez ou supprimez des commerces, partenaires ou événements.', inline: false },
            { name: '💼 Finances', value: 'Accédez aux flux de trésorerie et à la facturation.', inline: false }
        )
        .setColor(0xd4af37)
        .setTimestamp();
}

function getBureauControlComponents() {
    return [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ctrl_ann_assoc').setLabel('📢 Annonce Association').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('ctrl_ann_postop').setLabel('📢 Annonce Post Op').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('ctrl_cal_add').setLabel('📅 Ajouter Événement').setStyle(ButtonStyle.Success)
        ),
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ctrl_cp_add_commerce').setLabel('+ Commerce').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('ctrl_cp_del_commerce').setLabel('- Commerce').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('ctrl_cp_add_partenaire').setLabel('+ Partenaire').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('ctrl_cp_del_partenaire').setLabel('- Partenaire').setStyle(ButtonStyle.Danger)
        ),
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ctrl_acc_view_assoc').setLabel('💼 Trésorerie Association').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('ctrl_acc_view_postop').setLabel('💼 Trésorerie Post Op').setStyle(ButtonStyle.Secondary)
        )
    ];
}

// ==========================================
// INITIALISATION DES PANNEAUX (BUREAU + SALONS CIBLES)
// ==========================================
async function initAllPanels(guild) {
    // 1. Initialisation du panneau de contrôle dans #bureau
    const bureauChan = guild.channels.cache.find(c => c.name === 'bureau');
    if (bureauChan) {
        try {
            const msgs = await bureauChan.messages.fetch({ limit: 10 });
            if (!msgs.some(m => m.author.id === guild.client.user.id)) {
                await bureauChan.send({ 
                    embeds: [getBureauControlEmbed()], 
                    components: getBureauControlComponents() 
                });
            }
        } catch (err) {
            console.error('[INIT] Erreur sur le salon bureau:', err);
        }
    }

    // 2. Initialisation des affichages permanents dans les salons cibles si nécessaire
    const targets = {
        'comptabilite': async (chan) => {
            const msgs = await chan.messages.fetch({ limit: 10 });
            if (!msgs.some(m => m.author.id === guild.client.user.id)) {
                await chan.send({ embeds: [getAccountingEmbed('association')], components: [getAccountingComponents('association')] });
                await chan.send({ embeds: [getAccountingEmbed('postop')], components: [getAccountingComponents('postop')] });
            }
        },
        'commerces-et-partenariats': async (chan) => {
            const msgs = await chan.messages.fetch({ limit: 10 });
            if (!msgs.some(m => m.author.id === guild.client.user.id)) {
                await chan.send({ embeds: [getCommercesPanelEmbed()] });
            }
        },
        'calendrier-2026': async (chan) => {
            const msgs = await chan.messages.fetch({ limit: 10 });
            if (!msgs.some(m => m.author.id === guild.client.user.id)) {
                await chan.send({ embeds: [getCalendrierPanelEmbed()] });
            }
        }
    };

    for (const [chanName, initFn] of Object.entries(targets)) {
        const chan = guild.channels.cache.find(c => c.name === chanName);
        if (chan) {
            try { await initFn(chan); } catch (e) { console.error(`Erreur init ${chanName}:`, e); }
        }
    }
}

// Helpers d'affichage
function getAccountingEmbed(entity) {
    const data = db[entity];
    const isPostOp = entity === 'postop';
    const title = isPostOp ? 'POST OP LOGISTICS — COMPTABILITÉ' : 'ARMENIAN ASSOCIATION OF VINEWOOD — TRÉSORERIE';
    const color = isPostOp ? 0x2b2d31 : 0xd4af37;
    let facturesList = data.factures.length === 0 ? 'Aucune facture enregistrée.' : data.factures.map((f, i) => `\`#${i+1}\` • **${f.client}** : $${f.montant.toLocaleString()} — *(${f.statut})*`).join('\n');
    return new EmbedBuilder().setTitle(title).setDescription(`**Solde Actuel :** \`$${data.solde.toLocaleString()}\``).addFields({ name: '📋 Factures', value: facturesList }).setColor(color);
}
function getAccountingComponents(entity) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`acc_add_${entity}`).setLabel('Ajouter Recette').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`acc_sub_${entity}`).setLabel('Retirer Fonds').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`acc_inv_${entity}`).setLabel('Créer Facture').setStyle(ButtonStyle.Primary)
    );
}

function getCommercesPanelEmbed() {
    let comms = db.commerces.length === 0 ? 'Aucun commerce.' : db.commerces.map((c, i) => `**#${i+1} - ${c.nom}**\n${c.desc}` + (c.logo ? `\n> Logo: ${c.logo}` : '')).join('\n\n');
    let parts = db.partenaires.length === 0 ? 'Aucun partenaire.' : db.partenaires.map((p, i) => `**#${i+1} - ${p.nom}**\n${p.desc}` + (p.logo ? `\n> Logo: ${p.logo}` : '')).join('\n\n');
    return new EmbedBuilder().setTitle('LITTLE ARMENIA — COMMERCES & PARTENAIRES').addFields({ name: '🏪 Commerces', value: comms }, { name: '🤝 Partenaires', value: parts }).setColor(0xd4af37);
}

function getCalendrierPanelEmbed() {
    let evs = db.calendrier.length === 0 ? 'Aucun événement.' : db.calendrier.map((e, i) => `\`#${i+1}\` **📅 ${e.date}** — **${e.titre}**\n> ${e.desc}`).join('\n\n');
    return new EmbedBuilder().setTitle('LITTLE ARMENIA — CALENDRIER COMMUNAUTAIRE 2026').setDescription(evs).setColor(0xd4af37);
}

// ==========================================
// ROUTEUR D'INTERACTIONS GLOBAL (DEPUIS LE BUREAU)
// ==========================================
async function handleManagersInteraction(interaction) {
    if (!interaction.isButton() && !interaction.isModalSubmit()) return;
    const id = interaction.customId;

    // --- CLICS DEPUIS LE PANNEAU DE CONTRÔLE (BUREAU) ---
    if (id.startsWith('ctrl_')) {
        const action = id.replace('ctrl_', '');

        if (action === 'ann_assoc' || action === 'ann_postop') {
            const type = action === 'ann_assoc' ? 'association' : 'postop';
            const modal = new ModalBuilder().setCustomId(`mod_ann_${type}`).setTitle(type === 'postop' ? 'Annonce Post Op' : 'Annonce Association')
                .addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('text').setLabel('Contenu de l\'annonce').setStyle(TextInputStyle.Paragraph).setRequired(true)));
            return interaction.showModal(modal);
        }

        if (action === 'cal_add') {
            const modal = new ModalBuilder().setCustomId('mod_cal_add').setTitle('Ajouter Événement Calendrier')
                .addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('date').setLabel('Date (ex: 15 Octobre)').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('titre').setLabel('Titre').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('desc').setLabel('Descriptif / Lieu').setStyle(TextInputStyle.Paragraph).setRequired(true))
                );
            return interaction.showModal(modal);
        }

        if (action.startsWith('cp_add_') || action.startsWith('cp_del_')) {
            const parts = action.split('_'); // cp, add, commerce
            const mode = parts[1];
            const target = parts[2];
            const modal = new ModalBuilder().setCustomId(`mod_cp_${mode}_${target}`).setTitle(`${mode === 'add' ? 'Ajouter' : 'Supprimer'} ${target}`);
            if (mode === 'add') {
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nom').setLabel('Nom').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('desc').setLabel('Descriptif').setStyle(TextInputStyle.Paragraph).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('logo').setLabel('URL du Logo (Optionnel)').setStyle(TextInputStyle.Short).setRequired(false))
                );
            } else {
                modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nom').setLabel(`Numéro du ${target} à supprimer`).setStyle(TextInputStyle.Short).setRequired(true)));
            }
            return interaction.showModal(modal);
        }

        if (action.startsWith('acc_view_')) {
            const entity = action.replace('acc_view_', '');
            return interaction.reply({ embeds: [getAccountingEmbed(entity)], ephemeral: true });
        }
    }

    // --- SOUMISSIONS DE MODALS (PUBLICATION DANS LES BONS SALONS) ---
    if (interaction.isModalSubmit()) {
        const modId = interaction.customId;

        if (modId.startsWith('mod_ann_')) {
            const type = modId.replace('mod_ann_', '');
            const text = interaction.fields.getTextInputValue('text');
            const targetName = type === 'postop' ? 'annonces-post-op' : 'annonces';
            const chan = interaction.guild.channels.cache.find(c => c.name === targetName);
            
            if (chan) {
                const embed = new EmbedBuilder()
                    .setTitle(type === 'postop' ? '📢 POST OP LOGISTICS — COMMUNIQUÉ' : '📢 LITTLE ARMENIA — ANNONCE OFFICIELLE')
                    .setDescription(text)
                    .setColor(type === 'postop' ? 0x2b2d31 : 0xd4af37)
                    .setTimestamp();
                await chan.send({ embeds: [embed] });
                return interaction.reply({ content: `Annonce publiée avec succès dans #${targetName} !`, ephemeral: true });
            }
            return interaction.reply({ content: `Salon #${targetName} introuvable.`, ephemeral: true });
        }

        if (modId === 'mod_cal_add') {
            const date = interaction.fields.getTextInputValue('date');
            const titre = interaction.fields.getTextInputValue('titre');
            const desc = interaction.fields.getTextInputValue('desc');
            db.calendrier.push({ date, titre, desc });

            const chan = interaction.guild.channels.cache.find(c => c.name === 'calendrier-2026');
            if (chan) {
                const msgs = await chan.messages.fetch({ limit: 10 });
                const targetMsg = msgs.find(m => m.embeds[0] && m.embeds[0].title.includes('CALENDRIER'));
                if (targetMsg) await targetMsg.edit({ embeds: [getCalendrierPanelEmbed()] });
                else await chan.send({ embeds: [getCalendrierPanelEmbed()] });
            }
            return interaction.reply({ content: 'Événement ajouté au calendrier.', ephemeral: true });
        }

        if (modId.startsWith('mod_cp_')) {
            const [, , mode, target] = modId.split('_'); // mod, cp, add, commerce
            const nom = interaction.fields.getTextInputValue('nom');

            if (mode === 'add') {
                const desc = interaction.fields.getTextInputValue('desc');
                const logo = interaction.fields.getTextInputValue('logo') || null;
                const item = { nom, desc, logo };
                if (target === 'commerce') db.commerces.push(item);
                else db.partenaires.push(item);
            } else {
                const idx = parseInt(nom) - 1;
                if (target === 'commerce') db.commerces.splice(idx, 1);
                else db.partenaires.splice(idx, 1);
            }

            const chan = interaction.guild.channels.cache.find(c => c.name === 'commerces-et-partenariats');
            if (chan) {
                const msgs = await chan.messages.fetch({ limit: 10 });
                const targetMsg = msgs.find(m => m.embeds[0] && m.embeds[0].title.includes('COMMERCES'));
                if (targetMsg) await targetMsg.edit({ embeds: [getCommercesPanelEmbed()] });
                else await chan.send({ embeds: [getCommercesPanelEmbed()] });
            }
            return interaction.reply({ content: 'Registre Commerces & Partenaires mis à jour.', ephemeral: true });
        }
    }
}

module.exports = { initAllPanels, handleManagersInteraction };
