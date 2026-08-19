const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

const financialLedger = {
    cashFlow: 0.00,
    transactions: []
};

const logisticsLedger = {
    inventory: [],
    shipments: []
};

async function initRegisters(guild) {
    const financeChannel = guild.channels.cache.find(c => c.name === "finance");
    const logisticsChannel = guild.channels.cache.find(c => c.name === "logistique");

    if (financeChannel) {
        const messages = await financeChannel.messages.fetch({ limit: 5 });
        if (messages.size === 0) {
            await sendFinancePanel(financeChannel);
        }
    }

    if (logisticsChannel) {
        const messages = await logisticsChannel.messages.fetch({ limit: 5 });
        if (messages.size === 0) {
            await sendLogisticsPanel(logisticsChannel);
        }
    }
}

async function sendFinancePanel(channel) {
    const embed = {
        color: 0x111111,
        title: "NAIRI OS // REGISTRE FINANCIER & TRÉSORERIE",
        description: "Suivi comptable de l'entreprise.",
        fields: [
            { name: "TRÉSORERIE DISPONIBLE", value: `**$${financialLedger.cashFlow.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD**`, inline: false },
            { name: "DERNIÈRES TRANSACTIONS", value: formatTransactions(), inline: false }
        ],
        footer: { text: "COMPTABILITÉ • NAIRI CORPORATION" },
        timestamp: new Date().toISOString()
    };

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('fin_select_action')
        .setPlaceholder('⚙️ Sélectionner une action financière...')
        .addOptions([
            { label: 'Enregistrer une Entrée', description: 'Ajouter des fonds à la trésorerie', value: 'action_entree', emoji: '📈' },
            { label: 'Enregistrer une Sortie', description: 'Déduire des fonds de la trésorerie', value: 'action_sortie', emoji: '📉' }
        ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);
    await channel.send({ embeds: [embed], components: [row] });
}

async function sendLogisticsPanel(channel) {
    const embed = {
        color: 0x111111,
        title: "NAIRI OS // REGISTRE LOGISTIQUE & FRET",
        description: "Gestion des stocks et des statuts de transport.",
        fields: [
            { name: "INVENTAIRE DISPONIBLE", value: formatInventory(), inline: false }
        ],
        footer: { text: "LOGISTIQUE • NAIRI CORPORATION" },
        timestamp: new Date().toISOString()
    };

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('log_select_action')
        .setPlaceholder('⚙️ Sélectionner une action logistique...')
        .addOptions([
            { label: 'Ajouter du Matériel (Stock)', description: 'Ajouter des articles en inventaire avec quantité', value: 'action_stock', emoji: '📦' },
            { label: 'Retirer du Matériel (Stock)', description: 'Retirer ou déduire des articles de l’inventaire', value: 'action_remove_stock', emoji: '🗑️' },
            { label: 'Créer un Transport (Fret)', description: 'Enregistrer un nouveau fret dans un message dédié', value: 'action_fret', emoji: '🚚' }
        ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);
    await channel.send({ embeds: [embed], components: [row] });
}

function formatTransactions() {
    if (financialLedger.transactions.length === 0) return "Aucune transaction (Départ : $0.00).";
    return financialLedger.transactions.slice(-5).map(t => 
        `\`${t.id}\` | **${t.type}** : $${t.amount.toLocaleString()} — *${t.label}*`
    ).join('\n');
}

function formatInventory() {
    if (logisticsLedger.inventory.length === 0) return "Aucun matériel en stock (Vide).";
    return logisticsLedger.inventory.map(i => 
        `\`${i.id}\` | **${i.item}** — Stock : \`${i.quantity}\``
    ).join('\n');
}

async function updateChannelPanel(guild, channelName) {
    const channel = guild.channels.cache.find(c => c.name === channelName);
    if (!channel) return;

    const messages = await channel.messages.fetch({ limit: 15 });
    const panelMessage = messages.find(m => m.author.id === channel.client.user.id && m.embeds.length > 0 && m.embeds[0].title && m.embeds[0].title.includes("NAIRI OS // REGISTRE LOGISTIQUE"));
    if (!panelMessage) return;

    const embed = panelMessage.embeds[0];
    const updatedEmbed = EmbedBuilder.from(embed).setFields(
        embed.fields.map(f => f.name === "INVENTAIRE DISPONIBLE" ? { name: "INVENTAIRE DISPONIBLE", value: formatInventory(), inline: false } : f)
    );

    await panelMessage.edit({ embeds: [updatedEmbed] });
}

async function handleRegisterInteraction(interaction) {
    const customId = interaction.customId;

    if (customId === 'fin_select_action') {
        const selectedValue = interaction.values[0];
        const txType = selectedValue === 'action_entree' ? 'ENTREE' : 'SORTIE';

        const modal = new ModalBuilder()
            .setCustomId(`modal_fin_${txType}`)
            .setTitle(`FINANCE // ${txType}`);

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('fin_amount').setLabel("MONTANT EN USD").setStyle(TextInputStyle.Short).setPlaceholder("Ex: 10000").setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('fin_label').setLabel("LIBELLÉ / MOTIF").setStyle(TextInputStyle.Short).setPlaceholder("Ex: Vente de lots...").setRequired(true)
            )
        );

        return await interaction.showModal(modal);
    }
    else if (customId === 'log_select_action') {
        const selectedValue = interaction.values[0];

        if (selectedValue === 'action_stock') {
            const modal = new ModalBuilder()
                .setCustomId('modal_log_STOCK')
                .setTitle('LOGISTIQUE // AJOUT DE STOCK');

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('log_desc').setLabel("NOM DU MATÉRIAU").setStyle(TextInputStyle.Short).setPlaceholder("Ex: Unités high-tech").setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('log_extra').setLabel("QUANTITÉ EN STOCK").setStyle(TextInputStyle.Short).setPlaceholder("Ex: 50").setRequired(true)
                )
            );
            return await interaction.showModal(modal);
        }
        else if (selectedValue === 'action_remove_stock') {
            if (logisticsLedger.inventory.length === 0) {
                return await interaction.reply({ content: "Le stock est vide, aucun matériel à retirer.", flags: MessageFlags.Ephemeral });
            }

            const options = logisticsLedger.inventory.slice(0, 25).map(i => ({
                label: `${i.item} (Stock: ${i.quantity})`.substring(0, 100),
                value: i.id
            }));

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('log_select_item_remove')
                .setPlaceholder('Sélectionnez le matériel à retirer...')
                .addOptions(options);

            const row = new ActionRowBuilder().addComponents(selectMenu);
            return await interaction.reply({ content: "Choisissez l'article à déduire de l'inventaire :", components: [row], flags: MessageFlags.Ephemeral });
        }
        else if (selectedValue === 'action_fret') {
            const modal = new ModalBuilder()
                .setCustomId('modal_log_FRET')
                .setTitle('LOGISTIQUE // CRÉATION TRANSPORT');

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('log_desc').setLabel("DESCRIPTION DU FRET / MARCHANDISE").setStyle(TextInputStyle.Short).setPlaceholder("Ex: Caisses blindées").setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('log_extra').setLabel("DESTINATION / ITINÉRAIRE").setStyle(TextInputStyle.Short).setPlaceholder("Ex: Avant-poste Alpha").setRequired(true)
                )
            );
            return await interaction.showModal(modal);
        }
    }
    else if (customId === 'log_select_item_remove') {
        const itemId = interaction.values[0];
        const itemObj = logisticsLedger.inventory.find(i => i.id === itemId);

        if (!itemObj) {
            return await interaction.update({ content: "Article introuvable.", components: [] });
        }

        const modal = new ModalBuilder()
            .setCustomId(`modal_remove_stock_${itemId}`)
            .setTitle(`RETRAIT // ${itemObj.item.toUpperCase()}`.substring(0, 45));

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('remove_qty')
                    .setLabel(`QUANTITÉ À DÉDUIRE (Max: ${itemObj.quantity})`.substring(0, 45))
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder("Ex: 5")
                    .setRequired(true)
            )
        );

        return await interaction.showModal(modal);
    }
    else if (customId === 'trans_set_status') {
        const newStatus = interaction.values[0];
        const message = interaction.message;
        const embed = message.embeds[0];
        if (!embed) return;

        const updatedEmbed = EmbedBuilder.from(embed).setFields(
            embed.fields.map(f => f.name === "ÉTAT DU TRANSPORT" ? { name: "ÉTAT DU TRANSPORT", value: newStatus, inline: true } : f)
        );

        let components = [];

        if (newStatus !== 'Terminé') {
            const statusSelect = new StringSelectMenuBuilder()
                .setCustomId('trans_set_status')
                .setPlaceholder('Modifier l\'étape du transport...')
                .addOptions([
                    { label: 'Pas commencé', value: 'Pas commencé', emoji: '⏳' },
                    { label: 'En transit', value: 'En transit', emoji: '🚚' },
                    { label: 'Terminé', value: 'Terminé', emoji: '✅' }
                ]);
            
            components.push(new ActionRowBuilder().addComponents(statusSelect));

            const deleteRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('trans_delete').setLabel('Supprimer le transit').setStyle(ButtonStyle.Danger)
            );
            components.push(deleteRow);
        }

        await message.edit({ embeds: [updatedEmbed], components: components });
        return await interaction.reply({ content: `Étape du transport mise à jour : **${newStatus}**`, flags: MessageFlags.Ephemeral });
    }
    else if (customId === 'trans_delete') {
        const message = interaction.message;
        await interaction.reply({ content: "Transit supprimé avec succès.", flags: MessageFlags.Ephemeral });
        return await message.delete();
    }
}

async function handleRegisterModal(interaction) {
    const customId = interaction.customId;
    const guild = interaction.guild;

    if (customId.startsWith('modal_fin_')) {
        const type = customId.split('_')[2];
        const amount = parseFloat(interaction.fields.getTextInputValue('fin_amount'));
        const label = interaction.fields.getTextInputValue('fin_label');

        if (isNaN(amount) || amount <= 0) {
            return await interaction.reply({ content: "Erreur : Le montant est invalide.", flags: MessageFlags.Ephemeral });
        }

        if (type === 'ENTREE') {
            financialLedger.cashFlow += amount;
        } else {
            financialLedger.cashFlow -= amount;
        }

        const txId = `TX-${String(financialLedger.transactions.length + 1).padStart(3, '0')}`;
        financialLedger.transactions.push({ id: txId, type: type, amount: amount, label: label });

        const financeChannel = guild.channels.cache.find(c => c.name === "finance");
        if (financeChannel) {
            const messages = await financeChannel.messages.fetch({ limit: 10 });
            const panel = messages.find(m => m.author.id === financeChannel.client.user.id && m.embeds.length > 0);
            if (panel) {
                const embed = panel.embeds[0];
                const updated = { ...embed, fields: [
                    { name: "TRÉSORERIE DISPONIBLE", value: `**$${financialLedger.cashFlow.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD**`, inline: false },
                    { name: "DERNIÈRES TRANSACTIONS", value: formatTransactions(), inline: false }
                ]};
                await panel.edit({ embeds: [updated] });
            }
        }

        return await interaction.reply({ content: `Transaction **${txId}** (${type}) enregistrée avec succès.`, flags: MessageFlags.Ephemeral });
    }
    else if (customId.startsWith('modal_remove_stock_')) {
        const itemId = customId.split('_')[3];
        const qtyToRemove = parseInt(interaction.fields.getTextInputValue('remove_qty'));

        if (isNaN(qtyToRemove) || qtyToRemove <= 0) {
            return await interaction.reply({ content: "Erreur : Quantité invalide.", flags: MessageFlags.Ephemeral });
        }

        const index = logisticsLedger.inventory.findIndex(i => i.id === itemId);
        if (index === -1) {
            return await interaction.reply({ content: "Article introuvable dans l'inventaire.", flags: MessageFlags.Ephemeral });
        }

        const item = logisticsLedger.inventory[index];
        if (qtyToRemove > item.quantity) {
            return await interaction.reply({ content: `Erreur : Vous essayez de retirer ${qtyToRemove} unités alors qu'il n'y en a que ${item.quantity} en stock.`, flags: MessageFlags.Ephemeral });
        }

        item.quantity -= qtyToRemove;
        let messageResponse = `Retrait de **${qtyToRemove}** unité(s) pour **${item.item}**.`;

        if (item.quantity <= 0) {
            logisticsLedger.inventory.splice(index, 1);
            messageResponse += ` L'article est épuisé et a été complètement retiré de l'inventaire.`;
        }

        await updateChannelPanel(guild, 'logistique');
        return await interaction.reply({ content: messageResponse, flags: MessageFlags.Ephemeral });
    }
    else if (customId.startsWith('modal_log_')) {
        const actionType = customId.split('_')[2]; 
        const desc = interaction.fields.getTextInputValue('log_desc');
        const extra = interaction.fields.getTextInputValue('log_extra');

        if (actionType === 'STOCK') {
            const qty = parseInt(extra) || 1;
            const invId = `INV-${String(logisticsLedger.inventory.length + 1).padStart(3, '0')}`;
            logisticsLedger.inventory.push({ id: invId, item: desc, quantity: qty });
            
            await updateChannelPanel(guild, 'logistique');
            return await interaction.reply({ content: `Matériel **${invId} (${desc})** ajouté au stock (${qty} unités).`, flags: MessageFlags.Ephemeral });
        } 
        else if (actionType === 'FRET') {
            const destination = extra;
            const logId = `LOG-${String(logisticsLedger.shipments.length + 1).padStart(3, '0')}`;
            logisticsLedger.shipments.push({ id: logId, item: desc, destination: destination, status: "Pas commencé" });

            const transportEmbed = new EmbedBuilder()
                .setColor(0x111111)
                .setTitle(`LOGISTIQUE // TRANSPORT [${logId}]`)
                .addFields(
                    { name: "CHARGEMENT", value: desc, inline: false },
                    { name: "DESTINATION", value: destination, inline: true },
                    { name: "ÉTAT DU TRANSPORT", value: "Pas commencé", inline: true }
                )
                .setFooter({ text: "NAIRI CORPORATION • SYSTÈME LOGISTIQUE" })
                .setTimestamp();

            const statusSelect = new StringSelectMenuBuilder()
                .setCustomId('trans_set_status')
                .setPlaceholder('Modifier l\'étape du transport...')
                .addOptions([
                    { label: 'Pas commencé', value: 'Pas commencé', emoji: '⏳' },
                    { label: 'En transit', value: 'En transit', emoji: '🚚' },
                    { label: 'Terminé', value: 'Terminé', emoji: '✅' }
                ]);

            const rowSelect = new ActionRowBuilder().addComponents(statusSelect);
            const rowButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('trans_delete').setLabel('Supprimer le transit').setStyle(ButtonStyle.Danger)
            );

            await interaction.reply({ content: `Transport **${logId}** créé dans un message dédié du salon.`, flags: MessageFlags.Ephemeral });
            return await interaction.channel.send({ embeds: [transportEmbed], components: [rowSelect, rowButton] });
        }
    }
}

module.exports = { initRegisters, handleRegisterInteraction, handleRegisterModal };
