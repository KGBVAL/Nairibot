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
// CATALOGUE KHATCH & VALLEY (PREMIUM & LOS SANTOS)
// ============================================================

const CATALOGUE_PRODUITS = [
    {
        id: 'prod_1',
        code: '01',
        nom: 'KHATCH LAGER',
        type: 'Bière Blonde Premium',
        prix: 45,
        desc: 'Lager blonde d’une limpidité absolue, fraîche, sèche et ciselée. L’essence même de la détente sous le soleil de Los Santos.',
        image: 'https://www.upload.ee/image/19756742/biere.png',
        emoji: '🍺'
    },
    {
        id: 'prod_2',
        code: '02',
        nom: 'KHATCH VALLEY WHISKY',
        type: 'American Whisky',
        prix: 180,
        desc: 'Whisky d’exception vieilli en fûts de chêne arménien. Des notes boisées intenses, ambrées et d’une longueur en bouche mémorable.',
        image: 'https://www.upload.ee/image/19756745/Whisky.png',
        emoji: '🥃'
    },
    {
        id: 'prod_3',
        code: '03',
        nom: 'KHATCH VODKA',
        type: 'Vodka Ultra-Pure',
        prix: 120,
        desc: 'Vodka distillée avec un soin obsessionnel à partir de blé pur. Une pureté cristalline pour une texture d’une douceur absolue.',
        image: 'https://www.upload.ee/image/19756746/vodka.png',
        emoji: '🍸'
    },
    {
        id: 'prod_4',
        code: '04',
        nom: 'KHATCH BOTANICAL GIN',
        type: 'Gin Artisanal',
        prix: 150,
        desc: 'Alchimie parfaite entre genièvre traditionnel, abricot séché et herbes sauvages d’inspiration arménienne.',
        image: 'https://www.upload.ee/image/19756748/GIN-Photoroom.png',
        emoji: '🌿'
    },
    {
        id: 'prod_5',
        code: '05',
        nom: 'VALLEY RUM',
        type: 'Rhum Ambré',
        prix: 165,
        desc: 'Rhum ambré aux accents chaleureux de vanille bourbon, de canne dorée et de fruits confits.',
        image: 'https://www.upload.ee/image/19756811/rum-Photoroom.png',
        emoji: '🥥'
    },
    {
        id: 'prod_6',
        code: '06',
        nom: 'KHATCH BLANCO',
        type: 'Tequila Premium',
        prix: 190,
        desc: 'Tequila blanco pure, au profil minimaliste, incisif et parfaitement équilibré.',
        image: 'https://www.upload.ee/image/19756751/tequila-Photoroom.png',
        emoji: '🌵'
    },
    {
        id: 'prod_7',
        code: '07',
        nom: 'KHATCH ARMENIAN BRANDY',
        type: 'Brandy d’Exception',
        prix: 240,
        desc: 'Brandy de raisin vieilli selon la plus pure tradition séculaire. Une complexité aromatique incomparable.',
        image: 'https://www.upload.ee/image/19756754/brandy-Photoroom.png',
        emoji: '🥃'
    },
    {
        id: 'prod_8',
        code: '08',
        nom: 'TSIRAN',
        type: 'Liqueur d’Abricot',
        prix: 135,
        desc: 'Liqueur rare à l’abricot arménien. Notes suaves, veloutées et intensément fruitées.',
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
        .setTitle('◆ KHATCH & VALLEY • MAISON DE DISTILLATION ◆')
        .setDescription(
            '🌟 **DISTILLERIE ARMÉNIENNE • LOS SANTOS**\n\n' +
            'Bienvenue au cœur de notre établissement. *Khatch & Valley* redéfinit l’art de la distillation à Los Santos en fusionnant héritage ancestral et raffinement moderne.\n\n' +
            '✦ **EXPÉRÉNCE COMMERCIALE PRIVÉE**\n' +
            'Accédez à notre catalogue interactif sécurisé pour découvrir l’ensemble de nos cuvées, consulter les visuels officiels et composer votre devis sur-mesure.\n\n' +
            '────────────────────────────────────────'
        )
        .setColor(0x660000)
        .setImage('https://www.upload.ee/image/19756745/Whisky.png')
        .setFooter({ text: 'KHATCH & VALLEY • Excellence, Prestigieux & Exclusif • Los Santos' })
        .setTimestamp();
}

function getCommandesComponents() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('catalog_open_session')
            .setLabel('💎 Ouvrir le Catalogue des Spiritueux')
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
        devisText = '\n────────────────────────────────────────\n🛒 **RÉCAPITULATIF DE VOTRE PANIER ACTUEL**\n';
        for (const [productId, quantity] of selectedEntries) {
            const product = CATALOGUE_PRODUITS.find(p => p.id === productId);
            if (!product) continue;
            const subtotal = product.prix * quantity;
            totalPanier += subtotal;
            devisText += `• ${product.emoji} **${product.nom}** × ${quantity} — \`$${subtotal}\`\n`;
        }
        devisText += `\n💰 **Estimation Totale :** \`$${totalPanier} USD\``;
    }

    const embed = new EmbedBuilder()
        .setTitle('◆ CATALOGUE OFFICIEL DES CUVÉES ◆')
        .setDescription(
            'Sélectionnez une référence dans le menu déroulant ci-dessous pour inspecter sa fiche descriptive détaillée, ses notes aromatiques et son visuel exclusif.\n\n' +
            '**COLLECTION DISPONIBLE :**\n' +
            CATALOGUE_PRODUITS.map(p => `• ${p.emoji} **${p.nom}** — *${p.type}* (\`$${p.prix}\`)`).join('\n') +
            devisText
        )
        .setColor(0x660000)
        .setFooter({ text: 'Sélectionnez un produit ci-dessous pour afficher sa fiche interactive.' });

    const productOptions = CATALOGUE_PRODUITS.map(product => {
        const quantity = session.items[product.id] || 0;
        return {
            label: product.nom,
            value: product.id,
            emoji: product.emoji,
            description: quantity > 0 ? `[${quantity} dans votre devis] — $${product.prix}` : `Prix unitaire : $${product.prix}`
        };
    });

    const productMenu = new StringSelectMenuBuilder()
        .setCustomId('catalog_select_product')
        .setPlaceholder('🔍 Choisir une cuvée à inspecter...')
        .addOptions(productOptions);

    const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('cat_view_cart')
            .setLabel('📋 Consulter mon devis')
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
            `### ✦ Catégorie : ${product.type}\n\n` +
            `📜 **Notes de dégustation :**\n> *${product.desc}*\n\n` +
            `────────────────────────────────────────\n` +
            `💵 **Tarif unitaire :** \`$${product.prix} USD\`\n` +
            `📊 **Quantité dans votre devis :** \`${quantity}\`\n\n` +
            (quantity > 0 ? `✅ **Statut :** ${quantity} unité(s) actuellement réservée(s) dans votre panier.` : `🔹 *Aucune quantité attribuée pour le moment.*`)
        )
        .setColor(0x660000)
        .setImage(product.image)
        .setFooter({ text: `KHATCH & VALLEY • Collection Privée [Réf. ${product.code}] • Los Santos` });

    const productOptions = CATALOGUE_PRODUITS.map(p => {
        const currentQty = session.items[p.id] || 0;
        return {
            label: p.nom,
            value: p.id,
            emoji: p.emoji,
            default: p.id === product.id,
            description: currentQty > 0 ? `[${currentQty} dans le devis] — $${p.prix}` : `$${p.prix} / unité`
        };
    });

    const productMenu = new StringSelectMenuBuilder()
        .setCustomId('catalog_select_product')
        .setPlaceholder('🔄 Changer de référence instantanément...')
        .addOptions(productOptions);

    const actionRow1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`catalog_set_quantity_${product.id}`)
            .setLabel(quantity > 0 ? '✏️ Modifier la quantité' : '➕ Ajouter au devis')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId(`catalog_remove_product_${product.id}`)
            .setLabel('🗑️ Retirer')
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
        descriptionText = '🛒 **Votre devis est actuellement vide.**\n\nExplorez notre catalogue de spiritueux pour y ajouter vos premières bouteilles.';
    } else {
        descriptionText = '📋 **VOTRE SÉLECTION COMMERCIALE EN COURS**\n\n';
        for (const [productId, quantity] of entries) {
            const product = CATALOGUE_PRODUITS.find(p => p.id === productId);
            if (!product) continue;
            const subtotal = product.prix * quantity;
            total += subtotal;
            descriptionText += `${product.emoji} **${product.nom}**\n↳ \`${quantity}\` unité(s) × $${product.prix} = **$${subtotal} USD**\n\n`;
        }
        descriptionText += '────────────────────────────────────────\n' + `### 💎 MONTANT TOTAL GLOBAL : **$${total} USD**`;
    }

    const embed = new EmbedBuilder()
        .setTitle('◆ RÉCAPITULATIF DU DEVIS • KHATCH & VALLEY ◆')
        .setDescription(descriptionText)
        .setColor(0x660000)
        .setFooter({ text: 'KHATCH & VALLEY • Transmission sécurisée au département commercial' });

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
        .setTitle('◆ KHATCH & VALLEY • CARRIÈRES & RECRUTEMENT ◆')
        .setDescription(
            'Intégrez les rangs de la distillerie **KHATCH & VALLEY** à Los Santos[cite: 11].\n\n' +
            'Nous valorisons l’excellence, la discrétion et le savoir-faire professionnel. Choisissez votre voie ci-dessous.\n\n' +
            '📌 *Sélectionnez votre poste de prédilection via le menu interactif.*'
        )
        .setColor(0x660000)
        .setFooter({ text: 'KHATCH & VALLEY • Département des Ressources Humaines' })
        .setTimestamp();
}

function getRecrutementComponents() {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('menu_ticket_postop_recrutement')
            .setPlaceholder('👔 Sélectionner un poste à pourvoir...')
            .addOptions([
                { label: 'Maître Distillateur / Assistant', value: 'rec_distillateur', description: 'Conduite des cuves, distillation et assemblage' },
                { label: 'Chauffeur / Livreur Terrain', value: 'rec_chauffeur', description: 'Acheminement sécurisé des caisses et fret' },
                { label: 'Agent de Sécurité & Escorte', value: 'rec_securite', description: 'Protection rapprochée des convois et de la distillerie' }
            ])
    );
}

function getServiceEmbed() {
    return new EmbedBuilder()
        .setTitle('◆ KHATCH & VALLEY • SUPPORT & PARTENARIATS ◆')
        .setDescription(
            'Une question sur nos cuvées, un litige à régler ou une proposition d’alliance commerciale ?\n\n' +
            'Ouvrez un dossier auprès de notre secrétariat pour un traitement prioritaire par la direction.'
        )
        .setColor(0x660000)
        .setFooter({ text: 'KHATCH & VALLEY • Service Client & Relations Extérieures' })
        .setTimestamp();
}

function getServiceComponents() {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('menu_ticket_postop_service')
            .setPlaceholder('🤝 Sélectionner l’objet de votre requête...')
            .addOptions([
                { label: 'Assistance & Support Client', value: 'srv_support', description: 'Suivi de commande ou réclamation' },
                { label: 'Partenariat / Autre Demande', value: 'srv_autre', description: 'Propositions de collaboration ou contrats pros' }
            ])
    );
}

// ============================================================
// INITIALISATION DES PANNEAUX
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

    if (cmdChan) {
        try {
            const msgs = await cmdChan.messages.fetch({ limit: 10 });
            const botMsg = msgs.find(m => m.author.id === client.user.id && m.embeds[0]?.title?.includes('MAISON DE DISTILLATION'));
            if (!botMsg) {
                await cmdChan.send({ embeds: [getCommandesEmbed()], components: [getCommandesComponents()] });
            } else {
                await botMsg.edit({ embeds: [getCommandesEmbed()], components: [getCommandesComponents()] });
            }
        } catch (err) {
            console.error('[KHATCH & VALLEY] Erreur salon commandes :', err);
        }
    }

    if (recChan) {
        try {
            const msgs = await recChan.messages.fetch({ limit: 10 });
            const botMsg = msgs.find(m => m.author.id === client.user.id && m.embeds[0]?.title?.includes('CARRIÈRES'));
            if (!botMsg) {
                await recChan.send({ embeds: [getRecrutementEmbed()], components: [getRecrutementComponents()] });
            } else {
                await botMsg.edit({ embeds: [getRecrutementEmbed()], components: [getRecrutementComponents()] });
            }
        } catch (err) {
            console.error('[KHATCH & VALLEY] Erreur salon recrutement :', err);
        }
    }

    if (srvChan) {
        try {
            const msgs = await srvChan.messages.fetch({ limit: 10 });
            const botMsg = msgs.find(m => m.author.id === client.user.id && m.embeds[0]?.title?.includes('SUPPORT'));
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

        const modal = new ModalBuilder().setCustomId('mod_catalog_checkout').setTitle('Validation du Devis');
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

            const actionVal = interaction.values[0];
            const message = interaction.message;
            const oldEmbed = message.embeds[0];

            if (actionVal === 'claim') {
                const embed = EmbedBuilder.from(oldEmbed);
                embed.setDescription(oldEmbed.description.replace('📌 *Statut : En attente d’instruction.*', `📌 *Statut : Dossier pris en charge par **${member.user.tag}***`));
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
                        recapItems += `${prod.emoji} **${prod.nom}** ×${qty} — **$${sub} USD**\n`;
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
                .setTitle(`◆ DOSSIER OFFICIEL • #${ticketChannel.name.toUpperCase()} ◆`)
                .setDescription(
                    `👤 **TITULAIRE DU DOSSIER**\n` +
                    `• **Nom :** ${prenom} ${nom}\n` +
                    `• **Ligne directe :** ${telephone}\n\n` +
                    (modId === 'mod_catalog_checkout' ? `📋 **DÉTAILS DES PRODUITS COMMANDÉS**\n${recapItems}\n💎 **MONTANT TOTAL : $${total} USD**\n\n📝 **Instructions :** ${champPrincipal}\n\n` : `📄 **OBJET DE LA REQUÊTE**\n${champPrincipal}\n\n`) +
                    `📌 *Statut : En attente d’instruction.*`
                )
                .setColor(0x660000)
                .setTimestamp();

            const staffMenu = new StringSelectMenuBuilder()
                .setCustomId(`menu_staff_postop_${ticketChannel.id}`)
                .setPlaceholder('⚙️ Gestion administrative du dossier...')
                .addOptions([
                    { label: 'Prendre en charge', value: 'claim', description: 'Assumer la gestion opérationnelle' },
                    { label: 'Clôturer le dossier', value: 'close', description: 'Fermer et archiver la procédure' }
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
