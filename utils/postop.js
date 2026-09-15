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

const CONFIG_POSTOP = {
    staffRoles: [
        '1539267928762097770',
        '1539400476536217690'
    ],

    channels: {
        commandes: '1547194706671308860',
        recrutement: '1547194709049479178',
        service: '1547194707799703563'
    }
};

// ============================================================
// KHATCH & VALLEY — CATALOGUE OFFICIEL
// ============================================================

const CATALOGUE_PRODUITS = [
    {
        id: 'prod_1',
        code: '01',
        nom: 'KHATCH LAGER',
        type: 'Bière',
        prix: 45,
        desc: 'Lager blonde légère, sèche et très clean.',
        image: 'https://www.upload.ee/image/19756742/biere.png'
    },

    {
        id: 'prod_2',
        code: '02',
        nom: 'KHATCH VALLEY WHISKY',
        type: 'Whisky',
        prix: 180,
        desc: 'American whiskey avec maturation en fûts de chêne arménien.',
        image: 'https://www.upload.ee/image/19756745/Whisky.png'
    },

    {
        id: 'prod_3',
        code: '03',
        nom: 'KHATCH VODKA',
        type: 'Vodka',
        prix: 120,
        desc: 'Vodka ultra-pure à base de blé, finition très douce.',
        image: 'https://www.upload.ee/image/19756746/vodka.png'
    },

    {
        id: 'prod_4',
        code: '04',
        nom: 'KHATCH BOTANICAL GIN',
        type: 'Gin',
        prix: 150,
        desc: 'Gin aux botaniques arméniennes : genièvre, abricot sec, coriandre et herbes sauvages.',
        image: 'https://www.upload.ee/image/19756748/GIN-Photoroom.png'
    },

    {
        id: 'prod_5',
        code: '05',
        nom: 'VALLEY RUM',
        type: 'Rhum',
        prix: 165,
        desc: 'Rhum ambré, pensé autour de notes vanillées et fruitées.',
        image: 'https://www.upload.ee/image/19756750/rum.jpg'
    },

    {
        id: 'prod_6',
        code: '06',
        nom: 'KHATCH BLANCO',
        type: 'Tequila',
        prix: 190,
        desc: 'Tequila blanco premium, identité très minimaliste.',
        image: 'https://www.upload.ee/image/19756751/tequila-Photoroom.png'
    },

    {
        id: 'prod_7',
        code: '07',
        nom: 'KHATCH ARMENIAN BRANDY',
        type: 'Brandy',
        prix: 240,
        desc: 'Brandy de raisin, inspiré de la tradition arménienne.',
        image: 'https://www.upload.ee/image/19756754/brandy-Photoroom.png'
    },

    {
        id: 'prod_8',
        code: '08',
        nom: 'TSIRAN',
        type: 'Liqueur',
        prix: 135,
        desc: 'Liqueur d’abricot arménien.',
        image: 'https://www.upload.ee/image/19756755/liqueur-Photoroom.png'
    }
];

// ============================================================
// SESSIONS UTILISATEURS
// ============================================================

const userSessions = new Map();

function getSession(userId) {
    if (!userSessions.has(userId)) {
        userSessions.set(userId, {
            items: {}
        });
    }

    return userSessions.get(userId);
}

// ============================================================
// PANNEAU COMMANDES PUBLIC
// ============================================================

function getCommandesEmbed() {
    return new EmbedBuilder()
        .setTitle('KHATCH & VALLEY')
        .setDescription(
            '**DISTILLERIE ARMÉNIENNE — LOS ANGELES**\n\n' +

            'Découvrez notre sélection officielle de bières et spiritueux.\n' +
            'Sélectionnez simplement un produit dans la liste ci-dessous pour l’ajouter à votre devis.\n\n' +

            '**CATALOGUE**\n' +
            '🍺 **KHATCH LAGER** — Bière\n' +
            '🥃 **KHATCH VALLEY WHISKY** — Whisky\n' +
            '🍸 **KHATCH VODKA** — Vodka\n' +
            '🌿 **KHATCH BOTANICAL GIN** — Gin\n' +
            '🥥 **VALLEY RUM** — Rhum\n' +
            '🌵 **KHATCH BLANCO** — Tequila\n' +
            '🥃 **KHATCH ARMENIAN BRANDY** — Brandy\n' +
            '🍑 **TSIRAN** — Liqueur\n\n' +

            '━━━━━━━━━━━━━━━━━━━━━━\n\n' +

            '**COMMANDE**\n' +
            'Ouvrez votre catalogue privé pour sélectionner vos produits, définir les quantités et consulter votre devis.\n\n' +

            '*KHATCH & VALLEY • Distillerie arménienne • Los Angeles*'
        )
        .setColor(0x8B0000)
        .setFooter({
            text: 'KHATCH & VALLEY • Distillerie arménienne • Los Angeles'
        })
        .setTimestamp();
}

function getCommandesComponents() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('catalog_open_session')
            .setLabel('Ouvrir le catalogue')
            .setStyle(ButtonStyle.Primary)
    );
}

// ============================================================
// CATALOGUE PRIVÉ — AVEC LES 8 IMAGES
// ============================================================

function buildCatalogView(userId) {
    const session = getSession(userId);

    const embeds = [];

    // --------------------------------------------------------
    // EMBED PRINCIPAL
    // --------------------------------------------------------

    const headerEmbed = new EmbedBuilder()
        .setTitle('KHATCH & VALLEY')
        .setDescription(
            '**DISTILLERIE ARMÉNIENNE — LOS ANGELES**\n\n' +

            'Découvrez notre sélection officielle.\n' +
            'Chaque référence ci-dessous possède son visuel officiel.\n\n' +

            '**COMMENT COMMANDER**\n' +
            '1. Sélectionnez un produit dans le menu.\n' +
            '2. Indiquez la quantité souhaitée.\n' +
            '3. Consultez votre devis.\n' +
            '4. Validez votre demande.\n\n' +

            '━━━━━━━━━━━━━━━━━━━━━━\n\n' +

            '**CATALOGUE — 8 RÉFÉRENCES**'
        )
        .setColor(0x8B0000);

    embeds.push(headerEmbed);

    // --------------------------------------------------------
    // 1 EMBED = 1 PRODUIT = 1 IMAGE
    // --------------------------------------------------------

    for (const product of CATALOGUE_PRODUITS) {
        const quantity = session.items[product.id] || 0;

        const productEmbed = new EmbedBuilder()
            .setTitle(`${product.code} — ${product.nom}`)
            .setDescription(
                `**${product.type}**\n\n` +
                `${product.desc}\n\n` +
                `**Prix unitaire :** $${product.prix}\n` +
                `**Dans votre devis :** ${quantity} unité${quantity > 1 ? 's' : ''}`
            )
            .setColor(0x8B0000)

            // IMPORTANT :
            // Chaque produit possède son propre setImage()
            // avec son URL exacte.
            .setImage(product.image)
            .setFooter({
                text: `KHATCH & VALLEY • Référence ${product.code}`
            });

        embeds.push(productEmbed);
    }

    // --------------------------------------------------------
    // MENU PRODUITS
    // --------------------------------------------------------

    const productOptions = CATALOGUE_PRODUITS.map(product => {
        const quantity = session.items[product.id] || 0;

        return {
            label: product.nom,
            value: product.id,
            description: `$${product.prix} / unité • ${quantity} dans le devis`,
            emoji: getProductEmoji(product.id)
        };
    });

    const productMenu = new StringSelectMenuBuilder()
        .setCustomId('catalog_select_product')
        .setPlaceholder('Sélectionner un produit à ajouter...')
        .addOptions(productOptions);

    const productRow = new ActionRowBuilder()
        .addComponents(productMenu);

    // --------------------------------------------------------
    // ACTIONS DEVIS
    // --------------------------------------------------------

    const actionRow = new ActionRowBuilder().addComponents(

        new ButtonBuilder()
            .setCustomId('cat_view_cart')
            .setLabel('Consulter mon devis')
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId('cart_validate')
            .setLabel('Valider le devis')
            .setStyle(ButtonStyle.Success)
    );

    return {
        embeds,
        components: [
            productRow,
            actionRow
        ]
    };
}

// ============================================================
// EMOJIS PRODUITS
// ============================================================

function getProductEmoji(productId) {
    const emojis = {
        prod_1: '🍺',
        prod_2: '🥃',
        prod_3: '🍸',
        prod_4: '🌿',
        prod_5: '🥥',
        prod_6: '🌵',
        prod_7: '🥃',
        prod_8: '🍑'
    };

    return emojis[productId] || '📦';
}

// ============================================================
// DEVIS
// ============================================================

function buildCartView(userId) {
    const session = getSession(userId);
    const entries = Object.entries(session.items);

    let total = 0;

    let descriptionText = '';

    if (entries.length === 0) {

        descriptionText =
            '**Votre devis est actuellement vide.**\n\n' +
            'Sélectionnez un produit dans le catalogue pour commencer votre demande.';

    } else {

        descriptionText =
            '**RÉCAPITULATIF DE VOTRE DEMANDE**\n\n';

        for (const [prodId, qty] of entries) {

            const product = CATALOGUE_PRODUITS.find(
                p => p.id === prodId
            );

            if (!product || qty <= 0) continue;

            const subtotal = product.prix * qty;

            total += subtotal;

            descriptionText +=
                `${getProductEmoji(product.id)} ` +
                `**${product.nom}**\n` +
                `↳ ${qty} unité${qty > 1 ? 's' : ''} × $${product.prix} ` +
                `= **$${subtotal}**\n\n`;
        }

        descriptionText +=
            '━━━━━━━━━━━━━━━━━━━━━━\n\n' +
            `### TOTAL DU DEVIS : **$${total}**`;
    }

    const embed = new EmbedBuilder()
        .setTitle('KHATCH & VALLEY — MON DEVIS')
        .setDescription(descriptionText)
        .setColor(0x8B0000)
        .setFooter({
            text: 'KHATCH & VALLEY • Confirmation commerciale requise'
        });

    const row = new ActionRowBuilder().addComponents(

        new ButtonBuilder()
            .setCustomId('cat_back_catalog')
            .setLabel('Retour au catalogue')
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId('cart_validate')
            .setLabel('Valider le devis')
            .setStyle(ButtonStyle.Success)
    );

    return {
        embeds: [embed],
        components: [row]
    };
}

// ============================================================
// RECRUTEMENT
// ============================================================

function getRecrutementEmbed() {
    return new EmbedBuilder()
        .setTitle('KHATCH & VALLEY — RECRUTEMENT')
        .setDescription(
            'Intégrez les équipes de **KHATCH & VALLEY** et participez à nos opérations à Los Angeles.\n\n' +
            'Sélectionnez le poste correspondant à votre profil.'
        )
        .setColor(0x8B0000)
        .setFooter({
            text: 'KHATCH & VALLEY • Ressources Humaines'
        })
        .setTimestamp();
}

function getRecrutementComponents() {
    return new ActionRowBuilder().addComponents(

        new StringSelectMenuBuilder()
            .setCustomId('menu_ticket_postop_recrutement')
            .setPlaceholder('Sélectionner un poste à pourvoir...')
            .addOptions([

                {
                    label: 'Maître Distillateur / Assistant',
                    value: 'rec_distillateur',
                    description: 'Participer à la fabrication et à la mise en fût'
                },

                {
                    label: 'Chauffeur / Livreur Terrain',
                    value: 'rec_chauffeur',
                    description: 'Assurer les transports et le transit des cargaisons'
                },

                {
                    label: 'Agent de Sécurité & Escorte',
                    value: 'rec_securite',
                    description: 'Protéger les convois et sécuriser les périmètres'
                }
            ])
    );
}

// ============================================================
// SUPPORT & SERVICES
// ============================================================

function getServiceEmbed() {
    return new EmbedBuilder()
        .setTitle('KHATCH & VALLEY — SUPPORT & SERVICES')
        .setDescription(
            'Besoin d’assistance, de renseignements ou d’un service particulier ?\n\n' +
            'Ouvrez un dossier auprès de notre permanence.'
        )
        .setColor(0x8B0000)
        .setFooter({
            text: 'KHATCH & VALLEY • Support & Services'
        })
        .setTimestamp();
}

function getServiceComponents() {
    return new ActionRowBuilder().addComponents(

        new StringSelectMenuBuilder()
            .setCustomId('menu_ticket_postop_service')
            .setPlaceholder('Sélectionner un type de service...')
            .addOptions([

                {
                    label: 'Assistance & Support Client',
                    value: 'srv_support',
                    description: 'Poser une question ou régler un litige'
                },

                {
                    label: 'Partenariat / Autre Demande',
                    value: 'srv_autre',
                    description: 'Proposer une collaboration ou un contrat spécifique'
                }
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

                console.error(
                    '[KHATCH & VALLEY] Erreur interaction PostOp :',
                    err
                );
            }
        });
    }

    await guild.channels.fetch();

    const cmdChan =
        guild.channels.cache.get(
            CONFIG_POSTOP.channels.commandes
        );

    const recChan =
        guild.channels.cache.get(
            CONFIG_POSTOP.channels.recrutement
        );

    const srvChan =
        guild.channels.cache.get(
            CONFIG_POSTOP.channels.service
        );

    // --------------------------------------------------------
    // COMMANDES
    // --------------------------------------------------------

    if (cmdChan) {

        try {

            const msgs = await cmdChan.messages.fetch({
                limit: 10
            });

            const botMsg = msgs.find(
                m =>
                    m.author.id === client.user.id &&
                    m.embeds[0]?.title?.includes('KHATCH & VALLEY')
            );

            if (!botMsg) {

                await cmdChan.send({
                    embeds: [getCommandesEmbed()],
                    components: [getCommandesComponents()]
                });

            } else {

                await botMsg.edit({
                    embeds: [getCommandesEmbed()],
                    components: [getCommandesComponents()]
                });
            }

        } catch (e) {

            console.error(
                '[KHATCH & VALLEY] Erreur salon Commandes :',
                e
            );
        }
    }

    // --------------------------------------------------------
    // RECRUTEMENT
    // --------------------------------------------------------

    if (recChan) {

        try {

            const msgs = await recChan.messages.fetch({
                limit: 10
            });

            const botMsg = msgs.find(
                m =>
                    m.author.id === client.user.id &&
                    m.embeds[0]?.title?.includes('RECRUTEMENT')
            );

            if (!botMsg) {

                await recChan.send({
                    embeds: [getRecrutementEmbed()],
                    components: [getRecrutementComponents()]
                });

            } else {

                await botMsg.edit({
                    embeds: [getRecrutementEmbed()],
                    components: [getRecrutementComponents()]
                });
            }

        } catch (e) {

            console.error(
                '[KHATCH & VALLEY] Erreur salon Recrutement :',
                e
            );
        }
    }

    // --------------------------------------------------------
    // SERVICE
    // --------------------------------------------------------

    if (srvChan) {

        try {

            const msgs = await srvChan.messages.fetch({
                limit: 10
            });

            const botMsg = msgs.find(
                m =>
                    m.author.id === client.user.id &&
                    m.embeds[0]?.title?.includes('SUPPORT & SERVICES')
            );

            if (!botMsg) {

                await srvChan.send({
                    embeds: [getServiceEmbed()],
                    components: [getServiceComponents()]
                });

            } else {

                await botMsg.edit({
                    embeds: [getServiceEmbed()],
                    components: [getServiceComponents()]
                });
            }

        } catch (e) {

            console.error(
                '[KHATCH & VALLEY] Erreur salon Service :',
                e
            );
        }
    }
}

// ============================================================
// GESTIONNAIRE D'INTERACTIONS
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

    // ========================================================
    // OUVERTURE CATALOGUE
    // ========================================================

    if (id === 'catalog_open_session') {

        return await interaction.reply({
            ...buildCatalogView(userId),
            flags: [MessageFlags.Ephemeral]
        });
    }

    // ========================================================
    // SÉLECTION D'UN PRODUIT
    // ========================================================

    if (
        id === 'catalog_select_product' &&
        interaction.isStringSelectMenu()
    ) {

        const productId = interaction.values[0];

        const product = CATALOGUE_PRODUITS.find(
            p => p.id === productId
        );

        if (!product) {

            return await interaction.reply({
                content: 'Produit introuvable.',
                flags: [MessageFlags.Ephemeral]
            });
        }

        const currentQuantity =
            session.items[product.id] || 0;

        const modal = new ModalBuilder()
            .setCustomId(`mod_catalog_quantity_${product.id}`)
            .setTitle(`${product.nom} — Quantité`);

        const quantityInput =
            new TextInputBuilder()
                .setCustomId('quantity')
                .setLabel('Quantité souhaitée')
                .setPlaceholder('Exemple : 10')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setValue(
                    currentQuantity > 0
                        ? String(currentQuantity)
                        : '1'
                );

        const row =
            new ActionRowBuilder()
                .addComponents(quantityInput);

        modal.addComponents(row);

        return await interaction.showModal(modal);
    }

    // ========================================================
    // CONSULTATION DU DEVIS
    // ========================================================

    if (id === 'cat_view_cart') {

        return await interaction.update(
            buildCartView(userId)
        );
    }

    // ========================================================
    // RETOUR AU CATALOGUE
    // ========================================================

    if (id === 'cat_back_catalog') {

        return await interaction.update(
            buildCatalogView(userId)
        );
    }

    // ========================================================
    // VALIDATION DU DEVIS
    // ========================================================

    if (id === 'cart_validate') {

        const entries =
            Object.entries(session.items)
                .filter(([_, qty]) => qty > 0);

        if (entries.length === 0) {

            return await interaction.reply({
                content:
                    'Votre devis est vide. Sélectionnez au moins un produit.',
                flags: [MessageFlags.Ephemeral]
            });
        }

        const modal = new ModalBuilder()
            .setCustomId('mod_catalog_checkout')
            .setTitle('Validation du devis');

        const prenomInput =
            new TextInputBuilder()
                .setCustomId('prenom')
                .setLabel('Prénom')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

        const nomInput =
            new TextInputBuilder()
                .setCustomId('nom')
                .setLabel('Nom')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

        const telephoneInput =
            new TextInputBuilder()
                .setCustomId('telephone')
                .setLabel('Téléphone')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

        const notesInput =
            new TextInputBuilder()
                .setCustomId('notes')
                .setLabel('Établissement / Instructions')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false);

        modal.addComponents(

            new ActionRowBuilder()
                .addComponents(prenomInput),

            new ActionRowBuilder()
                .addComponents(nomInput),

            new ActionRowBuilder()
                .addComponents(telephoneInput),

            new ActionRowBuilder()
                .addComponents(notesInput)
        );

        return await interaction.showModal(modal);
    }

    // ========================================================
    // MENUS RECRUTEMENT / SERVICE / STAFF
    // ========================================================

    if (interaction.isStringSelectMenu()) {

        const val = interaction.values[0];

        // ----------------------------------------------------
        // RECRUTEMENT
        // ----------------------------------------------------

        if (
            id === 'menu_ticket_postop_recrutement'
        ) {

            const postNames = {

                rec_distillateur:
                    'Maître Distillateur / Assistant',

                rec_chauffeur:
                    'Chauffeur / Livreur Terrain',

                rec_securite:
                    'Agent de Sécurité & Escorte'
            };

            const modal =
                new ModalBuilder()
                    .setCustomId(
                        `mod_postop_recrutement_${val}`
                    )
                    .setTitle(
                        `Candidature — ${
                            postNames[val] || 'Poste'
                        }`
                    );

            modal.addComponents(

                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('prenom')
                        .setLabel('Prénom')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                ),

                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('nom')
                        .setLabel('Nom')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                ),

                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('telephone')
                        .setLabel('Téléphone')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                ),

                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('motivations')
                        .setLabel('Expériences & Motivations')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                )
            );

            return await interaction.showModal(modal);
        }

        // ----------------------------------------------------
        // SERVICE
        // ----------------------------------------------------

        if (
            id === 'menu_ticket_postop_service'
        ) {

            const srvNames = {

                srv_support:
                    'Assistance & Support Client',

                srv_autre:
                    'Partenariat / Autre Demande'
            };

            const modal =
                new ModalBuilder()
                    .setCustomId(
                        `mod_postop_service_${val}`
                    )
                    .setTitle(
                        `Service — ${
                            srvNames[val] || 'Support'
                        }`
                    );

            modal.addComponents(

                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('prenom')
                        .setLabel('Prénom')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                ),

                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('nom')
                        .setLabel('Nom')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                ),

                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('telephone')
                        .setLabel('Téléphone')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                ),

                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('requete')
                        .setLabel('Objet de votre demande')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                )
            );

            return await interaction.showModal(modal);
        }

        // ----------------------------------------------------
        // ACTIONS STAFF
        // ----------------------------------------------------

        if (
            id.startsWith('menu_staff_postop_')
        ) {

            const member = interaction.member;

            const hasStaffRole =
                member.roles.cache.some(role =>
                    CONFIG_POSTOP.staffRoles.includes(role.id)
                );

            if (!hasStaffRole) {

                return await interaction.reply({
                    content:
                        'Accès restreint aux membres habilités.',
                    flags: [MessageFlags.Ephemeral]
                });
            }

            const ticketId =
                id.replace(
                    'menu_staff_postop_',
                    ''
                );

            const actionVal =
                interaction.values[0];

            const message =
                interaction.message;

            const oldEmbed =
                message.embeds[0];

            // ----------------------------------------------
            // CLAIM
            // ----------------------------------------------

            if (actionVal === 'claim') {

                if (
                    oldEmbed.description?.includes(
                        'Pris en charge par'
                    )
                ) {

                    return await interaction.reply({
                        content:
                            'Ce dossier a déjà été pris en charge.',
                        flags: [MessageFlags.Ephemeral]
                    });
                }

                const embed =
                    EmbedBuilder.from(oldEmbed);

                embed.setDescription(
                    oldEmbed.description.replace(
                        '*Statut : En attente d\'instruction.*',

                        `*Statut : Dossier pris en charge par **${member.user.tag}***`
                    )
                );

                await message.edit({
                    embeds: [embed],
                    components: message.components
                });

                return await interaction.reply({
                    content:
                        'Dossier assigné à votre profil avec succès.',
                    flags: [MessageFlags.Ephemeral]
                });
            }

            // ----------------------------------------------
            // MODIFY
            // ----------------------------------------------

            if (actionVal === 'modify') {

                const modal =
                    new ModalBuilder()
                        .setCustomId(
                            `mod_postop_edit_${ticketId}`
                        )
                        .setTitle(
                            'Mise à jour du dossier'
                        );

                modal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId(
                                'nouveau_contenu'
                            )
                            .setLabel(
                                'Informations complémentaires / Consignes'
                            )
                            .setStyle(
                                TextInputStyle.Paragraph
                            )
                            .setRequired(true)
                    )
                );

                return await interaction.showModal(
                    modal
                );
            }

            // ----------------------------------------------
            // CLOSE
            // ----------------------------------------------

            if (actionVal === 'close') {

                await interaction.reply({
                    content:
                        'Clôture administrative du dossier en cours...',
                    flags: [MessageFlags.Ephemeral]
                });

                setTimeout(async () => {

                    try {

                        const channel =
                            interaction.channel;

                        const closedCategory =
                            channel.guild.channels.cache.find(
                                c =>
                                    c.type === ChannelType.GuildCategory &&
                                    (
                                        c.name
                                            .toLowerCase()
                                            .includes('dossier traité') ||

                                        c.name
                                            .toLowerCase()
                                            .includes('archives')
                                    )
                            );

                        if (closedCategory) {

                            await channel.setParent(
                                closedCategory.id
                            );

                            await channel.permissionOverwrites.set([

                                {
                                    id: channel.guild.id,
                                    deny: [
                                        PermissionFlagsBits.ViewChannel
                                    ]
                                },

                                ...CONFIG_POSTOP.staffRoles.map(
                                    roleId => ({
                                        id: roleId,
                                        allow: [
                                            PermissionFlagsBits.ViewChannel,
                                            PermissionFlagsBits.ReadMessageHistory
                                        ]
                                    })
                                )
                            ]);

                            await channel.setName(
                                `archive-${channel.name}`
                                    .substring(0, 100)
                            );

                        } else {

                            await channel.delete(
                                'Dossier clôturé.'
                            );
                        }

                    } catch (err) {

                        console.error(
                            '[KHATCH & VALLEY] Erreur clôture :',
                            err
                        );
                    }

                }, 5000);

                return;
            }
        }
    }

    // ========================================================
    // MODALES
    // ========================================================

    if (interaction.isModalSubmit()) {

        const modId =
            interaction.customId;

        // ====================================================
        // QUANTITÉ PRODUIT
        // ====================================================

        if (
            modId.startsWith(
                'mod_catalog_quantity_'
            )
        ) {

            const productId =
                modId.replace(
                    'mod_catalog_quantity_',
                    ''
                );

            const product =
                CATALOGUE_PRODUITS.find(
                    p => p.id === productId
                );

            if (!product) {

                return await interaction.reply({
                    content:
                        'Produit introuvable.',
                    flags: [MessageFlags.Ephemeral]
                });
            }

            const rawQuantity =
                interaction.fields.getTextInputValue(
                    'quantity'
                );

            const quantity =
                Number.parseInt(
                    rawQuantity,
                    10
                );

            if (
                !Number.isInteger(quantity) ||
                quantity < 0
            ) {

                return await interaction.reply({
                    content:
                        'Veuillez indiquer une quantité entière supérieure ou égale à 0.',
                    flags: [MessageFlags.Ephemeral]
                });
            }

            // 0 = suppression du produit
            if (quantity === 0) {

                delete session.items[
                    product.id
                ];

                return await interaction.reply({
                    content:
                        `**${product.nom}** a été retiré de votre devis.`,
                    flags: [MessageFlags.Ephemeral]
                });
            }

            session.items[
                product.id
            ] = quantity;

            return await interaction.reply({
                content:
                    `**${product.nom}** → **${quantity} unité${quantity > 1 ? 's' : ''}** ajoutée${quantity > 1 ? 's' : ''} à votre devis.`,
                flags: [MessageFlags.Ephemeral]
            });
        }

        // ====================================================
        // MODIFICATION STAFF
        // ====================================================

        if (
            modId.startsWith(
                'mod_postop_edit_'
            )
        ) {

            const ticketId =
                modId.replace(
                    'mod_postop_edit_',
                    ''
                );

            const nouveauContenu =
                interaction.fields.getTextInputValue(
                    'nouveau_contenu'
                );

            const channel =
                interaction.guild.channels.cache.get(
                    ticketId
                );

            if (channel) {

                try {

                    const fetchedMsg =
                        await channel.messages.fetch({
                            limit: 10
                        });

                    const targetMsg =
                        fetchedMsg.find(
                            m =>
                                m.embeds.length > 0 &&
                                m.embeds[0].title
                                    ?.includes('DOSSIER')
                        );

                    if (targetMsg) {

                        const oldEmbed =
                            targetMsg.embeds[0];

                        const embed =
                            EmbedBuilder.from(
                                oldEmbed
                            );

                        let desc =
                            oldEmbed.description || '';

                        desc =
                            desc.replace(
                                /(📄 \*\*DÉTAILS DE LA REQUÊTE\*\*|📋 \*\*DETAILS DE LA COMMANDE\*\*)\n[\s\S]*?(?=\n\n🏢|$)/,

                                `$1\n${nouveauContenu}\n`
                            );

                        embed.setDescription(
                            desc
                        );

                        await targetMsg.edit({
                            embeds: [embed]
                        });
                    }

                } catch (err) {

                    console.error(
                        '[KHATCH & VALLEY] Erreur MAJ message :',
                        err
                    );
                }
            }

            return await interaction.reply({
                content:
                    'Les éléments du dossier ont été actualisés avec succès.',
                flags: [MessageFlags.Ephemeral]
            });
        }

        // ====================================================
        // CHECKOUT CATALOGUE / RECRUTEMENT / SERVICE
        // ====================================================

        if (
            modId === 'mod_catalog_checkout' ||
            modId.startsWith(
                'mod_postop_recrutement_'
            ) ||
            modId.startsWith(
                'mod_postop_service_'
            )
        ) {

            const guild =
                interaction.guild;

            const user =
                interaction.user;

            await interaction.deferReply({
                flags: [MessageFlags.Ephemeral]
            });

            let typeLabel = '';
            let subType = '';
            let recapItems = '';
            let total = 0;
            let champPrincipal = '';

            const prenom =
                interaction.fields.getTextInputValue(
                    'prenom'
                );

            const nom =
                interaction.fields.getTextInputValue(
                    'nom'
                );

            const telephone =
                interaction.fields.getTextInputValue(
                    'telephone'
                );

            // =================================================
            // COMMANDE
            // =================================================

            if (
                modId === 'mod_catalog_checkout'
            ) {

                typeLabel = 'commandes';
                subType = 'Catalogue KHATCH & VALLEY';

                const entries =
                    Object.entries(session.items);

                for (
                    const [prodId, qty]
                    of entries
                ) {

                    const product =
                        CATALOGUE_PRODUITS.find(
                            p => p.id === prodId
                        );

                    if (
                        product &&
                        qty > 0
                    ) {

                        const subtotal =
                            product.prix * qty;

                        total += subtotal;

                        recapItems +=
                            `${getProductEmoji(product.id)} ` +
                            `**${product.nom}** ×${qty} — **$${subtotal}**\n`;
                    }
                }

                champPrincipal =
                    interaction.fields.getTextInputValue(
                        'notes'
                    ) ||
                    'Aucune instruction particulière.';

                // Nettoyage du panier après validation
                session.items = {};
            }

            // =================================================
            // RECRUTEMENT
            // =================================================

            else if (
                modId.startsWith(
                    'mod_postop_recrutement_'
                )
            ) {

                typeLabel = 'recrutement';

                subType =
                    modId.replace(
                        'mod_postop_recrutement_',
                        ''
                    );

                champPrincipal =
                    interaction.fields.getTextInputValue(
                        'motivations'
                    );
            }

            // =================================================
            // SERVICE
            // =================================================

            else if (
                modId.startsWith(
                    'mod_postop_service_'
                )
            ) {

                typeLabel =
                    'support & services';

                subType =
                    modId.replace(
                        'mod_postop_service_',
                        ''
                    );

                champPrincipal =
                    interaction.fields.getTextInputValue(
                        'requete'
                    );
            }

            // =================================================
            // CATÉGORIE DOSSIERS
            // =================================================

            let dossierCategory =
                guild.channels.cache.find(
                    c =>
                        c.type ===
                            ChannelType.GuildCategory &&
                        c.name
                            .toLowerCase()
                            .includes(
                                'dossier en cours'
                            )
                );

            if (!dossierCategory) {

                dossierCategory =
                    await guild.channels.create({
                        name: 'DOSSIER EN COURS',
                        type: ChannelType.GuildCategory
                    });
            }

            // =================================================
            // PERMISSIONS
            // =================================================

            const permissionOverwrites = [

                {
                    id: guild.id,
                    deny: [
                        PermissionFlagsBits.ViewChannel
                    ]
                },

                {
                    id: user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                }
            ];

            for (
                const roleId
                of CONFIG_POSTOP.staffRoles
            ) {

                permissionOverwrites.push({

                    id: roleId,

                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                });
            }

            // =================================================
            // NOM DU TICKET
            // =================================================

            const prefixMap = {

                commandes: 'cmd',

                recrutement: 'rec',

                'support & services': 'srv'
            };

            const cleanChannelName =
                `${prefixMap[typeLabel] || 'ticket'}-${user.username}`
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, '-')
                    .substring(0, 90);

            // =================================================
            // CRÉATION DU SALON
            // =================================================

            const ticketChannel =
                await guild.channels.create({

                    name: cleanChannelName,

                    type: ChannelType.GuildText,

                    parent:
                        dossierCategory.id,

                    permissionOverwrites:
                        permissionOverwrites
                });

            // =================================================
            // EMBED DU DOSSIER
            // =================================================

            let embedDescription = '';

            if (
                modId === 'mod_catalog_checkout'
            ) {

                embedDescription =

                    `**RÉFÉRENCE :** ${typeLabel.toUpperCase()} (${subType})\n\n` +

                    `🏢 **IDENTIFICATION DU CLIENT**\n` +
                    `• **Titulaire :** ${prenom} ${nom}\n` +
                    `• **Ligne directe :** ${telephone}\n\n` +

                    `📋 **DÉTAILS DE LA COMMANDE**\n` +
                    `${recapItems}\n` +

                    `━━━━━━━━━━━━━━━━━━━━━━\n` +

                    `💵 **MONTANT TOTAL : $${total}**\n\n` +

                    `📝 **INSTRUCTIONS / ÉTABLISSEMENT**\n` +
                    `${champPrincipal}\n\n` +

                    `📋 **STATUT DU DOSSIER**\n` +
                    `*Statut : En attente d'instruction.*`;

            } else {

                embedDescription =

                    `**RÉFÉRENCE :** ${typeLabel.toUpperCase()} (${subType})\n\n` +

                    `🏢 **IDENTIFICATION DU DEMANDEUR**\n` +
                    `• **Titulaire :** ${prenom} ${nom}\n` +
                    `• **Ligne directe :** ${telephone}\n\n` +

                    `📄 **DÉTAILS DE LA REQUÊTE**\n` +
                    `${champPrincipal}\n\n` +

                    `📋 **STATUT DU DOSSIER**\n` +
                    `*Statut : En attente d'instruction.*`;
            }

            const embedTicket =
                new EmbedBuilder()
                    .setTitle(
                        `KHATCH & VALLEY — DOSSIER #${ticketChannel.name.toUpperCase()}`
                    )
                    .setDescription(
                        embedDescription
                    )
                    .setColor(0x8B0000)
                    .setFooter({
                        text:
                            'KHATCH & VALLEY • Département Opérationnel'
                    })
                    .setTimestamp();

            // =================================================
            // MENU STAFF
            // =================================================

            const staffSelectMenu =
                new StringSelectMenuBuilder()
                    .setCustomId(
                        `menu_staff_postop_${ticketChannel.id}`
                    )
                    .setPlaceholder(
                        'Gestion administrative du dossier...'
                    )
                    .addOptions([

                        {
                            label:
                                'Prendre en charge',

                            value:
                                'claim',

                            description:
                                'Assumer la responsabilité opérationnelle du dossier'
                        },

                        {
                            label:
                                'Modifier les informations',

                            value:
                                'modify',

                            description:
                                'Ajouter des notes ou mettre à jour le contenu'
                        },

                        {
                            label:
                                'Clôturer le dossier',

                            value:
                                'close',

                            description:
                                'Archiver et clore définitivement la procédure'
                        }
                    ]);

            // =================================================
            // ENVOI DU DOSSIER
            // =================================================

            await ticketChannel.send({

                content:
                    `<@${user.id}> ` +
                    CONFIG_POSTOP.staffRoles
                        .map(
                            roleId =>
                                `<@&${roleId}>`
                        )
                        .join(' '),

                embeds: [
                    embedTicket
                ],

                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            staffSelectMenu
                        )
                ]
            });

            return await interaction.editReply({

                content:
                    `Votre dossier a été enregistré avec succès : <#${ticketChannel.id}>`
            });
        }
    }
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    initPostOpPanels,
    handlePostOpInteraction
};
