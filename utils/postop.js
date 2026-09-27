const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ChannelType,
    PermissionFlagsBits,
    MessageFlags
} = require('discord.js');

// ============================================================
// CONFIGURATION KHATCH & VALLEY
// ============================================================

const CONFIG_POSTOP = {
    staffRoles: [
        '1539267928762097770',
        '1539400476536217690'
    ],

    channels: {
        commandes: '1549433878056276120',
        recrutement: '1549433775916851351',
        service: '1549433834934763611'
    }
};

// ============================================================
// CATALOGUE KHATCH & VALLEY (AMÉLIORÉ & SUBLIMÉ)
// ============================================================

const CATALOGUE_PRODUITS = [
    {
        id: 'prod_1',
        code: '01',
        nom: 'KHATCH LAGER',
        type: 'Bière Blonde Premium',
        prix: 45,
        desc: 'Lager blonde légère, sèche et d’une pureté absolue. Idéale pour les chaudes journées à Los Angeles.',
        image: 'https://www.upload.ee/image/19756742/biere.png',
        emoji: '🍺'
    },
    {
        id: 'prod_2',
        code: '02',
        nom: 'KHATCH VALLEY WHISKY',
        type: 'American Whisky',
        prix: 180,
        desc: 'Whisky d’exception avec maturation en fûts de chêne arménien sélectionnés avec soin.',
        image: 'https://www.upload.ee/image/19756745/Whisky.png',
        emoji: '🥃'
    },
    {
        id: 'prod_3',
        code: '03',
        nom: 'KHATCH VODKA',
        type: 'Vodka Ultra-Pure',
        prix: 120,
        desc: 'Vodka distillée à partir de blé de premier choix, offrant une texture soyeuse et une finale délicate.',
        image: 'https://www.upload.ee/image/19756746/vodka.png',
        emoji: '🍸'
    },
    {
        id: 'prod_4',
        code: '04',
        nom: 'KHATCH BOTANICAL GIN',
        type: 'Gin Artisanal',
        prix: 150,
        desc: 'Gin complexe aux botaniques arméniennes : baies de genièvre, abricot séché, coriandre et herbes sauvages.',
        image: 'https://www.upload.ee/image/19756748/GIN-Photoroom.png',
        emoji: '🌿'
    },
    {
        id: 'prod_5',
        code: '05',
        nom: 'VALLEY RUM',
        type: 'Rhum Ambré',
        prix: 165,
        desc: 'Rhum de caractère aux notes profondes de vanille bourbon, de caramel chaud et de fruits mûrs.',
        image: 'https://www.upload.ee/image/19756811/rum-Photoroom.png',
        emoji: '🥥'
    },
    {
        id: 'prod_6',
        code: '06',
        nom: 'KHATCH BLANCO',
        type: 'Tequila Premium',
        prix: 190,
        desc: 'Tequila blanco pure, au profil minimaliste, vif et parfaitement équilibré.',
        image: 'https://www.upload.ee/image/19756751/tequila-Photoroom.png',
        emoji: '🌵'
    },
    {
        id: 'prod_7',
        code: '07',
        nom: 'KHATCH ARMENIAN BRANDY',
        type: 'Brandy d’Exception',
        prix: 240,
        desc: 'Brandy de raisin vieilli, hommage vibrant au savoir-faire et à la tradition arménienne.',
        image: 'https://www.upload.ee/image/19756754/brandy-Photoroom.png',
        emoji: '🥃'
    },
    {
        id: 'prod_8',
        code: '08',
        nom: 'TSIRAN',
        type: 'Liqueur d’Abricot',
        prix: 135,
        desc: 'Liqueur artisanale à l’abricot arménien, douce, fruitée et intensément parfumée.',
        image: 'https://www.upload.ee/image/19756755/liqueur-Photoroom.png',
        emoji: '🍑'
    }
];

// ============================================================
// SESSIONS UTILISATEURS
// ============================================================

const userSessions = new Map();

function getSession(userId) {
    if (!userSessions.has(userId)) {
        userSessions.set(userId, {
            items: {},
            selectedProduct: null
        });
    }
    return userSessions.get(userId);
}

// ============================================================
// PANNEAU PRINCIPAL (COMMANDES)
// ============================================================

function getCommandesEmbed() {
    return new EmbedBuilder()
        .setTitle('KHATCH & VALLEY • CATALOGUE OFFICIEL')
        .setDescription(
            '🏰 **DISTILLERIE ARMÉNIENNE — LOS ANGELES**\n\n' +
            'Bienvenue dans l’espace de commande officiel de *Khatch & Valley*. ' +
            'Découvrez notre collection exclusive de bières artisanales et de spiritueux haut de gamme.\n\n' +
            '__**COMMENT COMMANDER ?**__\n' +
            'Cliquez sur le bouton ci-dessous pour ouvrir votre **catalogue interactif privé**, parcourir les fiches descriptives, composer votre panier en toute liberté et valider votre devis en quelques clics.\n\n' +
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
        )
        .setColor(0x8B0000)
        .setImage('https://www.upload.ee/image/19756745/Whisky.png')
        .setFooter({ text: 'KHATCH & VALLEY • Excellence & Tradition • Los Angeles' })
        .setTimestamp();
}

function getCommandesComponents() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('catalog_open_session')
            .setLabel('✨ Ouvrir le catalogue interactif')
            .setStyle(ButtonStyle.Primary)
    );
}

// ============================================================
// VUE LISTE DU CATALOGUE (INTERACTIF)
// ============================================================

function buildCatalogListView(userId) {
    const session = getSession(userId);
    const selectedEntries = Object.entries(session.items).filter(([_, qty]) => qty > 0);

    let devisText = '';
    let totalPanier = 0;

    if (selectedEntries.length > 0) {
        devisText = '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📦 **VOTRE DEVIS EN COURS**\n';
        for (const [productId, quantity] of selectedEntries) {
            const product = CATALOGUE_PRODUITS.find(p => p.id === productId);
            if (!product) continue;
            const subtotal = product.prix * quantity;
            totalPanier += subtotal;
            devisText += `• ${product.emoji} **${product.nom}** × ${quantity} (*$${subtotal}*)\n`;
        }
        devisText += `\n💰 **Total estimé :** \`$${totalPanier}\``;
    }

    const embed = new EmbedBuilder()
        .setTitle('KHATCH & VALLEY • SÉLECTION DES SPIRITUEUX')
        .setDescription(
            'Parcourez notre gamme complète ci-dessous via le menu déroulant. ' +
            'Chaque sélection vous affichera la fiche détaillée, les notes de dégustation et le visuel de la bouteille.\n\n' +
            '📋 **Nos Références :**\n' +
            CATALOGUE_PRODUITS.map(p => `${p.emoji} **${p.nom}** — *${p.type}* (\`$${p.prix}\`)`).join('\n') +
            devisText
        )
        .setColor(0x8B0000)
        .setFooter({ text: 'Sélectionnez un produit dans le menu pour afficher sa fiche détaillée.' });

    const productOptions = CATALOGUE_PRODUITS.map(product => {
        const quantity = session.items[product.id] || 0;
        return {
            label: product.nom,
            value: product.id,
            emoji: product.emoji,
            description: quantity > 0 ? `[${quantity} dans le devis] — $${product.prix}` : `Prix unitaire : $${product.prix}`
        };
    });

    const productMenu = new StringSelectMenuBuilder()
        .setCustomId('catalog_select_product')
        .setPlaceholder('🔍 Sélectionner un produit à consulter...')
        .addOptions(productOptions);

    const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('cat_view_cart')
            .setLabel('🛒 Consulter mon devis')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('cart_validate')
            .setLabel('✅ Valider la commande')
            .setStyle(ButtonStyle.Success)
    );

    return {
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(productMenu), actionRow]
    };
}

// ============================================================
// FICHE PRODUIT DÉTAILLÉE
// ============================================================

function buildProductView(userId, productId) {
    const session = getSession(userId);
    const product = CATALOGUE_PRODUITS.find(p => p.id === productId);

    if (!product) return buildCatalogListView(userId);

    session.selectedProduct = productId;
    const quantity = session.items[product.id] || 0;

    const productEmbed = new EmbedBuilder()
        .setTitle(`${product.emoji} ${product.nom}`)
        .setDescription(
            `### 🏷️ Catégorie : ${product.type}\n\n` +
            `📜 **Notes & Description :**\n${product.desc}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `💵 **Prix unitaire :** \`$${product.prix}\`\n` +
            `📊 **Quantité actuelle dans votre devis :** \`${quantity}\`\n\n` +
            (quantity > 0 ? `✅ *Vous avez actuellement ${quantity} unité(s) de ce produit dans votre panier.*` : `*Aucune quantité sélectionnée pour l'instant.*`)
        )
        .setColor(0x8B0000)
        .setImage(product.image)
        .setFooter({ text: `KHATCH & VALLEY • Référence Produit [Réf. ${product.code}]` });

    const productOptions = CATALOGUE_PRODUITS.map(p => {
        const currentQty = session.items[p.id] || 0;
        return {
            label: p.nom,
            value: p.id,
            emoji: p.emoji,
            default: p.id === product.id,
            description: currentQty > 0 ? `[${currentQty} dans devis] — $${p.prix}` : `$${p.prix} / unité`
        };
    });

    const productMenu = new StringSelectMenuBuilder()
        .setCustomId('catalog_select_product')
        .setPlaceholder('🔄 Changer de produit rapidement...')
        .addOptions(productOptions);

    const actionRow1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`catalog_set_quantity_${product.id}`)
            .setLabel(quantity > 0 ? '✏️ Modifier la quantité' : '➕ Ajouter au devis')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId(`catalog_remove_product_${product.id}`)
            .setLabel('🗑️ Retirer du devis')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('cat_back_catalog')
            .setLabel('⬅️ Retour au catalogue')
            .setStyle(ButtonStyle.Secondary)
    );

    return {
        embeds: [productEmbed],
        components: [new ActionRowBuilder().addComponents(productMenu), actionRow1]
    };
}

// ============================================================
// VUE DU PANIER / DEVIS
// ============================================================

function buildCartView(userId) {
    const session = getSession(userId);
    const entries = Object.entries(session.items).filter(([_, qty]) => qty > 0);

    let total = 0;
    let descriptionText = '';

    if (entries.length === 0) {
        descriptionText = '🛒 **Votre devis est actuellement vide.**\n\nRetournez au catalogue pour sélectionner vos articles et composer votre commande.';
    } else {
        descriptionText = '📋 **RÉCAPITULATIF DÉTAILLÉ DE VOTRE COMMANDE**\n\n';
        for (const [productId, quantity] of entries) {
            const product = CATALOGUE_PRODUITS.find(p => p.id === productId);
            if (!product) continue;
            const subtotal = product.prix * quantity;
            total += subtotal;
            descriptionText += `${product.emoji} **${product.nom}**\n↳ \`${quantity}\` unité(s) × $${product.prix} = **$${subtotal}**\n\n`;
        }
        descriptionText += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' + `### 💰 MONTANT TOTAL DU DEVIS : **$${total} USD**`;
    }

    const embed = new EmbedBuilder()
        .setTitle('KHATCH & VALLEY • VOTRE PANIER & DEVIS')
        .setDescription(descriptionText)
        .setColor(0x8B0000)
        .setFooter({ text: 'KHATCH & VALLEY • Validation et transmission au service commercial' });

    const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('cat_back_catalog')
            .setLabel('⬅️ Retour au catalogue')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('cart_validate')
            .setLabel('✅ Valider et soumettre le devis')
            .setStyle(ButtonStyle.Success)
    );

    return {
        embeds: [embed],
        components: [actionRow]
    };
}

// ============================================================
// RECRUTEMENT & SERVICES
// ============================================================

function getRecrutementEmbed() {
    return new EmbedBuilder()
        .setTitle('KHATCH & VALLEY • RECRUTEMENT')
        .setDescription(
            'Rejoignez les équipes de la distillerie **KHATCH & VALLEY** à Los Angeles.\n\n' +
            'Nous recherchons des profils rigoureux, motivés et investis pour participer à notre développement.\n\n' +
            '📌 *Sélectionnez le poste souhaité via le menu ci-dessous.*'
        )
        .setColor(0x8B0000)
        .setFooter({ text: 'KHATCH & VALLEY • Ressources Humaines' })
        .setTimestamp();
}

function getRecrutementComponents() {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('menu_ticket_postop_recrutement')
            .setPlaceholder('👔 Sélectionner un poste à pourvoir...')
            .addOptions([
                { label: 'Maître Distillateur / Assistant', value: 'rec_distillateur', description: 'Fabrication, distillation et gestion des fûts' },
                { label: 'Chauffeur / Livreur Terrain', value: 'rec_chauffeur', description: 'Transport et acheminement des cargaisons' },
                { label: 'Agent de Sécurité & Escorte', value: 'rec_securite', description: 'Protection des convois et sécurisation des sites' }
            ])
    );
}

function getServiceEmbed() {
    return new EmbedBuilder()
        .setTitle('KHATCH & VALLEY • SUPPORT & SERVICES')
        .setDescription(
            'Un renseignement, une question ou une proposition de partenariat commercial ?\n\n' +
            'Ouvrez un dossier auprès de notre permanence pour être mis en relation avec la direction.'
        )
        .setColor(0x8B0000)
        .setFooter({ text: 'KHATCH & VALLEY • Support & Relations Partenaires' })
        .setTimestamp();
}

function getServiceComponents() {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('menu_ticket_postop_service')
            .setPlaceholder('🤝 Sélectionner un type de demande...')
            .addOptions([
                { label: 'Assistance & Support Client', value: 'srv_support', description: 'Questions sur une commande ou un suivi' },
                { label: 'Partenariat / Autre Demande', value: 'srv_autre', description: 'Propositions de collaboration ou contrats pros' }
            ])
    );
}

// ============================================================
// INITIALISATION DES PANNEAUX (AVEC MISE À JOUR SANS DOUBLON)
// ============================================================

async function initPostOpPanels(guild) {
    const client = guild.client;

    if (!client._postopListenerRegistered) {
        client._postopListenerRegistered = true;
        client.on('interactionCreate', async interaction => {
            try {
                await handlePostOpInteraction(interaction);
            } catch (err) {
                console.error('[KHATCH & VALLEY] Erreur interaction :', err);
                try {
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ content: 'Une erreur est survenue.', flags: [MessageFlags.Ephemeral] });
                    }
                } catch (_) {}
            }
        });
    }

    await guild.channels.fetch();

    const cmdChan = guild.channels.cache.get(CONFIG_POSTOP.channels.commandes);
    const recChan = guild.channels.cache.get(CONFIG_POSTOP.channels.recrutement);
    const srvChan = guild.channels.cache.get(CONFIG_POSTOP.channels.service);

    // Commandes
    if (cmdChan) {
        try {
            const msgs = await cmdChan.messages.fetch({ limit: 10 });
            const botMsg = msgs.find(m => m.author.id === client.user.id && m.embeds[0]?.title?.includes('CATALOGUE OFFICIEL'));
            if (!botMsg) {
                await cmdChan.send({ embeds: [getCommandesEmbed()], components: [getCommandesComponents()] });
            } else {
                await botMsg.edit({ embeds: [getCommandesEmbed()], components: [getCommandesComponents()] });
            }
        } catch (err) {
            console.error('[KHATCH & VALLEY] Erreur salon commandes :', err);
        }
    }

    // Recrutement
    if (recChan) {
        try {
            const msgs = await recChan.messages.fetch({ limit: 10 });
            const botMsg = msgs.find(m => m.author.id === client.user.id && m.embeds[0]?.title?.includes('RECRUTEMENT'));
            if (!botMsg) {
                await recChan.send({ embeds: [getRecrutementEmbed()], components: [getRecrutementComponents()] });
            } else {
                await botMsg.edit({ embeds: [getRecrutementEmbed()], components: [getRecrutementComponents()] });
            }
        } catch (err) {
            console.error('[KHATCH & VALLEY] Erreur salon recrutement :', err);
        }
    }

    // Services
    if (srvChan) {
        try {
            const msgs = await srvChan.messages.fetch({ limit: 10 });
            const botMsg = msgs.find(m => m.author.id === client.user.id && m.embeds[0]?.title?.includes('SUPPORT & SERVICES'));
            if (!botMsg) {
                await srvChan.send({ embeds: [getServiceEmbed()], components: [getServiceComponents()] });
            } else {
                await botMsg.edit({ embeds: [getServiceEmbed()], components: [getServiceComponents()] });
            }
        } catch (err) {
            console.error('[KHATCH & VALLEY] Erreur salon services :', err);
        }
    }
}

// ============================================================
// ROUTEUR DES INTERACTIONS
// ============================================================

async function handlePostOpInteraction(interaction) {
    const id = interaction.customId;
    if (!id) return;

    const isPostOpAction =
        id === 'catalog_open_session' ||
        id === 'catalog_select_product' ||
        id === 'cat_view_cart' ||
        id === 'cat_back_catalog' ||
        id === 'cart_validate' ||
        id.startsWith('catalog_set_quantity_') ||
        id.startsWith('catalog_remove_product_') ||
        id === 'menu_ticket_postop_recrutement' ||
        id === 'menu_ticket_postop_service' ||
        id.startsWith('mod_postop_') ||
        id.startsWith('mod_catalog_') ||
        id.startsWith('menu_staff_postop_');

    if (!isPostOpAction) return;
    if (interaction.handledByPostOp) return;
    interaction.handledByPostOp = true;

    const userId = interaction.user.id;
    const session = getSession(userId);

    if (id === 'catalog_open_session') {
        session.selectedProduct = null;
        return await interaction.reply({ ...buildCatalogListView(userId), flags: [MessageFlags.Ephemeral] });
    }

    if (id === 'catalog_select_product' && interaction.isStringSelectMenu()) {
        const productId = interaction.values[0];
        const product = CATALOGUE_PRODUITS.find(p => p.id === productId);
        if (!product) return await interaction.reply({ content: 'Produit introuvable.', flags: [MessageFlags.Ephemeral] });
        session.selectedProduct = productId;
        return await interaction.update(buildProductView(userId, productId));
    }

    if (id.startsWith('catalog_set_quantity_')) {
        const productId = id.replace('catalog_set_quantity_', '');
        const product = CATALOGUE_PRODUITS.find(p => p.id === productId);
        if (!product) return await interaction.reply({ content: 'Produit introuvable.', flags: [MessageFlags.Ephemeral] });

        const currentQuantity = session.items[product.id] || 0;
        const modal = new ModalBuilder()
            .setCustomId(`mod_catalog_quantity_${product.id}`)
            .setTitle(`Quantité • ${product.nom}`.substring(0, 45));

        const quantityInput = new TextInputBuilder()
            .setCustomId('quantity')
            .setLabel('Nombre d’unités souhaitées')
            .setPlaceholder('Exemple : 10')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setValue(currentQuantity > 0 ? String(currentQuantity) : '1');

        modal.addComponents(new ActionRowBuilder().addComponents(quantityInput));
        return await interaction.showModal(modal);
    }

    if (id.startsWith('catalog_remove_product_')) {
        const productId = id.replace('catalog_remove_product_', '');
        delete session.items[productId];
        session.selectedProduct = productId;
        return await interaction.update(buildProductView(userId, productId));
    }

    if (id === 'cat_view_cart') {
        return await interaction.update(buildCartView(userId));
    }

    if (id === 'cat_back_catalog') {
        return await interaction.update(buildCatalogListView(userId));
    }

    if (id === 'cart_validate') {
        const entries = Object.entries(session.items).filter(([_, qty]) => qty > 0);
        if (entries.length === 0) {
            return await interaction.reply({ content: 'Votre devis est vide. Sélectionnez au moins un produit.', flags: [MessageFlags.Ephemeral] });
        }

        const modal = new ModalBuilder().setCustomId('mod_catalog_checkout').setTitle('Validation du devis');
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('prenom').setLabel('Prénom').setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nom').setLabel('Nom').setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('telephone').setLabel('Téléphone').setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('notes').setLabel('Établissement / Instructions particulières').setStyle(TextInputStyle.Paragraph).setRequired(false))
        );
        return await interaction.showModal(modal);
    }

    if (interaction.isStringSelectMenu()) {
        const val = interaction.values[0];

        if (id === 'menu_ticket_postop_recrutement' || id === 'menu_ticket_postop_service') {
            const isRecru = id === 'menu_ticket_postop_recrutement';
            const names = isRecru ? {
                rec_distillateur: 'Maître Distillateur',
                rec_chauffeur: 'Chauffeur / Livreur',
                rec_securite: 'Agent de Sécurité'
            } : {
                srv_support: 'Support Client',
                srv_autre: 'Partenariat'
            };

            const modal = new ModalBuilder()
                .setCustomId(isRecru ? `mod_postop_recrutement_${val}` : `mod_postop_service_${val}`)
                .setTitle(`Dossier • ${names[val] || 'Demande'}`.substring(0, 45));

            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('prenom').setLabel('Prénom').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nom').setLabel('Nom').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('telephone').setLabel('Téléphone').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('details').setLabel(isRecru ? 'Expériences & Motivations' : 'Objet de la demande').setStyle(TextInputStyle.Paragraph).setRequired(true))
            );
            return await interaction.showModal(modal);
        }

        if (id.startsWith('menu_staff_postop_')) {
            const member = interaction.member;
            const hasStaffRole = member.roles.cache.some(r => CONFIG_POSTOP.staffRoles.includes(r.id));
            if (!hasStaffRole) return await interaction.reply({ content: 'Accès restreint aux membres habilités.', flags: [MessageFlags.Ephemeral] });

            const ticketId = id.replace('menu_staff_postop_', '');
            const actionVal = interaction.values[0];
            const message = interaction.message;
            const oldEmbed = message.embeds[0];

            if (actionVal === 'claim') {
                const embed = EmbedBuilder.from(oldEmbed);
                embed.setDescription(oldEmbed.description.replace('*Statut : En attente d’instruction.*', `*Statut : Dossier pris en charge par **${member.user.tag}***`));
                await message.edit({ embeds: [embed], components: message.components });
                return await interaction.reply({ content: 'Dossier pris en charge avec succès.', flags: [MessageFlags.Ephemeral] });
            }

            if (actionVal === 'close') {
                await interaction.reply({ content: 'Clôture du dossier en cours...', flags: [MessageFlags.Ephemeral] });
                setTimeout(async () => {
                    try {
                        await interaction.channel.delete('Dossier clôturé.');
                    } catch (e) {}
                }, 4000);
                return;
            }
        }
    }

    if (interaction.isModalSubmit()) {
        const modId = interaction.customId;

        if (modId.startsWith('mod_catalog_quantity_')) {
            const productId = modId.replace('mod_catalog_quantity_', '');
            const product = CATALOGUE_PRODUITS.find(p => p.id === productId);
            const rawQty = interaction.fields.getTextInputValue('quantity').trim();
            const quantity = Number.parseInt(rawQty, 10);

            if (isNaN(quantity) || quantity < 0) {
                return await interaction.reply({ content: 'Quantité invalide.', flags: [MessageFlags.Ephemeral] });
            }

            if (quantity === 0) delete session.items[productId];
            else session.items[productId] = quantity;

            session.selectedProduct = productId;

            if (interaction.isFromMessage && interaction.isFromMessage()) {
                return await interaction.update(buildProductView(userId, productId));
            }
            return await interaction.reply({ content: `Quantité mise à jour : **${quantity}** pour **${product.nom}**.`, flags: [MessageFlags.Ephemeral] });
        }

        if (modId === 'mod_catalog_checkout' || modId.startsWith('mod_postop_recrutement_') || modId.startsWith('mod_postop_service_')) {
            const guild = interaction.guild;
            const user = interaction.user;
            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

            const prenom = interaction.fields.getTextInputValue('prenom');
            const nom = interaction.fields.getTextInputValue('nom');
            const telephone = interaction.fields.getTextInputValue('telephone');
            
            let recapItems = '';
            let total = 0;
            let champPrincipal = '';
            let typeLabel = 'commandes';

            if (modId === 'mod_catalog_checkout') {
                for (const [prodId, qty] of Object.entries(session.items)) {
                    const prod = CATALOGUE_PRODUITS.find(p => p.id === prodId);
                    if (prod && qty > 0) {
                        const sub = prod.prix * qty;
                        total += sub;
                        recapItems += `${prod.emoji} **${prod.nom}** ×${qty} — **$${sub}**\n`;
                    }
                }
                champPrincipal = interaction.fields.getTextInputValue('notes') || 'Aucune consigne particulière.';
                session.items = {};
            } else {
                typeLabel = modId.startsWith('mod_postop_recrutement_') ? 'recrutement' : 'support';
                champPrincipal = interaction.fields.getTextInputValue('details');
            }

            let dossierCategory = guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes('dossier en cours'));
            if (!dossierCategory) {
                dossierCategory = await guild.channels.create({ name: 'DOSSIER EN COURS', type: ChannelType.GuildCategory });
            }

            const overwrites = [
                { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                ...CONFIG_POSTOP.staffRoles.map(rId => ({ id: rId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }))
            ];

            const ticketChannel = await guild.channels.create({
                name: `${typeLabel.substring(0, 3)}-${user.username}`.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 90),
                type: ChannelType.GuildText,
                parent: dossierCategory.id,
                permissionOverwrites: overwrites
            });

            const embedTicket = new EmbedBuilder()
                .setTitle(`KHATCH & VALLEY • DOSSIER #${ticketChannel.name.toUpperCase()}`)
                .setDescription(
                    `🏢 **CLIENT / DEMANDEUR**\n` +
                    `• **Titulaire :** ${prenom} ${nom}\n` +
                    `• **Téléphone :** ${telephone}\n\n` +
                    (modId === 'mod_catalog_checkout' ? `📋 **PRODUITS COMMANDÉS**\n${recapItems}\n💰 **TOTAL : $${total}**\n\n📝 **Notes :** ${champPrincipal}\n\n` : `📄 **REQUÊTE**\n${champPrincipal}\n\n`) +
                    `📌 *Statut : En attente d’instruction.*`
                )
                .setColor(0x8B0000)
                .setTimestamp();

            const staffMenu = new StringSelectMenuBuilder()
                .setCustomId(`menu_staff_postop_${ticketChannel.id}`)
                .setPlaceholder('⚙️ Gestion administrative...')
                .addOptions([
                    { label: 'Prendre en charge', value: 'claim', description: 'Assumer la gestion du dossier' },
                    { label: 'Clôturer le dossier', value: 'close', description: 'Fermer et archiver le dossier' }
                ]);

            await ticketChannel.send({
                content: `<@${user.id}> ${CONFIG_POSTOP.staffRoles.map(r => `<@&${r}>`).join(' ')}`,
                embeds: [embedTicket],
                components: [new ActionRowBuilder().addComponents(staffMenu)]
            });

            return await interaction.editReply({ content: `Votre dossier officiel a été ouvert avec succès : <#${ticketChannel.id}>` });
        }
    }
}

module.exports = {
    initPostOpPanels,
    handlePostOpInteraction
};
