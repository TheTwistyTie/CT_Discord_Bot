import { ButtonInteraction, Message, MessageActionRow, MessageButton, SelectMenuInteraction } from "discord.js";
import OrganizationData from "./OrganizationData";
import {createResourceRec} from "./addOrganization"
import organizationTypeSchema from "../../schema/organizationType-schema";

export default async (interaction: SelectMenuInteraction, resourceData: OrganizationData, messageArray: Message[]) => {
    let organizationTypes = await organizationTypeSchema.findOne({guildId: resourceData.guildId})

    if(!organizationTypes) {
        organizationTypes = new organizationTypeSchema({
            guildId: resourceData.guildId,
            types: []
        }).save()
    }

    const msg = await interaction.reply({
        content: 'What new category of organization would you like to add?',
        fetchReply: true
    })

    messageArray.push(msg as Message)

    const collector = interaction.channel?.createMessageCollector({
        max: 1
    })

    collector?.on('collect', async message => {
        const value = message.content

        if(typeof organizationTypes.types == 'undefined') {
            organizationTypes.types = []
        }

        organizationTypes.types.push({
            name: value,
            number: 0
        })

        organizationTypes.save()

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('continue')
                    .setLabel('Continue')
                    .setStyle('SUCCESS')
            )

        const btnMsg = await interaction.editReply({
            content: `Add Organization type: \'**${message.content}**\'`,
            components: [row],
        })

        const confCollector = (btnMsg as Message).createMessageComponentCollector({
            max: 1,
        })

        confCollector.on('collect', (btnInt: ButtonInteraction) => {
            createResourceRec(btnInt, resourceData, messageArray)
        })
    })


    
}