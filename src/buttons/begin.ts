import { ButtonInteraction, MessageActionRow, MessageButton } from "discord.js";
import guildIdSchema from "../schema/guildId-schema";

export default async (interaction: ButtonInteraction): Promise<void> => {
    const rows = await makeRow(interaction.guild?.id)

    interaction.reply({
        content: 'What would you like to do?',
        components: rows,
        ephemeral: true
    })
}

async function makeRow(guildId: any) : Promise<MessageActionRow[]> {
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('roles')
                .setLabel('Set Roles')
                .setStyle('PRIMARY'),
        )

    const dbConnection = await guildIdSchema.findOne({guildId: guildId})

    if(dbConnection) {
        let resoUse = false;
        let orgUse = false;
        let restUse = false

        if(dbConnection.resources.resources) {
            resoUse = true
        }

        if(dbConnection.resources.organizations) {
            orgUse = true
        }

        if(dbConnection.resources.restaurants) {
            restUse = true
        }

        if(resoUse) {
            row.addComponents(
                new MessageButton()
                    .setCustomId('resources')
                    .setLabel('Find Resources')
                    .setStyle('PRIMARY')
            )
        }

        if(orgUse) {
            row.addComponents(
                new MessageButton()
                    .setCustomId('organizations')
                    .setLabel('Find Organizations')
                    .setStyle('PRIMARY')
            )
        }

        if(restUse) {
            row.addComponents(
                new MessageButton()
                    .setCustomId('restaurants')
                    .setLabel('Find Restaurants')
                    .setStyle('PRIMARY')
            )
        }
    }

    return [row]
}