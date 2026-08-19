const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const ROLE_NAME = "DIRECTEUR";

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
            .setColor(0x111111)
            .setTitle("NAIRI CORPORATION  //  RÉSEAU DE PARTENAIRES")
            .setDescription("Gestion des alliances stratégiques et du consortium d'entreprises partenaires.\n\n**Ce que l'on cherche :** Des entreprises ou prestataires fiables capables de répondre rapidement à des besoins spécifiques (logistique, technique, approvisionnement, services ciblés) que nous ne couvrons pas en interne.\n\n**Pourquoi devenir partenaire ?**\n• Apport d'affaires régulier via notre réseau de clients.\n• Rémunération claire sur chaque transaction.\n• Synergie et interconnexion professionnelle sécurisée.")
            .setFooter({ text: "NAIRI CORPORATION  •  MODULE PARTENARIAT" })
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