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
        categorie: 'BIÈRE',
        type: 'Lager Blonde',
        prix: 45,
        desc: 'Lager blonde légère, sèche et très clean.',
        image: 'https://www.upload.ee/image/19756742/biere.png'
    },

    {
        id: 'prod_2',
        code: '02',
        nom: 'KHATCH VALLEY WHISKY',
        categorie: 'WHISKY',
        type: 'American Whiskey',
        prix: 180,
        desc: 'American whiskey avec maturation en fûts de chêne arménien.',
        image: 'https://www.upload.ee/image/19756745/Whisky.png'
    },

    {
        id: 'prod_3',
        code: '03',
        nom: 'KHATCH VODKA',
        categorie: 'VODKA',
        type: 'Vodka Pure',
        prix: 120,
        desc: 'Vodka ultra-pure à base de blé, finition très douce.',
        image: 'https://www.upload.ee/image/19756746/vodka.png'
    },

    {
        id: 'prod_4',
        code: '04',
        nom: 'KHATCH BOTANICAL GIN',
        categorie: 'GIN',
        type: 'Gin Artisanal',
        prix: 150,
        desc: 'Gin aux botaniques arméniennes : genièvre, abricot sec, coriandre, herbes sauvages.',
        image: 'https://www.upload.ee/image/19756748/GIN-Photoroom.png'
    },

    {
        id: 'prod_5',
        code: '05',
        nom: 'VALLEY RUM',
        categorie: 'RHUM',
        type: 'Rhum Ambré',
        prix: 165,
        desc: 'Rhum ambré, pensé autour de notes vanillées et fruitées.',
        image: 'https://www.upload.ee/image/19756750/rum.jpg'
    },

    {
        id: 'prod_6',
        code: '06',
        nom: 'KHATCH BLANCO',
        categorie: 'TEQUILA',
        type: 'Tequila Blanco',
        prix: 190,
        desc: 'Tequila blanco premium, identité très minimaliste.',
        image: 'https://www.upload.ee/image/19756751/tequila-Photoroom.png'
    },

    {
        id: 'prod_7',
        code: '07',
        nom: 'KHATCH ARMENIAN BRANDY',
        categorie: 'BRANDY',
        type: 'Brandy de Raisin',
        prix: 240,
        desc: 'Brandy de raisin, inspiré de la tradition arménienne.',
        image: 'https://www.upload.ee/image/19756754/brandy-Photoroom.png'
    },

    {
        id: 'prod_8',
        code: '08',
        nom: 'TSIRAN',
        categorie: 'LIQUEUR',
        type: "Liqueur d'Abricot",
        prix: 135,
        desc: "Liqueur d'abricot arménien.",
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
// UTILITAIRES
// ============================================================

function getProduct(productId) {
    return CATALOGUE_PRODUITS.find(product => product.id === productId);
}

function calculateCartTotal(session) {

    let total = 0;

    for (const [productId, quantity] of Object.entries(session.items)) {

        const product = getProduct(productId);

        if (!product || quantity <= 0) continue;

        total += product.prix * quantity;
    }

    return total;
}

// ============================================================
// PANNEAU PRINCIPAL — COMMANDES
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

            '────────────────────────\n' +
            '**COMMANDE**\n' +
            'Choisissez un produit → indiquez la quantité → consultez votre devis → validez votre demande.'
        )
        .setColor(0x8B0000)
        .setFooter({
            text: 'KHATCH & VALLEY • Distillerie arménienne • Los Angeles'
        })
        .setTimestamp();
}

// ============================================================
// MENU PRODUITS
// ============================================================

function getCatalogueComponents() {

    const productOptions = CATALOGUE_PRODUITS.map(product => ({
        label: product.nom,
        value: product.id,
        description: `${product.categorie} • $${product.prix} / unité`
    }));

    const productMenu = new StringSelectMenuBuilder()
        .setCustomId('catalog_select_product')
        .setPlaceholder('Sélectionner un produit...')
        .addOptions(productOptions);

    const productRow = new ActionRowBuilder()
        .addComponents(productMenu);

    const actionRow = new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()
                .setCustomId('catalog_view_quote')
                .setLabel('Consulter mon devis')
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId('catalog_validate_quote')
                .setLabel('Valider le devis')
                .setStyle(ButtonStyle.Success)

        );

    return [
        productRow,
        actionRow
    ];
}

// ============================================================
// VUE DU DEVIS
// ============================================================

function buildQuoteView(userId) {

    const session = getSession(userId);

    let description = '';
    let total = 0;
    let hasProducts = false;

    for (const [productId, quantity] of Object.entries(session.items)) {

        const product = getProduct(productId);

        if (!product || quantity <= 0) continue;

        hasProducts = true;

        const subtotal = product.prix * quantity;

        total += subtotal;

        description +=
            `**${product.code} — ${product.nom}**\n` +
            `${quantity} × $${product.prix} = **$${subtotal}**\n\n`;
    }

    if (!hasProducts) {

        description =
            'Votre devis est actuellement vide.\n\n' +
            'Sélectionnez un produit dans le catalogue pour commencer votre commande.';
    }

    const embed = new EmbedBuilder()
        .setTitle('KHATCH & VALLEY — MON DEVIS')
        .setColor(0x8B0000)
        .setDescription(

            hasProducts

                ? `**RÉCAPITULATIF DE VOTRE SÉLECTION**\n\n${description}` +
                  `────────────────────────\n` +
                  `**TOTAL ESTIMÉ : $${total}**\n\n` +
                  `*Les quantités et le montant pourront être confirmés par notre service commercial.*`

                : description

        )
        .setFooter({
            text: 'KHATCH & VALLEY • Devis commercial'
        })
        .setTimestamp();

    const buttons = [];

    if (hasProducts) {

        buttons.push(
            new ButtonBuilder()
                .setCustomId('catalog_validate_quote')
                .setLabel('Valider le devis')
                .setStyle(ButtonStyle.Success)
        );

    }

    return {
        embeds: [embed],
        components: buttons.length
            ? [new ActionRowBuilder().addComponents(...buttons)]
            : []
    };
}

// ============================================================
// PANNEAU RECRUTEMENT
// ============================================================

function getRecrutementEmbed() {

    return new EmbedBuilder()
        .setTitle('KHATCH & VALLEY — RECRUTEMENT')
        .setDescription(
            'Rejoignez les équipes de KHATCH & VALLEY et participez au développement de notre distillerie à Los Angeles.\n\n' +
            'Sélectionnez le poste qui vous intéresse afin d’ouvrir votre dossier de candidature.'
        )
        .setColor(0x8B0000)
        .setFooter({
            text: 'KHATCH & VALLEY • Ressources Humaines'
        })
        .setTimestamp();
}

function getRecrutementComponents() {

    return new ActionRowBuilder()
        .addComponents(

            new StringSelectMenuBuilder()
                .setCustomId('menu_ticket_postop_recrutement')
                .setPlaceholder('Choisir un poste...')
                .addOptions([

                    {
                        label: 'Maître Distillateur / Assistant',
                        value: 'rec_distillateur',
                        description: 'Production et élaboration des spiritueux'
                    },

                    {
                        label: 'Chauffeur / Livreur Terrain',
                        value: 'rec_chauffeur',
                        description: 'Transport et livraison'
                    },

                    {
                        label: 'Agent de Sécurité & Escorte',
                        value: 'rec_securite',
                        description: 'Sécurisation des opérations'
                    }

                ])

        );
}

// ============================================================
// SUPPORT & SERVICES
// ============================================================

function getServiceEmbed() {

    return new EmbedBuilder()
        .setTitle('KHATCH & VALLEY — SUPPORT')
        .setDescription(
            'Une question, une demande commerciale ou un besoin particulier ?\n\n' +
            'Sélectionnez le service correspondant à votre demande afin d’ouvrir un dossier.'
        )
        .setColor(0x8B0000)
        .setFooter({
            text: 'KHATCH & VALLEY • Support & Services'
        })
        .setTimestamp();
}

function getServiceComponents() {

    return new ActionRowBuilder()
        .addComponents(

            new StringSelectMenuBuilder()
                .setCustomId('menu_ticket_postop_service')
                .setPlaceholder('Choisir un service...')
                .addOptions([

                    {
                        label: 'Assistance & Support Client',
                        value: 'srv_support',
                        description: 'Question, problème ou demande client'
                    },

                    {
                        label: 'Partenariat / Autre Demande',
                        value: 'srv_autre',
                        description: 'Collaboration ou demande commerciale'
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
                    '[KHATCH & VALLEY] Erreur interaction :',
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

    // ========================================================
    // COMMANDES
    // ========================================================

    if (cmdChan) {

        try {

            const msgs =
                await cmdChan.messages.fetch({
                    limit: 10
                });

            const botMsg =
                msgs.find(
                    message =>
                        message.author.id === client.user.id &&
                        message.embeds[0]?.title === 'KHATCH & VALLEY'
                );

            const payload = {
                embeds: [getCommandesEmbed()],
                components: getCatalogueComponents()
            };

            if (!botMsg) {

                await cmdChan.send(payload);

            } else {

                await botMsg.edit(payload);

            }

        } catch (error) {

            console.error(
                '[KHATCH & VALLEY] Erreur salon Commandes :',
                error
            );

        }
    }

    // ========================================================
    // RECRUTEMENT
    // ========================================================

    if (recChan) {

        try {

            const msgs =
                await recChan.messages.fetch({
                    limit: 10
                });

            const botMsg =
                msgs.find(
                    message =>
                        message.author.id === client.user.id &&
                        message.embeds[0]?.title?.includes('RECRUTEMENT')
                );

            const payload = {
                embeds: [getRecrutementEmbed()],
                components: [getRecrutementComponents()]
            };

            if (!botMsg) {

                await recChan.send(payload);

            } else {

                await botMsg.edit(payload);

            }

        } catch (error) {

            console.error(
                '[KHATCH & VALLEY] Erreur salon Recrutement :',
                error
            );

        }
    }

    // ========================================================
    // SUPPORT
    // ========================================================

    if (srvChan) {

        try {

            const msgs =
                await srvChan.messages.fetch({
                    limit: 10
                });

            const botMsg =
                msgs.find(
                    message =>
                        message.author.id === client.user.id &&
                        message.embeds[0]?.title?.includes('SUPPORT')
                );

            const payload = {
                embeds: [getServiceEmbed()],
                components: [getServiceComponents()]
            };

            if (!botMsg) {

                await srvChan.send(payload);

            } else {

                await botMsg.edit(payload);

            }

        } catch (error) {

            console.error(
                '[KHATCH & VALLEY] Erreur salon Support :',
                error
            );

        }
    }
}

// ============================================================
// GESTION PRINCIPALE DES INTERACTIONS
// ============================================================

async function handlePostOpInteraction(interaction) {

    const id = interaction.customId;

    if (!id) return;

    const isPostOpAction =

        id === 'catalog_view_quote' ||
        id === 'catalog_validate_quote' ||

        id === 'catalog_select_product' ||

        id.startsWith('mod_catalog_qty_') ||
        id === 'mod_catalog_checkout' ||

        id === 'menu_ticket_postop_recrutement' ||
        id === 'menu_ticket_postop_service' ||

        id.startsWith('mod_postop_') ||

        id.startsWith('menu_staff_postop_');

    if (!isPostOpAction) return;

    if (interaction.handledByPostOp) return;

    interaction.handledByPostOp = true;

    const userId = interaction.user.id;

    const session = getSession(userId);

    // ========================================================
    // CONSULTATION DU DEVIS
    // ========================================================

    if (id === 'catalog_view_quote') {

        return await interaction.reply({
            ...buildQuoteView(userId),
            flags: [MessageFlags.Ephemeral]
        });

    }

    // ========================================================
    // VALIDATION DU DEVIS
    // ========================================================

    if (id === 'catalog_validate_quote') {

        const entries =
            Object.entries(session.items)
                .filter(([_, quantity]) => quantity > 0);

        if (entries.length === 0) {

            return await interaction.reply({

                content:
                    'Votre devis est vide. Sélectionnez au moins un produit avant de continuer.',

                flags: [MessageFlags.Ephemeral]

            });

        }

        const modal =
            new ModalBuilder()
                .setCustomId('mod_catalog_checkout')
                .setTitle('Validation du devis');

        modal.addComponents(

            new ActionRowBuilder().addComponents(

                new TextInputBuilder()
                    .setCustomId('prenom')
                    .setLabel('Prénom')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(50)

            ),

            new ActionRowBuilder().addComponents(

                new TextInputBuilder()
                    .setCustomId('nom')
                    .setLabel('Nom')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(50)

            ),

            new ActionRowBuilder().addComponents(

                new TextInputBuilder()
                    .setCustomId('telephone')
                    .setLabel('Téléphone')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(30)

            ),

            new ActionRowBuilder().addComponents(

                new TextInputBuilder()
                    .setCustomId('notes')
                    .setLabel('Établissement / Livraison / Instructions')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(false)
                    .setMaxLength(1000)

            )

        );

        return await interaction.showModal(modal);
    }

    // ========================================================
    // CHOIX D'UN PRODUIT
    // ========================================================

    if (
        interaction.isStringSelectMenu() &&
        id === 'catalog_select_product'
    ) {

        const productId =
            interaction.values[0];

        const product =
            getProduct(productId);

        if (!product) {

            return await interaction.reply({

                content:
                    'Ce produit n’existe plus dans le catalogue.',

                flags: [MessageFlags.Ephemeral]

            });

        }

        const currentQuantity =
            session.items[product.id] || 0;

        const modal =
            new ModalBuilder()
                .setCustomId(
                    `mod_catalog_qty_${product.id}`
                )
                .setTitle(
                    `${product.nom} — Quantité`
                );

        const quantityInput =
            new TextInputBuilder()
                .setCustomId('quantity')
                .setLabel(
                    `Quantité — ${product.nom}`
                )
                .setPlaceholder(
                    currentQuantity > 0
                        ? `Actuellement : ${currentQuantity}`
                        : 'Exemple : 5'
                )
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMinLength(1)
                .setMaxLength(5);

        modal.addComponents(
            new ActionRowBuilder()
                .addComponents(quantityInput)
        );

        return await interaction.showModal(modal);
    }

    // ========================================================
    // RECRUTEMENT / SERVICES
    // ========================================================

    if (interaction.isStringSelectMenu()) {

        const value =
            interaction.values[0];

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
                        `mod_postop_recrutement_${value}`
                    )
                    .setTitle(
                        `Candidature — ${postNames[value] || 'Poste'}`
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
        // SERVICES
        // ----------------------------------------------------

        if (
            id === 'menu_ticket_postop_service'
        ) {

            const serviceNames = {

                srv_support:
                    'Assistance & Support Client',

                srv_autre:
                    'Partenariat / Autre Demande'

            };

            const modal =
                new ModalBuilder()
                    .setCustomId(
                        `mod_postop_service_${value}`
                    )
                    .setTitle(
                        `Service — ${serviceNames[value] || 'Support'}`
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
        // STAFF
        // ----------------------------------------------------

        if (
            id.startsWith('menu_staff_postop_')
        ) {

            const member =
                interaction.member;

            const hasStaffRole =
                member.roles.cache.some(
                    role =>
                        CONFIG_POSTOP.staffRoles.includes(
                            role.id
                        )
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

            const action =
                interaction.values[0];

            const message =
                interaction.message;

            const oldEmbed =
                message.embeds[0];

            // ----------------------------------------------
            // CLAIM
            // ----------------------------------------------

            if (action === 'claim') {

                if (
                    oldEmbed.description.includes(
                        'Dossier pris en charge'
                    )
                ) {

                    return await interaction.reply({

                        content:
                            'Ce dossier est déjà pris en charge.',

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

                    components:
                        message.components

                });

                return await interaction.reply({

                    content:
                        'Dossier pris en charge avec succès.',

                    flags: [MessageFlags.Ephemeral]

                });
            }

            // ----------------------------------------------
            // MODIFY
            // ----------------------------------------------

            if (action === 'modify') {

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
                                'Informations complémentaires'
                            )
                            .setStyle(
                                TextInputStyle.Paragraph
                            )
                            .setRequired(true)

                    )

                );

                return await interaction.showModal(modal);
            }

            // ----------------------------------------------
            // CLOSE
            // ----------------------------------------------

            if (action === 'close') {

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

                    } catch (error) {

                        console.error(
                            '[KHATCH & VALLEY] Erreur clôture :',
                            error
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
                'mod_catalog_qty_'
            )
        ) {

            const productId =
                modId.replace(
                    'mod_catalog_qty_',
                    ''
                );

            const product =
                getProduct(productId);

            if (!product) {

                return await interaction.reply({

                    content:
                        'Produit introuvable.',

                    flags: [MessageFlags.Ephemeral]

                });

            }

            const rawQuantity =
                interaction.fields
                    .getTextInputValue(
                        'quantity'
                    )
                    .trim();

            const quantity =
                Number(rawQuantity);

            if (
                !Number.isInteger(quantity) ||
                quantity <= 0 ||
                quantity > 9999
            ) {

                return await interaction.reply({

                    content:
                        'Veuillez indiquer une quantité entière comprise entre 1 et 9999.',

                    flags: [MessageFlags.Ephemeral]

                });

            }

            session.items[product.id] =
                quantity;

            const subtotal =
                product.prix * quantity;

            return await interaction.reply({

                content:
                    `**${product.nom}** ajouté au devis.\n\n` +
                    `Quantité : **${quantity}**\n` +
                    `Sous-total : **$${subtotal}**\n\n` +
                    `Vous pouvez maintenant consulter votre devis depuis le catalogue.`,

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

                    const messages =
                        await channel.messages.fetch({
                            limit: 10
                        });

                    const targetMessage =
                        messages.find(
                            message =>
                                message.embeds.length > 0 &&
                                message.embeds[0]
                                    .title
                                    ?.includes('DOSSIER')
                        );

                    if (targetMessage) {

                        const oldEmbed =
                            targetMessage.embeds[0];

                        const embed =
                            EmbedBuilder.from(
                                oldEmbed
                            );

                        let description =
                            oldEmbed.description;

                        description +=
                            `\n\n📝 **NOTE STAFF**\n${nouveauContenu}`;

                        embed.setDescription(
                            description
                        );

                        await targetMessage.edit({
                            embeds: [embed]
                        });

                    }

                } catch (error) {

                    console.error(
                        '[KHATCH & VALLEY] Erreur modification :',
                        error
                    );

                }
            }

            return await interaction.reply({

                content:
                    'Les informations du dossier ont été mises à jour.',

                flags: [MessageFlags.Ephemeral]

            });
        }

        // ====================================================
        // CHECKOUT / RECRUTEMENT / SERVICE
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

            let typeLabel = '';

            let subType = '';

            let recapItems = '';

            let total = 0;

            let champPrincipal = '';

            // =================================================
            // COMMANDE
            // =================================================

            if (
                modId === 'mod_catalog_checkout'
            ) {

                typeLabel =
                    'COMMANDES';

                subType =
                    'Catalogue KHATCH & VALLEY';

                for (
                    const [
                        productId,
                        quantity
                    ]
                    of Object.entries(
                        session.items
                    )
                ) {

                    const product =
                        getProduct(productId);

                    if (
                        !product ||
                        quantity <= 0
                    ) continue;

                    const subtotal =
                        product.prix *
                        quantity;

                    total += subtotal;

                    recapItems +=

                        `• **[${product.code}] ${product.nom}**\n` +
                        `  ${quantity} × $${product.prix} = **$${subtotal}**\n\n`;

                }

                champPrincipal =
                    interaction.fields
                        .getTextInputValue(
                            'notes'
                        ) ||
                    'Aucune instruction particulière.';

                // Nettoyage du panier
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

                typeLabel =
                    'RECRUTEMENT';

                subType =
                    modId.replace(
                        'mod_postop_recrutement_',
                        ''
                    );

                champPrincipal =
                    interaction.fields
                        .getTextInputValue(
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
                    'SUPPORT & SERVICES';

                subType =
                    modId.replace(
                        'mod_postop_service_',
                        ''
                    );

                champPrincipal =
                    interaction.fields
                        .getTextInputValue(
                            'requete'
                        );

            }

            // =================================================
            // CATÉGORIE DOSSIERS
            // =================================================

            let dossierCategory =
                guild.channels.cache.find(

                    channel =>

                        channel.type ===
                        ChannelType.GuildCategory &&

                        channel.name
                            .toLowerCase()
                            .includes(
                                'dossier en cours'
                            )

                );

            if (!dossierCategory) {

                dossierCategory =
                    await guild.channels.create({

                        name:
                            'DOSSIERS EN COURS',

                        type:
                            ChannelType.GuildCategory

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
            // NOM DU SALON
            // =================================================

            const prefixMap = {

                COMMANDES:
                    'cmd',

                RECRUTEMENT:
                    'rec',

                'SUPPORT & SERVICES':
                    'srv'

            };

            const prefix =
                prefixMap[typeLabel] ||
                'ticket';

            const cleanChannelName =

                `${prefix}-${user.username}`

                    .toLowerCase()

                    .replace(
                        /[^a-z0-9]/g,
                        '-'
                    )

                    .substring(
                        0,
                        90
                    );

            // =================================================
            // CRÉATION TICKET
            // =================================================

            const ticketChannel =
                await guild.channels.create({

                    name:
                        cleanChannelName,

                    type:
                        ChannelType.GuildText,

                    parent:
                        dossierCategory.id,

                    permissionOverwrites

                });

            // =================================================
            // EMBED COMMANDE
            // =================================================

            let embedDescription = '';

            if (
                modId === 'mod_catalog_checkout'
            ) {

                embedDescription =

                    `**RÉFÉRENCE :** ${typeLabel} — ${subType}\n\n` +

                    `🏢 **CLIENT**\n` +
                    `• **Titulaire :** ${prenom} ${nom}\n` +
                    `• **Téléphone :** ${telephone}\n\n` +

                    `📦 **COMMANDE**\n` +
                    `${recapItems}\n` +

                    `────────────────────────\n` +

                    `💵 **TOTAL DU DEVIS : $${total}**\n\n` +

                    `📝 **ÉTABLISSEMENT / INSTRUCTIONS**\n` +
                    `${champPrincipal}\n\n` +

                    `📋 **STATUT**\n` +
                    `*En attente d'instruction par le service commercial.*`;

            } else {

                embedDescription =

                    `**RÉFÉRENCE :** ${typeLabel} — ${subType}\n\n` +

                    `🏢 **DEMANDEUR**\n` +
                    `• **Titulaire :** ${prenom} ${nom}\n` +
                    `• **Téléphone :** ${telephone}\n\n` +

                    `📄 **DÉTAILS DE LA DEMANDE**\n` +
                    `${champPrincipal}\n\n` +

                    `📋 **STATUT**\n` +
                    `*En attente d'instruction.*`;

            }

            // =================================================
            // EMBED TICKET
            // =================================================

            const embedTicket =
                new EmbedBuilder()

                    .setTitle(
                        `KHATCH & VALLEY — DOSSIER #${ticketChannel.name.toUpperCase()}`
                    )

                    .setDescription(
                        embedDescription
                    )

                    .setColor(
                        0x8B0000
                    )

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
                        'Gestion du dossier...'
                    )

                    .addOptions([

                        {
                            label:
                                'Prendre en charge',

                            value:
                                'claim',

                            description:
                                'Assigner le dossier à votre profil'

                        },

                        {
                            label:
                                'Modifier les informations',

                            value:
                                'modify',

                            description:
                                'Ajouter une note ou information'

                        },

                        {
                            label:
                                'Clôturer le dossier',

                            value:
                                'close',

                            description:
                                'Archiver et fermer le dossier'

                        }

                    ]);

            // =================================================
            // ENVOI
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
                    `Votre dossier KHATCH & VALLEY a été enregistré : <#${ticketChannel.id}>`

            });

        }
    }
}

// ============================================================
// EXPORT
// ============================================================

module.exports = {
    initPostOpPanels,
    handlePostOpInteraction
};
