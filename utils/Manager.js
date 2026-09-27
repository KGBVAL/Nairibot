const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, MessageFlags } = require('discord.js');

const db = {
    postop: { solde: 0, factures: [] }
};

function getBureauPostOpEmbed() {
    return new EmbedBuilder()
        .setTitle('KHATCH & VALLEY — DIRECTION EXÉCUTIVE')
        .setDescription('Sélectionnez une action opérationnelle dans le menu ci-dessous.')
        .setColor(0x8B0000)
        .setTimestamp();
}

function getBureauPostOpComponents() {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('menu_postop')
            .setPlaceholder('Sélectionner une action opérationnelle...')
            .addOptions([
                { label: 'Rédiger une annonce Khatch & Valley', value: 'ann_postop', description: 'Publier un communiqué officiel' }
            ])
    );
}

function getAccountingEmbed() {
    const data = db.postop;
    let facturesList = data.factures.length === 0 
        ? 'Aucune facture active enregistrée.' 
        : data.factures.map((f, i) => `[${i+1}] ${f.client} — $${f.montant.toLocaleString()} (${f.statut})`).join('\n');

    return new EmbedBuilder()
        .setTitle('KHATCH & VALLEY — RAPPORT FINANCIER')
        .setDescription(`Trésorerie nette : $${data.solde.toLocaleString()}\n\nFacturation :\n${facturesList}`)
        .setColor(0x8B0000)
        .setTimestamp();
}

function getAccountingComponents() {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('menu_acc_postop')
            .setPlaceholder('Sélectionner une action financière...')
            .addOptions([
                { label: 'Ajouter une recette', value: 'add', description: 'Créditer la trésorerie' },
                { label: 'Retirer des fonds', value: 'sub', description: 'Débiter la trésorerie' },
                { label: 'Créer une facture', value: 'inv', description: 'Émettre une facture' },
                { label: 'Supprimer une facture', value: 'del', description: 'Retirer une facture' }
            ])
    );
}

async function initAllPanels(guild) {
    const client = guild.client;

    const bureauChan = guild.channels.cache.find(c => c.name === 'bureau');
    if (bureauChan) {
        const msgs = await bureauChan.messages.fetch({ limit: 20 });
        const botMsgs = msgs.filter(m => m.author.id === client.user.id);
        const postOpMsg = botMsgs.find(m => m.embeds[0]?.title?.includes('KHATCH & VALLEY'));

        if (!postOpMsg) {
            await bureauChan.send({ embeds: [getBureauPostOpEmbed()], components: [getBureauPostOpComponents()] });
        } else {
            await postOpMsg.edit({ embeds: [getBureauPostOpEmbed()], components: [getBureauPostOpComponents()] });
        }
    }

    const comptaChan = guild.channels.cache.find(c => c.name === 'comptabilite');
    if (comptaChan) {
        const msgs = await comptaChan.messages.fetch({ limit: 20 });
        const botMsgs = msgs.filter(m => m.author.id === client.user.id);
        const comptaPostOpMsg = botMsgs.find(m => m.embeds[0]?.title?.includes('KHATCH & VALLEY — RAPPORT'));

        if (!comptaPostOpMsg) {
            await comptaChan.send({ embeds: [getAccountingEmbed()], components: [getAccountingComponents()] });
        } else {
            await comptaPostOpMsg.edit({ embeds: [getAccountingEmbed()], components: [getAccountingComponents()] });
        }
    }
}

async function handleManagersInteraction(interaction) {
    const id = interaction.customId;
    if (!id) return;

    if (interaction.isStringSelectMenu()) {
        const val = interaction.values[0];

        if (id === 'menu_postop') {
            if (val === 'ann_postop') {
                const modal = new ModalBuilder().setCustomId('mod_ann_postop').setTitle('Rédaction d\'annonce')
                    .addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('text').setLabel('Contenu du communiqué').setStyle(TextInputStyle.Paragraph).setRequired(true)));
                return await interaction.showModal(modal);
            }
        }

        if (id === 'menu_acc_postop') {
            if (val === 'add' || val === 'sub') {
                const modal = new ModalBuilder().setCustomId(`mod_acc_money_${val}_postop`).setTitle('Ajustement financier')
                    .addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('montant').setLabel('Montant ($)').setStyle(TextInputStyle.Short).setRequired(true)));
                return await interaction.showModal(modal);
            }
            if (val === 'inv') {
                const modal = new ModalBuilder().setCustomId('mod_acc_inv_postop').setTitle('Émission de facture')
                    .addComponents(
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('client').setLabel('Client / Destinataire').setStyle(TextInputStyle.Short).setRequired(true)),
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('montant').setLabel('Montant ($)').setStyle(TextInputStyle.Short).setRequired(true))
                    );
                return await interaction.showModal(modal);
            }
            if (val === 'del') {
                const modal = new ModalBuilder().setCustomId('mod_acc_del_postop').setTitle('Suppression de facture')
                    .addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('index').setLabel('Numéro de la facture (ex: 1)').setStyle(TextInputStyle.Short).setRequired(true)));
                return await interaction.showModal(modal);
            }
        }
    }

    if (interaction.isModalSubmit()) {
        const modId = interaction.customId;

        if (modId === 'mod_ann_postop') {
            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
            const text = interaction.fields.getTextInputValue('text');
            const chan = interaction.guild.channels.cache.find(c => c.name === 'annonces');
            
            if (chan) {
                const embed = new EmbedBuilder()
                    .setTitle('KHATCH & VALLEY — COMMUNIQUÉ')
                    .setDescription(text)
                    .setColor(0x8B0000)
                    .setTimestamp();
                await chan.send({ embeds: [embed] });
                return await interaction.editReply({ content: 'Communiqué transmis avec succès.' });
            }
            return await interaction.editReply({ content: 'Salon d\'annonces introuvable.' });
        }

        if (modId.startsWith('mod_acc_')) {
            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
            const parts = modId.split('_');
            const subType = parts[2]; 

            if (subType === 'money') {
                const action = parts[3]; 
                const montant = parseFloat(interaction.fields.getTextInputValue('montant'));
                if (!isNaN(montant)) {
                    if (action === 'add') db.postop.solde += montant;
                    if (action === 'sub') db.postop.solde -= montant;
                }
            } else if (subType === 'inv') {
                const client = interaction.fields.getTextInputValue('client');
                const montant = parseFloat(interaction.fields.getTextInputValue('montant'));
                if (!isNaN(montant)) db.postop.factures.push({ client, montant, statut: 'Émise' });
            } else if (subType === 'del') {
                const index = parseInt(interaction.fields.getTextInputValue('index')) - 1;
                if (!isNaN(index) && db.postop.factures[index]) db.postop.factures.splice(index, 1);
            }

            await interaction.editReply({ content: 'Registre financier mis à jour.' });

            try {
                const chan = interaction.guild.channels.cache.find(c => c.name === 'comptabilite');
                if (chan) {
                    const msgs = await chan.messages.fetch({ limit: 20 });
                    const targetMsg = msgs.find(m => m.embeds[0] && m.embeds[0].title.includes('KHATCH & VALLEY — RAPPORT'));
                    if (targetMsg) {
                        await targetMsg.edit({ embeds: [getAccountingEmbed()], components: [getAccountingComponents()] });
                    }
                }
            } catch (err) {
                console.error("Erreur de mise à jour comptable :", err);
            }
        }
    }
}

module.exports = { initAllPanels, handleManagersInteraction };
