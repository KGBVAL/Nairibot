const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

// Stockage local simple (tu pourras basculer sur une base de données plus tard si besoin)
const db = {
    association: { solde: 0, factures: [] },
    postop: { solde: 0, factures: [] }
};

// Fonction pour générer le panneau d'affichage propre et non cliché
function getAccountingEmbed(entity) {
    const data = db[entity];
    const isPostOp = entity === 'postop';
    
    const title = isPostOp ? 'POST OP LOGISTICS — COMPTABILITÉ' : 'ARMENIAN ASSOCIATION OF VINEWOOD — TRÉSORERIE';
    const color = isPostOp ? 0x2b2d31 : 0xd4af37; // Gris industriel sombre ou Doré/Laiton subtil

    let facturesList = data.factures.length === 0 
        * 'Aucune facture enregistrée pour le moment.' 
        : data.factures.slice(-5).map((f, index) => `\`#${index + 1}\` • **${f.client}** : $${f.montant.toLocaleString()} — *(${f.statut})*`).join('\n');

    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(`Registre financier officiel et gestion des flux.\n\n**Solde Actuel :** \`$${data.solde.toLocaleString()}\``)
        .addFields(
            { name: '📋 Dernières Factures Émises', value: facturesList, inline: false }
        )
        .setColor(color)
        .setFooter({ text: 'Système comptable sécurisé • Gestion interne' })
        .setTimestamp();
}

function getAccountingComponents(entity) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`acc_add_${entity}`)
            .setLabel('Ajouter Recette')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(`acc_sub_${entity}`)
            .setLabel('Retirer Fonds')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId(`acc_inv_${entity}`)
            .setLabel('Créer Facture')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId(`acc_del_${entity}`)
            .setLabel('Supprimer Facture')
            .setStyle(ButtonStyle.Secondary)
    );
}

// Initialisation du salon comptabilité
async function initAccountingPanel(guild) {
    const channel = guild.channels.cache.find(c => c.name === 'comptabilite');
    if (!channel) return;

    try {
        const messages = await channel.messages.fetch({ limit: 10 });
        const existingMsg = messages.find(m => m.author.id === guild.client.user.id);

        // On poste les deux panneaux séparés (Association et Post Op)
        const payloads = [
            { entity: 'association', embed: getAccountingEmbed('association'), components: getAccountingComponents('association') },
            { entity: 'postop', embed: getAccountingEmbed('postop'), components: getAccountingComponents('postop') }
        ];

        if (!existingMsg) {
            for (const p of payloads) {
                await channel.send({ embeds: [p.embed], components: [p.components] });
            }
        }
    } catch (error) {
        console.error('[COMPTA] Erreur initialisation panneau :', error);
    }
}

// Gestion des interactions des boutons et modals
async function handleAccountingInteraction(interaction) {
    if (!interaction.isButton() && !interaction.isModalSubmit()) return;

    const customId = interaction.customId;
    if (!customId.startsWith('acc_')) return;

    const parts = customId.split('_');
    const action = parts[1]; // add, sub, inv, del, modal
    const entity = parts[2]; // association ou postop

    // --- GESTION DES MODALS (Formulaires) ---
    if (interaction.isModalSubmit()) {
        if (action === 'modaladd' || action === 'modalsub') {
            const amount = parseFloat(interaction.fields.getTextInputValue('amount_input'));
            if (isNaN(amount) || amount <= 0) {
                return interaction.reply({ content: 'Montant invalide.', ephemeral: true });
            }

            if (action === 'modaladd') db[entity].solde += amount;
            if (action === 'modalsub') db[entity].solde -= amount;

            await updatePanel(interaction, entity);
            return interaction.reply({ content: 'Opération enregistrée avec succès.', ephemeral: true });
        }

        if (action === 'modalinv') {
            const client = interaction.fields.getTextInputValue('client_input');
            const montant = parseFloat(interaction.fields.getTextInputValue('montant_input'));

            if (isNaN(montant) || montant <= 0) {
                return interaction.reply({ content: 'Montant invalide.', ephemeral: true });
            }

            db[entity].factures.push({ client, montant, statut: 'Émise' });
            await updatePanel(interaction, entity);
            return interaction.reply({ content: `Facture pour ${client} ($${montant}) générée.`, ephemeral: true });
        }

        if (action === 'modaldel') {
            const index = parseInt(interaction.fields.getTextInputValue('index_input')) - 1;
            if (isNaN(index) || !db[entity].factures[index]) {
                return interaction.reply({ content: 'Numéro de facture introuvable.', ephemeral: true });
            }

            db[entity].factures.splice(index, 1);
            await updatePanel(interaction, entity);
            return interaction.reply({ content: 'Facture supprimée du registre.', ephemeral: true });
        }
    }

    // --- OUVERTURE DES MODALS SELON LE BOUTON CLIQUÉ ---
    if (action === 'add' || action === 'sub') {
        const modal = new ModalBuilder()
            .setCustomId(`acc_modal${action}_${entity}`)
            .setTitle(action === 'add' ? 'Ajouter une recette' : 'Retirer des fonds');

        const input = new TextInputBuilder()
            .setCustomId('amount_input')
            .setLabel('Montant ($)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(input));
        return interaction.showModal(modal);
    }

    if (action === 'inv') {
        const modal = new ModalBuilder()
            .setCustomId(`acc_modalinv_${entity}`)
            .setTitle('Créer une facture');

        const clientInput = new TextInputBuilder()
            .setCustomId('client_input')
            .setLabel('Nom du client / destinataire')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const montantInput = new TextInputBuilder()
            .setCustomId('montant_input')
            .setLabel('Montant ($)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(clientInput), new ActionRowBuilder().addComponents(montantInput));
        return interaction.showModal(modal);
    }

    if (action === 'del') {
        const modal = new ModalBuilder()
            .setCustomId(`acc_modaldel_${entity}`)
            .setTitle('Supprimer une facture');

        const indexInput = new TextInputBuilder()
            .setCustomId('index_input')
            .setLabel('Numéro de la facture (ex: 1, 2...)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(indexInput));
        return interaction.showModal(modal);
    }
}

async function updatePanel(interaction, entity) {
    const channel = interaction.channel;
    const messages = await channel.messages.fetch({ limit: 10 });
    const botMessages = messages.filter(m => m.author.id === interaction.client.user.id);
    
    // On cible le message correspondant à l'entité modifiée
    const targetMsg = botMessages.find(m => m.embeds[0] && m.embeds[0].title.includes(entity === 'postop' ? 'POST OP' : 'ARMENIAN'));

    if (targetMsg) {
        await targetMsg.edit({
            embeds: [getAccountingEmbed(entity)],
            components: [getAccountingComponents(entity)]
        });
    }
}

module.exports = { initAccountingPanel, handleAccountingInteraction };
