const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

// Stockage local centralisé
const db = {
    association: { solde: 0, factures: [] },
    postop: { solde: 0, factures: [] }
};

// ==========================================
// 1. PANNEAUX DE DIRECTION DANS #BUREAU (STYLE CORPORATE)
// ==========================================
function getBureauAssociationEmbed() {
    return new EmbedBuilder()
        .setTitle('LITTLE ARMENIA ASSOCIATION — DIRECTION')
        .setDescription('Gestion administrative, financière et publication des communiqués pour l\'Association.')
        .setColor(0x2f3136) // Gris corporate sobre
        .setTimestamp();
}

function getBureauAssociationComponents() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('corp_ann_assoc').setLabel('Rédiger une annonce').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('corp_com_commerce').setLabel('Publier un commerce').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('corp_com_partenaire').setLabel('Publier un partenaire').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('corp_cal_add').setLabel('Planifier un événement').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('corp_acc_assoc').setLabel('Gérer Trésorerie').setStyle(ButtonStyle.Primary)
    );
}

function getBureauPostOpEmbed() {
    return new EmbedBuilder()
        .setTitle('POST OP LOGISTICS — DIRECTION EXÉCUTIVE')
        .setDescription('Gestion opérationnelle, logistique et financière de l\'entreprise.')
        .setColor(0x202225) // Noir industriel
        .setTimestamp();
}

function getBureauPostOpComponents() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('corp_ann_postop').setLabel('Rédiger une annonce').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('corp_acc_postop').setLabel('Gérer Trésorerie & Factures').setStyle(ButtonStyle.Primary)
    );
}

// ==========================================
// 2. COMPTABILITÉ (SALON #comptabilite)
// ==========================================
function getAccountingEmbed(entity) {
    const data = db[entity];
    const isPostOp = entity === 'postop';
    const title = isPostOp ? 'POST OP LOGISTICS — REGISTRE COMPTABLE' : 'LITTLE ARMENIA — TRÉSORERIE ASSOCIATIVE';
    
    let facturesList = data.factures.length === 0 
        ? 'Aucune facture active.' 
        : data.factures.map((f, i) => `\`#${i+1}\` • ${f.client} — $${f.montant.toLocaleString()} [${f.statut}]`).join('\n');

    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(`**Solde Actuel :** $${data.solde.toLocaleString()}\n\n**Dernières factures :**\n${facturesList}`)
        .setColor(isPostOp ? 0x202225 : 0x2f3136)
        .setTimestamp();
}

function getAccountingComponents(entity) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`acc_add_${entity}`).setLabel('+ Recette').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`acc_sub_${entity}`).setLabel('- Dépense').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`acc_inv_${entity}`).setLabel('Créer Facture').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(`acc_del_${entity}`).setLabel('Supprimer Facture').setStyle(ButtonStyle.Secondary)
    );
}

// ==========================================
// 3. INITIALISATION DES SALONS
// ==========================================
async function initAllPanels(guild) {
    // Salon Bureau
    const bureauChan = guild.channels.cache.find(c => c.name === 'bureau');
    if (bureauChan) {
        const msgs = await bureauChan.messages.fetch({ limit: 10 });
        if (!msgs.some(m => m.author.id === guild.client.user.id)) {
            await bureauChan.send({ embeds: [getBureauAssociationEmbed()], components: [getBureauAssociationComponents()] });
            await bureauChan.send({ embeds: [getBureauPostOpEmbed()], components: [getBureauPostOpComponents()] });
        }
    }

    // Salon Comptabilité
    const comptaChan = guild.channels.cache.find(c => c.name === 'comptabilite');
    if (comptaChan) {
        const msgs = await comptaChan.messages.fetch({ limit: 10 });
        if (!msgs.some(m => m.author.id === guild.client.user.id)) {
            await comptaChan.send({ embeds: [getAccountingEmbed('association')], components: [getAccountingComponents('association')] });
            await comptaChan.send({ embeds: [getAccountingEmbed('postop')], components: [getAccountingComponents('postop')] });
        }
    }
}

// ==========================================
// 4. ROUTEUR D'INTERACTIONS ET MODALS
// ==========================================
async function handleManagersInteraction(interaction) {
    if (!interaction.isButton() && !interaction.isModalSubmit()) return;
    const id = interaction.customId;

    // --- CLICS DEPUIS LE BUREAU ---
    if (id.startsWith('corp_')) {
        const action = id.replace('corp_', '');

        if (action === 'ann_assoc' || action === 'ann_postop') {
            const type = action === 'ann_assoc' ? 'association' : 'postop';
            const modal = new ModalBuilder().setCustomId(`mod_ann_${type}`).setTitle('Rédaction d\'annonce officielle')
                .addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('text').setLabel('Contenu du communiqué').setStyle(TextInputStyle.Paragraph).setRequired(true)));
            return interaction.showModal(modal);
        }

        if (action === 'com_commerce' || action === 'com_partenaire') {
            const target = action === 'com_commerce' ? 'commerce' : 'partenaire';
            const modal = new ModalBuilder().setCustomId(`mod_pub_${target}`).setTitle(`Publication — ${target.toUpperCase()}`)
                .addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nom').setLabel('Nom de l\'enseigne').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('desc').setLabel('Descriptif détaillé').setStyle(TextInputStyle.Paragraph).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('logo').setLabel('URL de l\'image / Logo').setStyle(TextInputStyle.Short).setRequired(false))
                );
            return interaction.showModal(modal);
        }

        if (action === 'cal_add') {
            const modal = new ModalBuilder().setCustomId('mod_pub_evenement').setTitle('Publication — Événement 2026')
                .addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('date').setLabel('Date et heure').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('titre').setLabel('Intitulé de l\'événement').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('desc').setLabel('Descriptif et lieu').setStyle(TextInputStyle.Paragraph).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('logo').setLabel('URL du visuel (Optionnel)').setStyle(TextInputStyle.Short).setRequired(false))
                );
            return interaction.showModal(modal);
        }

        if (action === 'acc_assoc' || action === 'acc_postop') {
            const entity = action.replace('acc_', '');
            return interaction.reply({ embeds: [getAccountingEmbed(entity)], ephemeral: true });
        }
    }

    // --- CLICS DEPUIS LE PANNEAU DE COMPTABILITÉ ---
    if (id.startsWith('acc_')) {
        const [, action, entity] = id.split('_');
        if (action === 'add' || action === 'sub') {
            const modal = new ModalBuilder().setCustomId(`mod_acc_money_${action}_${entity}`).setTitle('Ajustement financier')
                .addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('montant').setLabel('Montant ($)').setStyle(TextInputStyle.Short).setRequired(true)));
            return interaction.showModal(modal);
        }
        if (action === 'inv') {
            const modal = new ModalBuilder().setCustomId(`mod_acc_inv_${entity}`).setTitle('Émission de facture')
                .addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('client').setLabel('Client / Destinataire').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('montant').setLabel('Montant ($)').setStyle(TextInputStyle.Short).setRequired(true))
                );
            return interaction.showModal(modal);
        }
        if (action === 'del') {
            const modal = new ModalBuilder().setCustomId(`mod_acc_del_${entity}`).setTitle('Suppression de facture')
                .addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('index').setLabel('Numéro de la facture (ex: 1)').setStyle(TextInputStyle.Short).setRequired(true)));
            return interaction.showModal(modal);
        }
    }

    // --- SOUMISSIONS DE MODALS (PUBLICATION DIRECTE DANS LES SALONS CIBLES) ---
    if (interaction.isModalSubmit()) {
        const modId = interaction.customId;

        // 1. Annonces
        if (modId.startsWith('mod_ann_')) {
            const type = modId.replace('mod_ann_', '');
            const text = interaction.fields.getTextInputValue('text');
            const targetName = type === 'postop' ? 'annonces-post-op' : 'annonces';
            const chan = interaction.guild.channels.cache.find(c => c.name === targetName);
            
            if (chan) {
                const embed = new EmbedBuilder()
                    .setTitle(type === 'postop' ? 'POST OP LOGISTICS — COMMUNIQUÉ' : 'COMMUNIQUÉ OFFICIEL')
                    .setDescription(text)
                    .setColor(type === 'postop' ? 0x202225 : 0x2f3136)
                    .setTimestamp();
                await chan.send({ embeds: [embed] });
                return interaction.reply({ content: `Communiqué publié dans #${targetName}.`, ephemeral: true });
            }
            return interaction.reply({ content: `Salon cible introuvable.`, ephemeral: true });
        }

        // 2. Commerces & Partenaires (Publié directement comme une annonce)
        if (modId.startsWith('mod_pub_commerce') || modId.startsWith('mod_pub_partenaire')) {
            const type = modId.includes('commerce') ? 'Commerce Local' : 'Partenaire Officiel';
            const nom = interaction.fields.getTextInputValue('nom');
            const desc = interaction.fields.getTextInputValue('desc');
            const logo = interaction.fields.getTextInputValue('logo');

            const chan = interaction.guild.channels.cache.find(c => c.name === 'commerces-et-partenariats');
            if (chan) {
                const embed = new EmbedBuilder()
                    .setTitle(`NOUVELLE RÉFÉRENCE — ${type.toUpperCase()}`)
                    .addFields(
                        { name: 'Enseigne', value: nom, inline: false },
                        { name: 'Description', value: desc, inline: false }
                    )
                    .setColor(0x2f3136)
                    .setTimestamp();
                
                if (logo && logo.startsWith('http')) {
                    embed.setThumbnail(logo);
                }

                await chan.send({ embeds: [embed] });
                return interaction.reply({ content: `Fiche ${type} publiée avec succès.`, ephemeral: true });
            }
            return interaction.reply({ content: `Salon de publication introuvable.`, ephemeral: true });
        }

        // 3. Calendrier (Publié directement comme une annonce)
        if (modId === 'mod_pub_evenement') {
            const date = interaction.fields.getTextInputValue('date');
            const titre = interaction.fields.getTextInputValue('titre');
            const desc = interaction.fields.getTextInputValue('desc');
            const logo = interaction.fields.getTextInputValue('logo');

            const chan = interaction.guild.channels.cache.find(c => c.name === 'calendrier-2026');
            if (chan) {
                const embed = new EmbedBuilder()
                    .setTitle(`AGENDA 2026 — ${titre.toUpperCase()}`)
                    .addFields(
                        { name: 'Date & Horaire', value: date, inline: false },
                        { name: 'Détails', value: desc, inline: false }
                    )
                    .setColor(0x2f3136)
                    .setTimestamp();

                if (logo && logo.startsWith('http')) {
                    embed.setImage(logo);
                }

                await chan.send({ embeds: [embed] });
                return interaction.reply({ content: 'Événement publié dans le calendrier.', ephemeral: true });
            }
            return interaction.reply({ content: 'Salon calendrier introuvable.', ephemeral: true });
        }

        // 4. Gestion Comptabilité via Modals
        if (modId.startsWith('mod_acc_')) {
            const parts = modId.split('_');
            // ex: mod_acc_money_add_association ou mod_acc_inv_postop
            const subType = parts[2]; // money, inv, del
            const entity = parts[parts.length - 1];

            if (subType === 'money') {
                const action = parts[3]; // add ou sub
                const montant = parseFloat(interaction.fields.getTextInputValue('montant'));
                if (isNaN(montant)) return interaction.reply({ content: 'Montant invalide.', ephemeral: true });

                if (action === 'add') db[entity].solde += montant;
                if (action === 'sub') db[entity].solde -= montant;
            } else if (subType === 'inv') {
                const client = interaction.fields.getTextInputValue('client');
                const montant = parseFloat(interaction.fields.getTextInputValue('montant'));
                if (isNaN(montant)) return interaction.reply({ content: 'Montant invalide.', ephemeral: true });
                db[entity].factures.push({ client, montant, statut: 'Émise' });
            } else if (subType === 'del') {
                const index = parseInt(interaction.fields.getTextInputValue('index')) - 1;
                if (isNaN(index) || !db[entity].factures[index]) return interaction.reply({ content: 'Facture introuvable.', ephemeral: true });
                db[entity].factures.splice(index, 1);
            }

            // Mise à jour du panneau comptable
            const msgs = await interaction.channel.messages.fetch({ limit: 10 });
            const targetMsg = msgs.find(m => m.embeds[0] && m.embeds[0].title.includes(entity === 'postop' ? 'POST OP' : 'ARMENIAN'));
            if (targetMsg) {
                await targetMsg.edit({ embeds: [getAccountingEmbed(entity)], components: [getAccountingComponents(entity)] });
            }

            return interaction.reply({ content: 'Registre comptable mis à jour.', ephemeral: true });
        }
    }
}

module.exports = { initAllPanels, handleManagersInteraction };
