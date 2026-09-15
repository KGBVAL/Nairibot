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

/* =========================================================
   KHATCH & VALLEY
   Armenian Distillery — Los Angeles
   ========================================================= */

const CONFIG_POSTOP = {
    brand: 'KHATCH & VALLEY',
    subtitle: 'Armenian Distillery — Los Angeles',

    staffRoles: [
        '1539267928762097770',
        '1539400476536217690'
    ],

    channels: {
        commandes: '1547194706671308860',
        recrutement: '1547194709049479178',
        service: '1547194707799703563'
    },

    colors: {
        primary: 0x171717,
        accent: 0x8B0000,
        light: 0xF2EFE8,
        success: 0x2F6B4F
    }
};


/* =========================================================
   CATALOGUE OFFICIEL
   ========================================================= */

const CATALOGUE_PRODUITS = [
    {
        id: 'prod_1',
        code: '01',
        nom: 'KHATCH LAGER',
        type: 'Bière Blonde',
        format: '330 ML',
        prix: 45,
        desc: 'Lager blonde légère, sèche et nette. Une bière pensée pour le service en établissement.',
        image: 'https://www.upload.ee/image/19756742/biere.png'
    },

    {
        id: 'prod_2',
        code: '02',
        nom: 'KHATCH & VALLEY WHISKY',
        type: 'American Whiskey',
        format: '750 ML',
        prix: 180,
        desc: 'American whiskey d’exception avec maturation en fûts de chêne arménien. Notes boisées, vanillées et profondes.',
        image: 'https://www.upload.ee/image/19756745/Whisky.png'
    },

    {
        id: 'prod_3',
        code: '03',
        nom: 'KHATCH VODKA',
        type: 'Vodka Pure',
        format: '750 ML',
        prix: 120,
        desc: 'Vodka de blé ultra-pure, filtrée avec précision pour une texture douce et un profil net.',
        image: 'https://www.upload.ee/image/19756746/vodka.png'
    },

    {
        id: 'prod_4',
        code: '04',
        nom: 'KHATCH BOTANICAL GIN',
        type: 'Gin Artisanal',
        format: '750 ML',
        prix: 150,
        desc: 'Gin aux botaniques inspirées du patrimoine arménien : genièvre, coriandre, fruits secs et herbes sauvages.',
        image: 'https://www.upload.ee/image/19756748/GIN-Photoroom.png'
    },

    {
        id: 'prod_5',
        code: '05',
        nom: 'VALLEY RUM',
        type: 'Rhum Ambré',
        format: '750 ML',
        prix: 165,
        desc: 'Rhum ambré rond et chaleureux, marqué par la vanille, les fruits mûrs et une finale boisée.',
        image: 'https://www.upload.ee/image/19756750/rum.jpg'
    },

    {
        id: 'prod_6',
        code: '06',
        nom: 'KHATCH BLANCO',
        type: 'Tequila Blanco',
        format: '750 ML',
        prix: 190,
        desc: 'Tequila blanco premium à l’expression minérale, fraîche et incisive.',
        image: 'https://www.upload.ee/image/19756751/tequila-Photoroom.png'
    },

    {
        id: 'prod_7',
        code: '07',
        nom: 'KHATCH ARMENIAN BRANDY',
        type: 'Brandy de Raisin',
        format: '750 ML',
        prix: 240,
        desc: 'Brandy de raisin inspiré de la grande tradition arménienne. Fruits confits, noix et notes boisées.',
        image: 'https://www.upload.ee/image/19756754/brandy-Photoroom.png'
    },

    {
        id: 'prod_8',
        code: '08',
        nom: 'TSIRAN',
        type: 'Liqueur d’Abricot',
        format: '750 ML',
        prix: 135,
        desc: 'Liqueur d’abricot arménien, riche et fruitée, avec une finale fraîche et persistante.',
        image: 'https://www.upload.ee/image/19756755/liqueur-Photoroom.png'
    }
];


/* =========================================================
   SESSIONS UTILISATEURS
   ========================================================= */

const userSessions = new Map();

function getSession(userId) {
    if (!userSessions.has(userId)) {
        userSessions.set(userId, {
            items: {}
        });
    }

    return userSessions.get(userId);
}

function resetSession(userId) {
    userSessions.set(userId, {
        items: {}
    });

    return userSessions.get(userId);
}


/* =========================================================
   UTILITAIRES CATALOGUE
   ========================================================= */

function getProduct(productId) {
    return CATALOGUE_PRODUITS.find(product => product.id === productId);
}

function getCartTotal(session) {
    return Object.entries(session.items).reduce((total, [productId, quantity]) => {
        const product = getProduct(productId);

        if (!product || quantity <= 0) {
            return total;
        }

        return total + (product.prix * quantity);
    }, 0);
}

function getCartCount(session) {
    return Object.values(session.items)
        .reduce((total, quantity) => total + quantity, 0);
}


/* =========================================================
   EMBED PRINCIPAL — COMMANDES
   ========================================================= */

function getCommandesEmbed() {
    return new EmbedBuilder()
        .setColor(CONFIG_POSTOP.colors.primary)
        .setTitle('KHATCH & VALLEY')
        .setDescription(
            [
                '**ARMENIAN DISTILLERY — LOS ANGELES**',
                '',
                'Découvrez la sélection commerciale de KHATCH & VALLEY.',
                '',
                'Notre catalogue réunit nos huit références principales :',
                'bière, whisky, vodka, gin, rhum, tequila, brandy et liqueur.',
                '',
                'Sélectionnez **Ouvrir le catalogue** pour consulter les produits et préparer votre devis.'
            ].join('\n')
        )
        .addFields({
            name: 'CATALOGUE COMMERCIAL',
            value:
                '```' +
                '01  KHATCH LAGER\n' +
                '02  KHATCH & VALLEY WHISKY\n' +
                '03  KHATCH VODKA\n' +
                '04  KHATCH BOTANICAL GIN\n' +
                '05  VALLEY RUM\n' +
                '06  KHATCH BLANCO\n' +
                '07  KHATCH ARMENIAN BRANDY\n' +
                '08  TSIRAN' +
                '```'
        })
        .setFooter({
            text: 'KHATCH & VALLEY • Département Commercial'
        })
        .setTimestamp();
}


function getCommandesComponents() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('catalog_open_session')
            .setLabel('Ouvrir le catalogue')
            .setStyle(ButtonStyle.Secondary)
    );
}


/* =========================================================
   CATALOGUE
   ========================================================= */

function buildCatalogView(userId) {
    const session = getSession(userId);

    let catalogueText = '';

    for (const product of CATALOGUE_PRODUITS) {
        const quantity = session.items[product.id] || 0;
        const subtotal = product.prix * quantity;

        const quantityDisplay = quantity > 0
            ? `**${quantity} ×**  •  **$${subtotal}**`
            : '—';

        catalogueText +=
            `**${product.code}  ${product.nom}**\n` +
            `${product.type} · ${product.format} · **$${product.prix} / unité**\n` +
            `Sélectionné : ${quantityDisplay}\n\n`;
    }

    const total = getCartTotal(session);
    const count = getCartCount(session);

    const embed = new EmbedBuilder()
        .setColor(CONFIG_POSTOP.colors.primary)
        .setTitle('KHATCH & VALLEY — CATALOGUE')
        .setDescription(
            [
                '**ARMENIAN DISTILLERY — LOS ANGELES**',
                '',
                catalogueText,
                '────────────────────────',
                `**${count} unité${count > 1 ? 's' : ''} sélectionnée${count > 1 ? 's' : ''}**`,
                `**TOTAL ACTUEL : $${total}**`
            ].join('\n')
        )
        .setFooter({
            text: 'Sélectionnez un produit pour modifier sa quantité.'
        });

    const menuOptions = CATALOGUE_PRODUITS.map(product => ({
        label: `${product.code} — ${product.nom}`,
        value: `product_${product.id}`,
        description: `${product.type} · $${product.prix} / unité`
    }));

    menuOptions.push({
        label: 'Consulter mon devis',
        value: 'view_quote',
        description: 'Afficher le récapitulatif de votre sélection'
    });

    menuOptions.push({
        label: 'Valider mon devis',
        value: 'validate_quote',
        description: 'Transmettre votre devis au service commercial'
    });

    const menu = new StringSelectMenuBuilder()
        .setCustomId('catalog_main_menu')
        .setPlaceholder('Sélectionner une action...')
        .addOptions(menuOptions);

    return {
        embeds: [embed],
        components: [
            new ActionRowBuilder().addComponents(menu)
        ]
    };
}


/* =========================================================
   MODALE QUANTITÉ
   ========================================================= */

function buildQuantityModal(product) {
    return new ModalBuilder()
        .setCustomId(`mod_catalog_quantity_${product.id}`)
        .setTitle(`${product.code} — ${product.nom}`)
        .addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('quantity')
                    .setLabel('Quantité souhaitée')
                    .setPlaceholder('Exemple : 10')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(1)
                    .setMaxLength(4)
            )
        );
}


/* =========================================================
   DEVIS
   ========================================================= */

function buildQuoteView(userId) {
    const session = getSession(userId);

    const entries = Object.entries(session.items)
        .filter(([_, quantity]) => quantity > 0);

    let description = '';
    let total = 0;
    let totalUnits = 0;

    if (entries.length === 0) {
        description =
            '### Votre devis est vide.\n\n' +
            'Sélectionnez un produit dans le catalogue pour commencer.';
    } else {
        description = '**RÉCAPITULATIF DU DEVIS**\n\n';

        for (const [productId, quantity] of entries) {
            const product = getProduct(productId);

            if (!product) continue;

            const subtotal = product.prix * quantity;

            total += subtotal;
            totalUnits += quantity;

            description +=
                `**${product.code} · ${product.nom}**\n` +
                `${quantity} × $${product.prix} = **$${subtotal}**\n\n`;
        }

        description +=
            '────────────────────────\n' +
            `**${totalUnits} unité${totalUnits > 1 ? 's' : ''}**\n` +
            `## TOTAL : $${total}`;
    }

    const embed = new EmbedBuilder()
        .setColor(CONFIG_POSTOP.colors.primary)
        .setTitle('KHATCH & VALLEY — VOTRE DEVIS')
        .setDescription(description)
        .setFooter({
            text: 'Le devis sera transmis au service commercial après validation.'
        });

    /*
     * Seulement deux boutons ici :
     * - retour catalogue
     * - validation
     *
     * Pas de boutons de quantité, navigation, etc.
     */

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('quote_back_catalog')
            .setLabel('Retour au catalogue')
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId('cart_validate')
            .setLabel('Valider le devis')
            .setStyle(ButtonStyle.Success)
            .setDisabled(entries.length === 0)
    );

    return {
        embeds: [embed],
        components: [row]
    };
}


/* =========================================================
   MODALE VALIDATION DEVIS
   ========================================================= */

function buildCheckoutModal() {
    return new ModalBuilder()
        .setCustomId('mod_catalog_checkout')
        .setTitle('Validation du devis')
        .addComponents(

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
                    .setCustomId('notes')
                    .setLabel('Établissement / livraison / informations')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(false)
            )
        );
}


/* =========================================================
   RECRUTEMENT
   ========================================================= */

function getRecrutementEmbed() {
    return new EmbedBuilder()
        .setColor(CONFIG_POSTOP.colors.primary)
        .setTitle('KHATCH & VALLEY — RECRUTEMENT')
        .setDescription(
            [
                '**ARMENIAN DISTILLERY — LOS ANGELES**',
                '',
                'KHATCH & VALLEY recherche régulièrement des profils pour accompagner ses opérations.',
                '',
                'Sélectionnez le poste qui vous intéresse afin de déposer votre candidature.'
            ].join('\n')
        )
        .setFooter({
            text: 'KHATCH & VALLEY • Ressources Humaines'
        })
        .setTimestamp();
}


function getRecrutementComponents() {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('menu_ticket_postop_recrutement')
            .setPlaceholder('Sélectionner un poste...')
            .addOptions([
                {
                    label: 'Maître Distillateur / Assistant',
                    value: 'rec_distillateur',
                    description: 'Production, distillation et mise en fût'
                },
                {
                    label: 'Chauffeur / Livreur Terrain',
                    value: 'rec_chauffeur',
                    description: 'Transport et livraison des marchandises'
                },
                {
                    label: 'Agent de Sécurité & Escorte',
                    value: 'rec_securite',
                    description: 'Sécurisation des opérations et convois'
                }
            ])
    );
}


/* =========================================================
   SERVICES
   ========================================================= */

function getServiceEmbed() {
    return new EmbedBuilder()
        .setColor(CONFIG_POSTOP.colors.primary)
        .setTitle('KHATCH & VALLEY — SUPPORT')
        .setDescription(
            [
                '**ARMENIAN DISTILLERY — LOS ANGELES**',
                '',
                'Une question, une demande commerciale ou un besoin particulier ?',
                '',
                'Sélectionnez simplement le type de demande afin d’ouvrir un dossier auprès de notre équipe.'
            ].join('\n')
        )
        .setFooter({
            text: 'KHATCH & VALLEY • Support & Services'
        })
        .setTimestamp();
}


function getServiceComponents() {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('menu_ticket_postop_service')
            .setPlaceholder('Sélectionner une demande...')
            .addOptions([
                {
                    label: 'Assistance & Support Client',
                    value: 'srv_support',
                    description: 'Question, assistance ou problème avec une commande'
                },
                {
                    label: 'Partenariat / Demande commerciale',
                    value: 'srv_autre',
                    description: 'Collaboration, partenariat ou demande spécifique'
                }
            ])
    );
}


/* =========================================================
   INITIALISATION DES PANNEAUX
   ========================================================= */

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

    const cmdChan = guild.channels.cache.get(
        CONFIG_POSTOP.channels.commandes
    );

    const recChan = guild.channels.cache.get(
        CONFIG_POSTOP.channels.recrutement
    );

    const srvChan = guild.channels.cache.get(
        CONFIG_POSTOP.channels.service
    );


    /* =========================
       COMMANDES
       ========================= */

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

        } catch (error) {

            console.error(
                '[KHATCH & VALLEY] Erreur salon commandes :',
                error
            );

        }
    }


    /* =========================
       RECRUTEMENT
       ========================= */

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

        } catch (error) {

            console.error(
                '[KHATCH & VALLEY] Erreur recrutement :',
                error
            );

        }
    }


    /* =========================
       SERVICE
       ========================= */

    if (srvChan) {

        try {

            const msgs = await srvChan.messages.fetch({
                limit: 10
            });

            const botMsg = msgs.find(
                m =>
                    m.author.id === client.user.id &&
                    m.embeds[0]?.title?.includes('SUPPORT')
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

        } catch (error) {

            console.error(
                '[KHATCH & VALLEY] Erreur service :',
                error
            );

        }
    }
}


/* =========================================================
   HANDLER PRINCIPAL
   ========================================================= */

async function handlePostOpInteraction(interaction) {

    const id = interaction.customId;

    if (!id) return;


    const isPostOpAction =
        id === 'catalog_open_session' ||
        id === 'catalog_main_menu' ||
        id === 'quote_back_catalog' ||
        id === 'cart_validate' ||
        id === 'menu_ticket_postop_recrutement' ||
        id === 'menu_ticket_postop_service' ||
        id.startsWith('mod_catalog_quantity_') ||
        id.startsWith('mod_postop_') ||
        id.startsWith('menu_staff_postop_');

    if (!isPostOpAction) {
        return;
    }


    if (interaction.handledByPostOp) {
        return;
    }

    interaction.handledByPostOp = true;


    const userId = interaction.user.id;
    const session = getSession(userId);


    /* =====================================================
       OUVERTURE CATALOGUE
       ===================================================== */

    if (id === 'catalog_open_session') {

        const view = buildCatalogView(userId);

        return await interaction.reply({
            ...view,
            flags: [MessageFlags.Ephemeral]
        });
    }


    /* =====================================================
       MENU PRINCIPAL DU CATALOGUE
       ===================================================== */

    if (
        interaction.isStringSelectMenu() &&
        id === 'catalog_main_menu'
    ) {

        const selected = interaction.values[0];


        /* -------------------------
           PRODUIT
           ------------------------- */

        if (selected.startsWith('product_')) {

            const productId = selected.replace(
                'product_',
                ''
            );

            const product = getProduct(productId);

            if (!product) {

                return await interaction.reply({
                    content: 'Produit introuvable.',
                    flags: [MessageFlags.Ephemeral]
                });

            }

            return await interaction.showModal(
                buildQuantityModal(product)
            );
        }


        /* -------------------------
           CONSULTER DEVIS
           ------------------------- */

        if (selected === 'view_quote') {

            return await interaction.update(
                buildQuoteView(userId)
            );
        }


        /* -------------------------
           VALIDER DEVIS
           ------------------------- */

        if (selected === 'validate_quote') {

            const entries = Object.entries(session.items)
                .filter(([_, quantity]) => quantity > 0);

            if (entries.length === 0) {

                return await interaction.reply({
                    content:
                        'Votre devis est vide. Sélectionnez au moins un produit.',
                    flags: [MessageFlags.Ephemeral]
                });
            }

            return await interaction.showModal(
                buildCheckoutModal()
            );
        }
    }


    /* =====================================================
       MODIFICATION QUANTITÉ
       ===================================================== */

    if (id.startsWith('mod_catalog_quantity_')) {

        const productId = id.replace(
            'mod_catalog_quantity_',
            ''
        );

        const product = getProduct(productId);

        if (!product) {

            return await interaction.reply({
                content: 'Produit introuvable.',
                flags: [MessageFlags.Ephemeral]
            });
        }


        const rawQuantity =
            interaction.fields.getTextInputValue('quantity');

        const quantity = Number(rawQuantity);


        if (
            !Number.isInteger(quantity) ||
            quantity < 0 ||
            quantity > 9999
        ) {

            return await interaction.reply({
                content:
                    'Veuillez entrer une quantité entière comprise entre 0 et 9999.',
                flags: [MessageFlags.Ephemeral]
            });
        }


        if (quantity === 0) {

            delete session.items[product.id];

        } else {

            session.items[product.id] = quantity;

        }


        return await interaction.reply({
            ...buildCatalogView(userId),
            flags: [MessageFlags.Ephemeral]
        });
    }


    /* =====================================================
       RETOUR AU CATALOGUE
       ===================================================== */

    if (id === 'quote_back_catalog') {

        return await interaction.update(
            buildCatalogView(userId)
        );
    }


    /* =====================================================
       VALIDATION DEVIS
       ===================================================== */

    if (id === 'cart_validate') {

        const entries = Object.entries(session.items)
            .filter(([_, quantity]) => quantity > 0);

        if (entries.length === 0) {

            return await interaction.reply({
                content:
                    'Votre devis est vide. Sélectionnez au moins un produit.',
                flags: [MessageFlags.Ephemeral]
            });
        }

        return await interaction.showModal(
            buildCheckoutModal()
        );
    }


    /* =====================================================
       MENUS RECRUTEMENT / SERVICES
       ===================================================== */

    if (interaction.isStringSelectMenu()) {

        const value = interaction.values[0];


        /* =========================
           RECRUTEMENT
           ========================= */

        if (id === 'menu_ticket_postop_recrutement') {

            const postNames = {
                rec_distillateur:
                    'Maître Distillateur / Assistant',

                rec_chauffeur:
                    'Chauffeur / Livreur Terrain',

                rec_securite:
                    'Agent de Sécurité & Escorte'
            };


            const modal = new ModalBuilder()
                .setCustomId(
                    `mod_postop_recrutement_${value}`
                )
                .setTitle(
                    `Candidature — ${postNames[value] || 'Poste'}`
                )
                .addComponents(

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


        /* =========================
           SERVICES
           ========================= */

        if (id === 'menu_ticket_postop_service') {

            const serviceNames = {
                srv_support:
                    'Assistance & Support Client',

                srv_autre:
                    'Partenariat / Demande commerciale'
            };


            const modal = new ModalBuilder()
                .setCustomId(
                    `mod_postop_service_${value}`
                )
                .setTitle(
                    `Service — ${serviceNames[value] || 'Support'}`
                )
                .addComponents(

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


        /* =========================
           STAFF
           ========================= */

        if (id.startsWith('menu_staff_postop_')) {

            const member = interaction.member;

            const hasStaffRole =
                member.roles.cache.some(
                    role =>
                        CONFIG_POSTOP.staffRoles.includes(role.id)
                );


            if (!hasStaffRole) {

                return await interaction.reply({
                    content:
                        'Accès restreint aux membres habilités.',
                    flags: [MessageFlags.Ephemeral]
                });
            }


            const ticketId = id.replace(
                'menu_staff_postop_',
                ''
            );

            const action = interaction.values[0];

            const message = interaction.message;
            const oldEmbed = message.embeds[0];


            /* =========================
               CLAIM
               ========================= */

            if (action === 'claim') {

                if (
                    oldEmbed.description.includes(
                        'Dossier pris en charge par'
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
                        'Dossier assigné à votre profil.',
                    flags: [MessageFlags.Ephemeral]
                });
            }


            /* =========================
               MODIFY
               ========================= */

            if (action === 'modify') {

                const modal = new ModalBuilder()
                    .setCustomId(
                        `mod_postop_edit_${ticketId}`
                    )
                    .setTitle('Mise à jour du dossier')
                    .addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('nouveau_contenu')
                                .setLabel(
                                    'Informations complémentaires'
                                )
                                .setStyle(TextInputStyle.Paragraph)
                                .setRequired(true)
                        )
                    );

                return await interaction.showModal(modal);
            }


            /* =========================
               CLOSE
               ========================= */

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
                                    c.name
                                        .toLowerCase()
                                        .includes('dossier traité') ||
                                    c.name
                                        .toLowerCase()
                                        .includes('archives')
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


    /* =====================================================
       MODALES
       ===================================================== */

    if (interaction.isModalSubmit()) {

        const modId = interaction.customId;


        /* =================================================
           MODIFICATION STAFF
           ================================================= */

        if (modId.startsWith('mod_postop_edit_')) {

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

                    const fetchedMessages =
                        await channel.messages.fetch({
                            limit: 10
                        });


                    const targetMessage =
                        fetchedMessages.find(
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
                            EmbedBuilder.from(oldEmbed);

                        let description =
                            oldEmbed.description;


                        description =
                            description.replace(
                                /(📄 \*\*DÉTAILS DE LA REQUÊTE\*\*|📋 \*\*DÉTAILS DE LA COMMANDE\*\*)\n[\s\S]*?(?=\n\n🏢|\n\n📋 \*\*STATUT|\n\n💵|$)/,
                                `$1\n${nouveauContenu}\n`
                            );


                        embed.setDescription(
                            description
                        );


                        await targetMessage.edit({
                            embeds: [embed]
                        });
                    }

                } catch (error) {

                    console.error(
                        '[KHATCH & VALLEY] Erreur mise à jour dossier :',
                        error
                    );

                }
            }


            return await interaction.reply({
                content:
                    'Les informations du dossier ont été actualisées.',
                flags: [MessageFlags.Ephemeral]
            });
        }


        /* =================================================
           QUANTITÉ PRODUIT
           ================================================= */

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
                getProduct(productId);


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
                Number(rawQuantity);


            if (
                !Number.isInteger(quantity) ||
                quantity < 0 ||
                quantity > 9999
            ) {

                return await interaction.reply({
                    content:
                        'Veuillez entrer une quantité entière comprise entre 0 et 9999.',
                    flags: [MessageFlags.Ephemeral]
                });
            }


            if (quantity === 0) {

                delete session.items[product.id];

            } else {

                session.items[product.id] =
                    quantity;

            }


            return await interaction.reply({
                ...buildCatalogView(userId),
                flags: [MessageFlags.Ephemeral]
            });
        }


        /* =================================================
           CHECKOUT CATALOGUE
           ================================================= */

        if (
            modId === 'mod_catalog_checkout'
        ) {

            const guild =
                interaction.guild;

            const user =
                interaction.user;


            const entries =
                Object.entries(session.items)
                    .filter(
                        ([_, quantity]) =>
                            quantity > 0
                    );


            if (entries.length === 0) {

                return await interaction.reply({
                    content:
                        'Votre devis est vide.',
                    flags: [MessageFlags.Ephemeral]
                });
            }


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

            const notes =
                interaction.fields.getTextInputValue(
                    'notes'
                ) ||
                'Aucune instruction particulière.';


            let recapItems = '';
            let total = 0;


            for (
                const [productId, quantity]
                of entries
            ) {

                const product =
                    getProduct(productId);

                if (!product) continue;


                const subtotal =
                    product.prix * quantity;

                total += subtotal;


                recapItems +=
                    `**${product.code} · ${product.nom}**\n` +
                    `${quantity} × $${product.prix} = **$${subtotal}**\n\n`;
            }


            /* =============================================
               CATÉGORIE DOSSIERS
               ============================================= */

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
                        name: 'DOSSIERS EN COURS',
                        type:
                            ChannelType.GuildCategory
                    });
            }


            /* =============================================
               PERMISSIONS
               ============================================= */

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


            /* =============================================
               NOM DU TICKET
               ============================================= */

            const cleanUsername =
                user.username
                    .toLowerCase()
                    .replace(
                        /[^a-z0-9]/g,
                        '-'
                    )
                    .substring(0, 60);


            const channelName =
                `cmd-${cleanUsername}`;


            const ticketChannel =
                await guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildText,
                    parent: dossierCategory.id,
                    permissionOverwrites
                });


            /* =============================================
               EMBED DOSSIER
               ============================================= */

            const embedDescription =
                `**RÉFÉRENCE :** COMMANDE — DEVIS COMMERCIAL\n\n` +

                `🏢 **CLIENT**\n` +
                `• **Titulaire :** ${prenom} ${nom}\n` +
                `• **Téléphone :** ${telephone}\n\n` +

                `📋 **PRODUITS DEMANDÉS**\n` +
                `${recapItems}` +

                `────────────────────────\n` +
                `💵 **MONTANT TOTAL : $${total}**\n\n` +

                `📝 **ÉTABLISSEMENT / INSTRUCTIONS**\n` +
                `${notes}\n\n` +

                `📋 **STATUT**\n` +
                `*Statut : En attente d'instruction.*`;


            const embedTicket =
                new EmbedBuilder()
                    .setColor(
                        CONFIG_POSTOP.colors.primary
                    )
                    .setTitle(
                        `KHATCH & VALLEY — DOSSIER #${ticketChannel.name.toUpperCase()}`
                    )
                    .setDescription(
                        embedDescription
                    )
                    .setFooter({
                        text:
                            'KHATCH & VALLEY • Département Commercial'
                    })
                    .setTimestamp();


            /* =============================================
               MENU STAFF
               ============================================= */

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
                                'Assumer le suivi du dossier'
                        },

                        {
                            label:
                                'Modifier les informations',
                            value:
                                'modify',
                            description:
                                'Ajouter une note ou corriger une information'
                        },

                        {
                            label:
                                'Clôturer le dossier',
                            value:
                                'close',
                            description:
                                'Archiver définitivement le dossier'
                        }

                    ]);


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


            /* =============================================
               RESET PANIER
               ============================================= */

            resetSession(userId);


            return await interaction.editReply({
                content:
                    `Votre devis a été transmis à **KHATCH & VALLEY**.\n\n` +
                    `Dossier commercial : <#${ticketChannel.id}>`
            });
        }


        /* =================================================
           RECRUTEMENT
           ================================================= */

        if (
            modId.startsWith(
                'mod_postop_recrutement_'
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

            const motivations =
                interaction.fields.getTextInputValue(
                    'motivations'
                );


            const poste =
                modId.replace(
                    'mod_postop_recrutement_',
                    ''
                );


            const postNames = {

                rec_distillateur:
                    'Maître Distillateur / Assistant',

                rec_chauffeur:
                    'Chauffeur / Livreur Terrain',

                rec_securite:
                    'Agent de Sécurité & Escorte'

            };


            const ticketChannel =
                await createStandardTicket(
                    guild,
                    user,
                    'rec',
                    'recrutement',
                    `${postNames[poste] || 'Candidature'}`
                );


            const embed =
                new EmbedBuilder()
                    .setColor(
                        CONFIG_POSTOP.colors.primary
                    )
                    .setTitle(
                        `KHATCH & VALLEY — CANDIDATURE`
                    )
                    .setDescription(

                        `**POSTE :** ${postNames[poste] || poste}\n\n` +

                        `🏢 **CANDIDAT**\n` +
                        `• **Nom :** ${prenom} ${nom}\n` +
                        `• **Téléphone :** ${telephone}\n\n` +

                        `📄 **EXPÉRIENCES & MOTIVATIONS**\n` +
                        `${motivations}\n\n` +

                        `📋 **STATUT**\n` +
                        `*Statut : En attente d'instruction.*`

                    )
                    .setFooter({
                        text:
                            'KHATCH & VALLEY • Ressources Humaines'
                    })
                    .setTimestamp();


            await sendStaffTicketMessage(
                ticketChannel,
                user,
                embed
            );


            return await interaction.editReply({
                content:
                    `Votre candidature a été transmise à **KHATCH & VALLEY** : <#${ticketChannel.id}>`
            });
        }


        /* =================================================
           SERVICES
           ================================================= */

        if (
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

            const requete =
                interaction.fields.getTextInputValue(
                    'requete'
                );


            const service =
                modId.replace(
                    'mod_postop_service_',
                    ''
                );


            const serviceNames = {

                srv_support:
                    'Assistance & Support Client',

                srv_autre:
                    'Partenariat / Demande commerciale'

            };


            const ticketChannel =
                await createStandardTicket(
                    guild,
                    user,
                    'srv',
                    'service',
                    `${serviceNames[service] || 'Demande'}`
                );


            const embed =
                new EmbedBuilder()
                    .setColor(
                        CONFIG_POSTOP.colors.primary
                    )
                    .setTitle(
                        'KHATCH & VALLEY — DEMANDE DE SERVICE'
                    )
                    .setDescription(

                        `**TYPE :** ${serviceNames[service] || service}\n\n` +

                        `🏢 **DEMANDEUR**\n` +
                        `• **Nom :** ${prenom} ${nom}\n` +
                        `• **Téléphone :** ${telephone}\n\n` +

                        `📄 **DÉTAILS DE LA REQUÊTE**\n` +
                        `${requete}\n\n` +

                        `📋 **STATUT**\n` +
                        `*Statut : En attente d'instruction.*`

                    )
                    .setFooter({
                        text:
                            'KHATCH & VALLEY • Support & Services'
                    })
                    .setTimestamp();


            await sendStaffTicketMessage(
                ticketChannel,
                user,
                embed
            );


            return await interaction.editReply({
                content:
                    `Votre demande a été transmise à **KHATCH & VALLEY** : <#${ticketChannel.id}>`
            });
        }
    }
}


/* =========================================================
   CRÉATION TICKET STANDARD
   ========================================================= */

async function createStandardTicket(
    guild,
    user,
    prefix,
    categoryName,
    subject
) {

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


    const cleanUsername =
        user.username
            .toLowerCase()
            .replace(
                /[^a-z0-9]/g,
                '-'
            )
            .substring(0, 60);


    return await guild.channels.create({

        name:
            `${prefix}-${cleanUsername}`,

        type:
            ChannelType.GuildText,

        parent:
            dossierCategory.id,

        permissionOverwrites

    });
}


/* =========================================================
   MESSAGE TICKET STAFF
   ========================================================= */

async function sendStaffTicketMessage(
    ticketChannel,
    user,
    embed
) {

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
                        'Assumer le suivi du dossier'
                },

                {
                    label:
                        'Modifier les informations',
                    value:
                        'modify',
                    description:
                        'Ajouter une note ou corriger une information'
                },

                {
                    label:
                        'Clôturer le dossier',
                    value:
                        'close',
                    description:
                        'Archiver définitivement le dossier'
                }

            ]);


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
            embed
        ],

        components: [
            new ActionRowBuilder()
                .addComponents(
                    staffSelectMenu
                )
        ]

    });
}


/* =========================================================
   EXPORTS
   ========================================================= */

module.exports = {
    initPostOpPanels,
    handlePostOpInteraction
};
