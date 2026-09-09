const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, MessageFlags } = require('discord.js');

const db = {
    association: { solde: 0, factures: [] },
    postop: { solde: 0, factures: [] }
};

function getBureauAssociationEmbed() {
    return new EmbedBuilder()
        .setTitle('LITTLE ARMENIA ASSOCIATION — DIRECTION')
        .setDescription('Sélectionnez une action administrative dans le menu ci-dessous.')
        .setColor(0x2f3136)
        .setTimestamp();
}

function getBureauAssociationComponents() {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('menu_assoc')
            .setPlaceholder('Sélectionner une action administrative...')
            .addOptions([
                { label: 'Rédiger une annonce officielle', value: 'ann_assoc', description: 'Publier un communiqué' },
                { label: 'Publier un commerce', value: 'pub_commerce', description: 'Ajouter une fiche commerce' },
                { label: 'Publier un partenaire', value: 'pub_partenaire', description: 'Ajouter une fiche partenaire' },
                { label: 'Planifier un événement', value: 'pub_evenement', description: 'Ajouter une entrée au calendrier' }
            ])
    );
}

function getBureauPostOpEmbed() {
    return new EmbedBuilder()
        .setTitle('POST OP LOGISTICS — DIRECTION EXÉCUTIVE')
        .setDescription('Sélectionnez une action opérationnelle dans le menu ci-dessous.')
        .setColor(0x202225)
        .setTimestamp();
}

function getBureauPostOpComponents() {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('menu_postop')
            .setPlaceholder('Sélectionner une action opérationnelle...')
            .addOptions([
                { label: 'Rédiger une annonce Post Op', value: 'ann_postop', description: 'Publier un communiqué interne/externe' }
            ])
    );
}

function getAccountingEmbed(entity) {
    const data = db[entity];
    const isPostOp = entity === 'postop';
    const title = isPostOp ? 'POST OP LOGISTICS — RAPPORT FINANCIER' : 'LITTLE ARMENIA — RAPPORT FINANCIER';
    
    let facturesList = data.factures.length === 0 
        ? 'Aucune facture active enregistrée.' 
        : data.factures.map((f, i) => `[${i+1}] ${f.client} — $${f.montant.toLocaleString()} (${f.statut})`).join('\n');

    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(`Trésorerie nette : $${data.solde.toLocaleString()}\n\nFacturation :\n${facturesList}`)
        .setColor(isPostOp ? 0x202225 : 0x2f3136)
        .setTimestamp();
}

function getAccountingComponents(entity) {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(`menu_acc_${entity}`)
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

        const assocMsg = botMsgs.find(m => m.embeds[0]?.title?.includes('LITTLE ARMENIA ASSOCIATION'));
        const postOpMsg = botMsgs.find(m => m.embeds[0]?.title?.includes('POST OP LOGISTICS'));

        if (!assocMsg) {
            await bureauChan.send({ embeds: [getBureauAssociationEmbed()], components: [getBureauAssociationComponents()] });
        } else {
            await assocMsg.edit({ embeds: [getBureauAssociationEmbed()], components: [getBureauAssociationComponents()] });
        }

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

        const comptaAssocMsg = botMsgs.find(m => m.embeds[0]?.title?.includes('LITTLE ARMENIA — RAPPORT'));
        const comptaPostOpMsg = botMsgs.find(m => m.embeds[0]?.title?.includes('POST OP LOGISTICS — RAPPORT'));

        if (!comptaAssocMsg) {
            await comptaChan.send({ embeds: [getAccountingEmbed('association')], components: [getAccountingComponents('association')] });
        } else {
            await comptaAssocMsg.edit({ embeds: [getAccountingEmbed('association')], components: [getAccountingComponents('association')] });
        }

        if (!comptaPostOpMsg) {
            await comptaChan.send({ embeds: [getAccountingEmbed('postop')], components: [getAccountingComponents('postop')] });
        } else {
            await comptaPostOpMsg.edit({ embeds: [getAccountingEmbed('postop')], components: [getAccountingComponents('postop')] });
        }
    }
}

async function handleManagersInteraction(interaction) {
    const id = interaction.customId;
    if (!id) return;
    
    const isManaged = id === 'menu_assoc' || id === 'menu_postop' || id.startsWith('menu_acc_') || id.startsWith('mod_ann_') || id.startsWith('mod_pub_') || id.startsWith('mod_acc_');
    if (!isManaged) return;

    if (interaction.isStringSelectMenu()) {
        const val = interaction.values[0];

        if (id === 'menu_assoc' || id === 'menu_postop') {
            if (val === 'ann_assoc' || val === 'ann_postop') {
                const type = val === 'ann_assoc' ? 'association' : 'postop';
                const modal = new ModalBuilder().setCustomId(`mod_ann_${type}`).setTitle('Rédaction d\'annonce')
                    .addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('text').setLabel('Contenu du communiqué').setStyle(TextInputStyle.Paragraph).setRequired(true)));
                return await interaction.showModal(modal);
            }

            if (val === 'pub_commerce' || val === 'pub_partenaire') {
                const target = val === 'pub_commerce' ? 'commerce' : 'partenaire';
                const modal = new ModalBuilder().setCustomId(`mod_pub_${target}`).setTitle(`Publication — ${target.toUpperCase()}`)
                    .addComponents(
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nom').setLabel('Nom de l\'enseigne').setStyle(TextInputStyle.Short).setRequired(true)),
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('desc').setLabel('Descriptif détaillé').setStyle(TextInputStyle.Paragraph).setRequired(true)),
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('logo').setLabel('URL de l\'image / Logo').setStyle(TextInputStyle.Short).setRequired(false))
                    );
                return await interaction.showModal(modal);
            }

            if (val === 'pub_evenement') {
                const modal = new ModalBuilder().setCustomId('mod_pub_evenement').setTitle('Publication — Événement')
                    .addComponents(
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('date').setLabel('Date et heure').setStyle(TextInputStyle.Short).setRequired(true)),
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('titre').setLabel('Intitulé de l\'événement').setStyle(TextInputStyle.Short).setRequired(true)),
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('desc').setLabel('Descriptif et lieu').setStyle(TextInputStyle.Paragraph).setRequired(true)),
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('logo').setLabel('URL du visuel (Optionnel)').setStyle(TextInputStyle.Short).setRequired(false))
                    );
                return await interaction.showModal(modal);
            }
        }

        if (id.startsWith('menu_acc_')) {
            const entity = id.replace('menu_acc_', '');

            if (val === 'add' || val === 'sub') {
                const modal = new ModalBuilder().setCustomId(`mod_acc_money_${val}_${entity}`).setTitle('Ajustement financier')
                    .addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('montant').setLabel('Montant ($)').setStyle(TextInputStyle.Short).setRequired(true)));
                return await interaction.showModal(modal);
            }
            if (val === 'inv') {
                const modal = new ModalBuilder().setCustomId(`mod_acc_inv_${entity}`).setTitle('Émission de facture')
                    .addComponents(
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('client').setLabel('Client / Destinataire').setStyle(TextInputStyle.Short).setRequired(true)),
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('montant').setLabel('Montant ($)').setStyle(TextInputStyle.Short).setRequired(true))
                    );
                return await interaction.showModal(modal);
            }
            if (val === 'del') {
                const modal = new ModalBuilder().setCustomId(`mod_acc_del_${entity}`).setTitle('Suppression de facture')
                    .addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('index').setLabel('Numéro de la facture (ex: 1)').setStyle(TextInputStyle.Short).setRequired(true)));
                return await interaction.showModal(modal);
            }
        }
    }

    if (interaction.isModalSubmit()) {
        const modId = interaction.customId;

        if (modId.startsWith('mod_ann_')) {
            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
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
                return await interaction.editReply({ content: `Communiqué transmis.` });
            }
            return await interaction.editReply({ content: 'Salon introuvable.' });
        }

        if (modId.startsWith('mod_pub_commerce') || modId.startsWith('mod_pub_partenaire')) {
            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
            const type = modId.includes('commerce') ? 'Commerce Local' : 'Partenaire Officiel';
            const nom = interaction.fields.getTextInputValue('nom');
            const desc = interaction.fields.getTextInputValue('desc');
            const logo = interaction.fields.getTextInputValue('logo');

            const chan = interaction.guild.channels.cache.find(c => c.name === 'commerces-et-partenariats');
            if (chan) {
                const embed = new EmbedBuilder()
                    .setTitle(`RÉFÉRENCE — ${type.toUpperCase()}`)
                    .addFields({ name: 'Enseigne', value: nom }, { name: 'Descriptif', value: desc })
                    .setColor(0x2f3136)
                    .setTimestamp();
                if (logo && logo.startsWith('http')) embed.setThumbnail(logo);
                await chan.send({ embeds: [embed] });
                return await interaction.editReply({ content: 'Fiche publiée.' });
            }
            return await interaction.editReply({ content: 'Salon introuvable.' });
        }

        if (modId === 'mod_pub_evenement') {
            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
            const date = interaction.fields.getTextInputValue('date');
            const titre = interaction.fields.getTextInputValue('titre');
            const desc = interaction.fields.getTextInputValue('desc');
            const logo = interaction.fields.getTextInputValue('logo');

            let chan = interaction.guild.channels.cache.get('1547194694163894337');
            if (!chan) {
                chan = interaction.guild.channels.cache.find(c => c.name === 'calendrier-2026');
            }

            if (chan) {
                const embed = new EmbedBuilder()
                    .setTitle(`CALENDRIER 2026 — ${titre.toUpperCase()}`)
                    .addFields({ name: 'Date', value: date }, { name: 'Détails', value: desc })
                    .setColor(0x2f3136)
                    .setTimestamp();
                if (logo && logo.startsWith('http')) embed.setImage(logo);
                
                await chan.send({ embeds: [embed] });
                return await interaction.editReply({ content: 'Événement publié.' });
            }
            return await interaction.editReply({ content: 'Salon introuvable.' });
        }

        if (modId.startsWith('mod_acc_')) {
            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
            const parts = modId.split('_');
            const subType = parts[2]; 
            const entity = parts[parts.length - 1];

            if (subType === 'money') {
                const action = parts[3]; 
                const montant = parseFloat(interaction.fields.getTextInputValue('montant'));
                if (!isNaN(montant)) {
                    if (action === 'add') db[entity].solde += montant;
                    if (action === 'sub') db[entity].solde -= montant;
                }
            } else if (subType === 'inv') {
                const client = interaction.fields.getTextInputValue('client');
                const montant = parseFloat(interaction.fields.getTextInputValue('montant'));
                if (!isNaN(montant)) db[entity].factures.push({ client, montant, statut: 'Émise' });
            } else if (subType === 'del') {
                const index = parseInt(interaction.fields.getTextInputValue('index')) - 1;
                if (!isNaN(index) && db[entity].factures[index]) db[entity].factures.splice(index, 1);
            }

            await interaction.editReply({ content: 'Registre mis à jour.' });

            try {
                const chan = interaction.guild.channels.cache.find(c => c.name === 'comptabilite');
                if (chan) {
                    const msgs = await chan.messages.fetch({ limit: 20 });
                    const targetMsg = msgs.find(m => m.embeds[0] && m.embeds[0].title.includes(entity === 'postop' ? 'POST OP LOGISTICS — RAPPORT' : 'LITTLE ARMENIA — RAPPORT'));
                    if (targetMsg) {
                        await targetMsg.edit({ embeds: [getAccountingEmbed(entity)], components: [getAccountingComponents(entity)] });
                    }
                }
            } catch (err) {
                console.error("Erreur de mise à jour comptable :", err);
            }
        }
    }
}

module.exports = { initAllPanels, handleManagersInteraction };
