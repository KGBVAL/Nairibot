const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionFlagsBits, MessageFlags } = require('discord.js');

const CONFIG_POSTOP = {
    staffRoles: ['1539267928762097770', '1539400476536217690'],
    channels: {
        commandes: '1547194706671308860',
        recrutement: '1547194709049479178',
        service: '1547194707799703563'
    }
};

// Catalogue officiel de la Distillerie Areni
const CATALOGUE_PRODUITS = [
    {
        id: 'prod_1',
        code: '01',
        nom: 'KHATCH LAGER',
        type: 'Bière Blonde',
        prix: 45,
        desc: 'Lager blonde légère, sèche et très clean. Brassée selon un procédé traditionnel garantissant une limpidité exceptionnelle et une fraîcheur idéale pour la consommation en établissement.',
        image: 'https://www.upload.ee/image/19756742/biere.png'
    },
    {
        id: 'prod_2',
        code: '02',
        nom: 'KHATCH VALLEY WHISKY',
        type: 'American Whiskey',
        prix: 180,
        desc: 'American whiskey d exception avec une maturation prolongée en fûts de chêne arménien. Notes boisées profondes, arômes vanillés et texture enveloppante en fin de bouche.',
        image: 'https://www.upload.ee/image/19756745/Whisky.png'
    },
    {
        id: 'prod_3',
        code: '03',
        nom: 'KHATCH VODKA',
        type: 'Vodka Pure',
        prix: 120,
        desc: 'Vodka ultra-pure élaborée à base de blé sélectionné, filtration minutieuse et finition remarquablement douce. Pureté absolue et profil aromatique neutre et racé.',
        image: 'https://www.upload.ee/image/19756746/vodka.png'
    },
    {
        id: 'prod_4',
        code: '04',
        nom: 'KHATCH BOTANICAL GIN',
        type: 'Gin Artisanal',
        prix: 150,
        desc: 'Gin d auteur aux botaniques arméniennes exclusives : genièvre, abricot sec, coriandre et sélection d herbes sauvages des hauts plateaux. Complexe, aromatique et ciselé.',
        image: 'https://www.upload.ee/image/19756748/GIN-Photoroom.png'
    },
    {
        id: 'prod_5',
        code: '05',
        nom: 'VALLEY RUM',
        type: 'Rhum Ambré',
        prix: 165,
        desc: 'Rhum ambré de caractère, pensé autour de notes subtiles de vanille bourbon et de fruits mûrs. Équilibre parfait entre puissance chaleureuse et rondeur.',
        image: 'https://www.upload.ee/image/19756750/rum.jpg'
    },
    {
        id: 'prod_6',
        code: '06',
        nom: 'KHATCH BLANCO',
        type: 'Tequila Blanco',
        prix: 190,
        desc: 'Tequila blanco premium à l identité minimaliste et incisive. Fidèle aux expressions originelles de l agave, elle offre une attaque franche suivie d une persistance minérale.',
        image: 'https://www.upload.ee/image/19756751/tequila-Photoroom.png'
    },
    {
        id: 'prod_7',
        code: '07',
        nom: 'KHATCH ARMENIAN BRANDY',
        type: 'Brandy de Raisin',
        prix: 240,
        desc: 'Brandy de raisin d excellence, directement inspiré de la grande tradition séculaire arménienne. Notes de fruits confits, de noix et une complexité enivrante.',
        image: 'https://www.upload.ee/image/19756754/brandy-Photoroom.png'
    },
    {
        id: 'prod_8',
        code: '08',
        nom: 'TSIRAN',
        type: 'Liqueur d Abricot',
        prix: 135,
        desc: 'Liqueur d abricot arménien haut de gamme. Expression fidèle et charnelle du fruit, alliant onctuosité, fraîcheur naturelle et persistance aromatique remarquable.',
        image: 'https://www.upload.ee/image/19756755/liqueur-Photoroom.png'
    }
];

// Sessions de paniers individuelles en mémoire par utilisateur
const userSessions = new Map();

function getSession(userId) {
    if (!userSessions.has(userId)) {
        userSessions.set(userId, { items: {}, currentIndex: 0 });
    }
    return userSessions.get(userId);
}

// --- COMMANDES (CATALOGUE INTERACTIF) ---
function getCommandesEmbed() {
    return new EmbedBuilder()
        .setTitle('DISTILLERIE ARENI — CATALOGUE COMMERCIAL & COMMANDES')
        .setDescription('Bienvenue sur l interface de commande interactive de la Distillerie Areni.\n\nNotre catalogue met à l honneur nos productions de spiritueux et de bières d exception réservées aux établissements et aux clients exigeants.\n\nCliquez sur le bouton ci-dessous pour ouvrir votre session de commande privée et composer votre devis en temps réel.')
        .setColor(0x8B0000)
        .setFooter({ text: 'Distillerie Areni — Département Commercial' })
        .setTimestamp();
}

function getCommandesComponents() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('catalog_open_session')
            .setLabel('Ouvrir mon Catalogue Interactif')
            .setStyle(ButtonStyle.Primary)
    );
}

function buildCatalogView(userId) {
    const session = getSession(userId);
    const prod = CATALOGUE_PRODUITS[session.currentIndex];
    const currentQty = session.items[prod.id] || 0;

    const embed = new EmbedBuilder()
        .setTitle(`COLLECTION ARENI — [${prod.code}] ${prod.nom}`)
        .setDescription(
            `**Catégorie :** ${prod.type}\n` +
            `**Prix unitaire :** $${prod.prix}\n\n` +
            `**Description :**\n${prod.desc}\n\n` +
            `-----------------------------------\n` +
            `*Quantité actuellement dans votre panier pour cet article :* **${currentQty}**`
        )
        .setColor(0x8B0000)
        .setImage(prod.image)
        .setFooter({ text: `Article ${session.currentIndex + 1} sur ${CATALOGUE_PRODUITS.length} • Session Privée` });

    const navRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('cat_prev').setLabel('◄ Précédent').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('cat_next').setLabel('Suivant ►').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('cat_view_cart').setLabel('Consulter mon Devis').setStyle(ButtonStyle.Success)
    );

    const qtyRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('qty_minus').setLabel('- 5').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('qty_minus_1').setLabel('- 1').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('qty_plus_1').setLabel('+ 1').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('qty_plus').setLabel('+ 5').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('qty_clear').setLabel('Retirer du panier').setStyle(ButtonStyle.Secondary)
    );

    return { embeds: [embed], components: [navRow, qtyRow] };
}

function buildCartView(userId) {
    const session = getSession(userId);
    const entries = Object.entries(session.items);

    let total = 0;
    let descriptionText = '';

    if (entries.length === 0) {
        descriptionText = 'Votre panier est actuellement vide.';
    } else {
        descriptionText = '**Récapitulatif des articles sélectionnés :**\n\n';
        for (const [prodId, qty] of entries) {
            const product = CATALOGUE_PRODUITS.find(p => p.id === prodId);
            if (product && qty > 0) {
                const subtotal = product.prix * qty;
                total += subtotal;
                descriptionText += `• **[${product.code}] ${product.nom}** x${qty} — **$${subtotal}** ($${product.prix} / unité)\n`;
            }
        }
        descriptionText += `\n-----------------------------------\n### **MONTANT TOTAL DU DEVIS : $${total}**`;
    }

    const embed = new EmbedBuilder()
        .setTitle('DISTILLERIE ARENI — DEVIS ET PANIER ACTUEL')
        .setDescription(descriptionText)
        .setColor(0x8B0000)
        .setFooter({ text: 'Validation définitive requise pour transmission au service commercial.' });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('cat_back_catalog').setLabel('◄ Retour au Catalogue').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('cart_validate').setLabel('Valider et Transmettre le Devis').setStyle(ButtonStyle.Success)
    );

    return { embeds: [embed], components: [row] };
}

// --- RECRUTEMENT ---
function getRecrutementEmbed() {
    return new EmbedBuilder()
        .setTitle('DISTILLERIE ARENI — RECRUTEMENT')
        .setDescription('Intégrez les rangs de la Distillerie Areni et participez activement à nos opérations sur le terrain selon vos compétences et vos qualifications.\n\nSélectionnez le poste ou la filière souhaitée via le sélecteur ci-dessous.')
        .setColor(0x8B0000)
        .setFooter({ text: 'Distillerie Areni • Ressources Humaines' })
        .setTimestamp();
}

function getRecrutementComponents() {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('menu_ticket_postop_recrutement')
            .setPlaceholder('Sélectionner un poste à pourvoir...')
            .addOptions([
                { label: 'Maître Distillateur / Assistant', value: 'rec_distillateur', description: 'Participer à la fabrication et à la mise en fût' },
                { label: 'Chauffeur / Livreur Terrain', value: 'rec_chauffeur', description: 'Assurer les transports et le transit des cargaisons' },
                { label: 'Agent de Sécurité & Escorte', value: 'rec_securite', description: 'Protéger les convois et sécuriser les périmètres' }
            ])
    );
}

// --- SERVICES & SUPPORT ---
function getServiceEmbed() {
    return new EmbedBuilder()
        .setTitle('DISTILLERIE ARENI — SUPPORT & SERVICES')
        .setDescription('Besoin d assistance technique, de renseignements généraux ou d un service particulier ? Ouvrez un dossier auprès de notre permanence via le sélecteur ci-dessous.')
        .setColor(0x8B0000)
        .setFooter({ text: 'Distillerie Areni • Support & Services' })
        .setTimestamp();
}

function getServiceComponents() {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('menu_ticket_postop_service')
            .setPlaceholder('Sélectionner un type de service...')
            .addOptions([
                { label: 'Assistance & Support Client', value: 'srv_support', description: 'Poser une question ou régler un litige' },
                { label: 'Partenariat / Autre Demande', value: 'srv_autre', description: 'Proposer une collaboration ou un contrat spécifique' }
            ])
    );
}

// --- INITIALISATION DES PANNEAUX ---
async function initPostOpPanels(guild) {
    const client = guild.client;

    if (!client._postopListenerRegistered) {
        client._postopListenerRegistered = true;
        client.on('interactionCreate', async (interaction) => {
            try {
                await handlePostOpInteraction(interaction);
            } catch (err) {
                console.error("Erreur critique interaction PostOp:", err);
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
            const botMsg = msgs.find(m => m.author.id === client.user.id && m.embeds[0]?.title?.includes('CATALOGUE COMMERCIAL'));
            if (!botMsg) {
                await cmdChan.send({ embeds: [getCommandesEmbed()], components: [getCommandesComponents()] });
            } else {
                await botMsg.edit({ embeds: [getCommandesEmbed()], components: [getCommandesComponents()] });
            }
        } catch (e) {
            console.error("[POSTOP] Erreur salon Commandes :", e);
        }
    }

    if (recChan) {
        try {
            const msgs = await recChan.messages.fetch({ limit: 10 });
            const botMsg = msgs.find(m => m.author.id === client.user.id && m.embeds[0]?.title?.includes('RECRUTEMENT'));
            if (!botMsg) {
                await recChan.send({ embeds: [getRecrutementEmbed()], components: [getRecrutementComponents()] });
            } else {
                await botMsg.edit({ embeds: [getRecrutementEmbed()], components: [getRecrutementComponents()] });
            }
        } catch (e) {
            console.error("[POSTOP] Erreur salon Recrutement :", e);
        }
    }

    if (srvChan) {
        try {
            const msgs = await srvChan.messages.fetch({ limit: 10 });
            const botMsg = msgs.find(m => m.author.id === client.user.id && m.embeds[0]?.title?.includes('SUPPORT & SERVICES'));
            if (!botMsg) {
                await srvChan.send({ embeds: [getServiceEmbed()], components: [getServiceComponents()] });
            } else {
                await botMsg.edit({ embeds: [getServiceEmbed()], components: [getServiceComponents()] });
            }
        } catch (e) {
            console.error("[POSTOP] Erreur salon Service :", e);
        }
    }
}

// --- GESTIONNAIRE D'INTERACTIONS ---
async function handlePostOpInteraction(interaction) {
    const id = interaction.customId;
    if (!id) return;

    const isPostOpAction = id === 'catalog_open_session' || id.startsWith('cat_') || id.startsWith('qty_') || id === 'cart_validate' || id === 'menu_ticket_postop_recrutement' || id === 'menu_ticket_postop_service' || id.startsWith('mod_postop_') || id.startsWith('mod_catalog_checkout') || id.startsWith('menu_staff_postop_') || id.startsWith('mod_postop_edit_');
    if (!isPostOpAction) return;

    if (interaction.handledByPostOp) return;
    interaction.handledByPostOp = true;

    const userId = interaction.user.id;
    const session = getSession(userId);

    // 1. Ouverture du catalogue interactif personnel
    if (id === 'catalog_open_session') {
        session.currentIndex = 0;
        const view = buildCatalogView(userId);
        return await interaction.reply({ ...view, flags: [MessageFlags.Ephemeral] });
    }

    // 2. Navigation et gestion du catalogue
    if (id === 'cat_prev') {
        session.currentIndex = (session.currentIndex - 1 + CATALOGUE_PRODUITS.length) % CATALOGUE_PRODUITS.length;
        return await interaction.update(buildCatalogView(userId));
    }
    if (id === 'cat_next') {
        session.currentIndex = (session.currentIndex + 1) % CATALOGUE_PRODUITS.length;
        return await interaction.update(buildCatalogView(userId));
    }
    if (id === 'cat_view_cart') {
        return await interaction.update(buildCartView(userId));
    }
    if (id === 'cat_back_catalog') {
        return await interaction.update(buildCatalogView(userId));
    }

    // Gestion des quantités du produit actif
    if (id.startsWith('qty_')) {
        const currentProd = CATALOGUE_PRODUITS[session.currentIndex];
        if (!session.items[currentProd.id]) session.items[currentProd.id] = 0;

        if (id === 'qty_plus_1') session.items[currentProd.id] += 1;
        if (id === 'qty_plus') session.items[currentProd.id] += 5;
        if (id === 'qty_minus_1') session.items[currentProd.id] = Math.max(0, session.items[currentProd.id] - 1);
        if (id === 'qty_minus') session.items[currentProd.id] = Math.max(0, session.items[currentProd.id] - 5);
        if (id === 'qty_clear') session.items[currentProd.id] = 0;

        if (session.items[currentProd.id] === 0) {
            delete session.items[currentProd.id];
        }

        return await interaction.update(buildCatalogView(userId));
    }

    // 3. Demande de validation du panier (ouverture de la modale devis)
    if (id === 'cart_validate') {
        const entries = Object.entries(session.items);
        if (entries.length === 0) {
            return await interaction.reply({ content: 'Votre panier est vide. Veuillez sélectionner au moins un produit.', flags: [MessageFlags.Ephemeral] });
        }
        const modal = new ModalBuilder()
            .setCustomId('mod_catalog_checkout')
            .setTitle('Validation de Commande — Devis')
            .addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('prenom').setLabel('Prénom').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nom').setLabel('Nom').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('telephone').setLabel('Téléphone').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('notes').setLabel('Instructions de livraison / Établissement').setStyle(TextInputStyle.Paragraph).setRequired(false))
            );
        return await interaction.showModal(modal);
    }

    // 4. Menus de sélection (Recrutement / Service)
    if (interaction.isStringSelectMenu()) {
        const val = interaction.values[0];

        if (id === 'menu_ticket_postop_recrutement') {
            const postNames = { 'rec_distillateur': 'Maître Distillateur / Assistant', 'rec_chauffeur': 'Chauffeur / Livreur Terrain', 'rec_securite': 'Agent de Sécurité & Escorte' };
            const modal = new ModalBuilder()
                .setCustomId(`mod_postop_recrutement_${val}`)
                .setTitle(`Candidature — ${postNames[val] || 'Poste'}`)
                .addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('prenom').setLabel('Prénom').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nom').setLabel('Nom').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('telephone').setLabel('Téléphone').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('motivations').setLabel('Expériences & Motivations').setStyle(TextInputStyle.Paragraph).setRequired(true))
                );
            return await interaction.showModal(modal);
        }

        if (id === 'menu_ticket_postop_service') {
            const srvNames = { 'srv_support': 'Assistance & Support Client', 'srv_autre': 'Partenariat / Autre Demande' };
            const modal = new ModalBuilder()
                .setCustomId(`mod_postop_service_${val}`)
                .setTitle(`Service — ${srvNames[val] || 'Support'}`)
                .addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('prenom').setLabel('Prénom').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nom').setLabel('Nom').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('telephone').setLabel('Téléphone').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('requete').setLabel('Objet de votre demande').setStyle(TextInputStyle.Paragraph).setRequired(true))
                );
            return await interaction.showModal(modal);
        }

        // Actions du staff dans les tickets
        if (id.startsWith('menu_staff_postop_')) {
            const member = interaction.member;
            const hasStaffRole = member.roles.cache.some(role => CONFIG_POSTOP.staffRoles.includes(role.id));

            if (!hasStaffRole) {
                return await interaction.reply({ content: 'Accès restreint aux membres habilités.', flags: [MessageFlags.Ephemeral] });
            }

            const ticketId = id.replace('menu_staff_postop_', '');
            const actionVal = interaction.values[0];
            const message = interaction.message;
            const oldEmbed = message.embeds[0];

            if (actionVal === 'claim') {
                if (oldEmbed.description.includes('Pris en charge par')) {
                    return await interaction.reply({ content: 'Ce dossier a déjà été pris en charge.', flags: [MessageFlags.Ephemeral] });
                }
                const embed = EmbedBuilder.from(oldEmbed);
                embed.setDescription(oldEmbed.description.replace('*Statut : En attente d\'instruction.*', `*Statut : Dossier pris en charge par **${member.user.tag}***`));
                await message.edit({ embeds: [embed], components: message.components });
                return await interaction.reply({ content: 'Dossier assigné à votre profil avec succès.', flags: [MessageFlags.Ephemeral] });
            }

            if (actionVal === 'modify') {
                const modal = new ModalBuilder()
                    .setCustomId(`mod_postop_edit_${ticketId}`)
                    .setTitle('Mise à jour du dossier')
                    .addComponents(
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nouveau_contenu').setLabel('Informations complémentaires / Consignes').setStyle(TextInputStyle.Paragraph).setRequired(true))
                    );
                return await interaction.showModal(modal);
            }

            if (actionVal === 'close') {
                await interaction.reply({ content: 'Clôture administrative du dossier en cours...', flags: [MessageFlags.Ephemeral] });
                setTimeout(async () => {
                    try {
                        const channel = interaction.channel;
                        const closedCategory = channel.guild.channels.cache.find(c => c.name.toLowerCase().includes('dossier traité') || c.name.toLowerCase().includes('archives'));
                        if (closedCategory) {
                            await channel.setParent(closedCategory.id);
                            await channel.permissionOverwrites.set([
                                { id: channel.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                                ...CONFIG_POSTOP.staffRoles.map(rId => ({ id: rId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory] }))
                            ]);
                            await channel.setName(`archive-${channel.name}`.substring(0, 100));
                        } else {
                            await channel.delete('Dossier clôturé.');
                        }
                    } catch (err) {
                        console.error("Erreur clôture :", err);
                    }
                }, 5000);
                return;
            }
        }
    }

    // 5. Soumission des modales (Recrutement, Services, Édition Staff et Validation du Catalogue)
    if (interaction.isModalSubmit()) {
        const modId = interaction.customId;

        if (modId.startsWith('mod_postop_edit_')) {
            const ticketId = modId.replace('mod_postop_edit_', '');
            const nouveauContenu = interaction.fields.getTextInputValue('nouveau_contenu');
            const channel = interaction.guild.channels.cache.get(ticketId);

            if (channel) {
                try {
                    const fetchedMsg = await channel.messages.fetch({ limit: 10 });
                    const targetMsg = fetchedMsg.find(m => m.embeds.length > 0 && m.embeds[0].title?.includes('DOSSIER'));
                    if (targetMsg) {
                        const oldEmbed = targetMsg.embeds[0];
                        const embed = EmbedBuilder.from(oldEmbed);
                        let desc = oldEmbed.description;
                        desc = desc.replace(/(📄 \*\*DÉTAILS DE LA REQUÊTE\*\*|📋 \*\*DETAILS DE LA COMMANDE\*\*)\n[\s\S]*?(?=\n\n🏢|$)/, `$1\n${nouveauContenu}\n`);
                        embed.setDescription(desc);
                        await targetMsg.edit({ embeds: [embed] });
                    }
                } catch (err) {
                    console.error("Erreur MAJ message :", err);
                }
            }
            return await interaction.reply({ content: 'Les éléments du dossier ont été actualisés avec succès.', flags: [MessageFlags.Ephemeral] });
        }

        // Création du salon ticket pour le catalogue ou les formulaires
        if (modId === 'mod_catalog_checkout' || modId.startsWith('mod_postop_recrutement_') || modId.startsWith('mod_postop_service_')) {
            const guild = interaction.guild;
            const user = interaction.user;

            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

            let typeLabel = '';
            let subType = '';
            let recapItems = '';
            let total = 0;
            let champPrincipal = '';

            const prenom = interaction.fields.getTextInputValue('prenom');
            const nom = interaction.fields.getTextInputValue('nom');
            const telephone = interaction.fields.getTextInputValue('telephone');

            if (modId === 'mod_catalog_checkout') {
                typeLabel = 'commandes';
                subType = 'Catalogue Interactif';
                const entries = Object.entries(session.items);
                for (const [prodId, qty] of entries) {
                    const product = CATALOGUE_PRODUITS.find(p => p.id === prodId);
                    if (product && qty > 0) {
                        const subtotal = product.prix * qty;
                        total += subtotal;
                        recapItems += `• **[${product.code}] ${product.nom}** x${qty} — **$${subtotal}**\n`;
                    }
                }
                champPrincipal = interaction.fields.getTextInputValue('notes') || 'Aucune instruction particulière.';
                session.items = {}; // Nettoyage panier
            } else if (modId.startsWith('mod_postop_recrutement_')) {
                typeLabel = 'recrutement';
                subType = modId.replace('mod_postop_recrutement_', '');
                champPrincipal = interaction.fields.getTextInputValue('motivations');
            } else if (modId.startsWith('mod_postop_service_')) {
                typeLabel = 'support & services';
                subType = modId.replace('mod_postop_service_', '');
                champPrincipal = interaction.fields.getTextInputValue('requete');
            }

            let dossierCategory = guild.channels.cache.find(
                c => c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes('dossier en cours')
            );
            if (!dossierCategory) {
                dossierCategory = await guild.channels.create({
                    name: 'DOSSIER EN COURS',
                    type: ChannelType.GuildCategory
                });
            }

            const permissionOverwrites = [
                { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
            ];
            for (const roleId of CONFIG_POSTOP.staffRoles) {
                permissionOverwrites.push({ id: roleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });
            }

            const prefixMap = { 'commandes': 'cmd', 'recrutement': 'rec', 'support & services': 'srv' };
            const cleanChannelName = `${prefixMap[typeLabel] || 'ticket'}-${user.username}`.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 90);
            
            const ticketChannel = await guild.channels.create({
                name: cleanChannelName,
                type: ChannelType.GuildText,
                parent: dossierCategory.id,
                permissionOverwrites: permissionOverwrites
            });

            let embedDescription = '';
            if (modId === 'mod_catalog_checkout') {
                embedDescription = 
                    `**RÉFÉRENCE :** ${typeLabel.toUpperCase()} (${subType})\n\n` +
                    `🏢 **IDENTIFICATION DU CLIENT**\n` +
                    `• **Titulaire :** ${prenom} ${nom}\n` +
                    `• **Ligne directe :** ${telephone}\n\n` +
                    `📋 **DETAILS DE LA COMMANDE**\n` +
                    `${recapItems}\n` +
                    `-----------------------------------\n` +
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

            const embedTicket = new EmbedBuilder()
                .setTitle(`DISTILLERIE ARENI — DOSSIER #${ticketChannel.name.toUpperCase()}`)
                .setDescription(embedDescription)
                .setColor(0x8B0000)
                .setFooter({ text: 'Distillerie Areni • Département Opérationnel' })
                .setTimestamp();

            const staffSelectMenu = new StringSelectMenuBuilder()
                .setCustomId(`menu_staff_postop_${ticketChannel.id}`)
                .setPlaceholder('Gestion administrative du dossier...')
                .addOptions([
                    { label: 'Prendre en charge', value: 'claim', description: 'Assumer la responsabilité opérationnelle du dossier' },
                    { label: 'Modifier les informations', value: 'modify', description: 'Ajouter des notes ou mettre à jour le contenu' },
                    { label: 'Clôturer le dossier', value: 'close', description: 'Archiver et clore définitivement la procédure' }
                ]);

            await ticketChannel.send({
                content: `<@${user.id}> ${CONFIG_POSTOP.staffRoles.map(rId => `<@&${rId}>`).join(' ')}`,
                embeds: [embedTicket],
                components: [new ActionRowBuilder().addComponents(staffSelectMenu)]
            });

            return await interaction.editReply({ content: `Votre dossier a été enregistré avec succès : <#${ticketChannel.id}>` });
        }
    }
}

module.exports = { initPostOpPanels, handlePostOpInteraction };
