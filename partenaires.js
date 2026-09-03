const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const ROLE_NAME = "DIRECTEUR";
// Couleur Marron / Or de la nouvelle DA (0xC5A059)
const BRAND_COLOR = 0xC5A059;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('partenaires')
        .setDescription("Affiche le panneau de gestion du réseau de partenaires (Réservé à la Direction)")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const hasRole = interaction.member.roles.cache.some(r => r.name === ROLE_NAME) || interaction.member.permissions.has(PermissionFlagsBits.Administrator);
        
        if (!hasRole) {
            return await interaction.reply({
                content: "❌ Accès refusé. Ce terminal est strictement réservé au rôle **DIRECTEUR**.",
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor(BRAND_COLOR)
            .setTitle("POST OP LOGISTICS  //  RÉSEAU DE PARTENAIRES")
            .setDescription("Gestion des alliances stratégiques et du consortium d'entreprises partenaires dans le secteur du transport et du fret.\n\n**Ce que l'on cherche :** Des prestataires fiables, des entreprises de transport ou des sous-traitants capables de répondre rapidement à des surcharges de fret, des besoins de maintenance ou des lignes de transport spécifiques.\n\n**Pourquoi devenir partenaire ?**\n• Apport de contrats de transport réguliers.\n• Synergie et interconnexion professionnelle sécurisée pour le fret.\n• Partage de lignes logistiques optimisées.")
            .setFooter({ text: "POST OP LOGISTICS  •  MODULE PARTENARIAT" })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_create_partner_modal')
                .setLabel('CRÉER PARTENARIAT')
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    },
};
