import { ButtonInteraction, Message, MessageActionRow, MessageButton, SelectMenuInteraction } from "discord.js";
import ResourceData from "./ResourceData";
import {createResourceRec} from "./addResource"
import resourceTypeSchema from "../../schema/resourceType-schema";

export default async (interaction: SelectMenuInteraction, resourceData: ResourceData, messageArray: Message[]) => {
    let resourceTypes = await resourceTypeSchema.findOne({guildId: resourceData.guildId})

    if(!resourceTypes) {
        resourceTypes = new resourceTypeSchema({
            guildId: resourceData.guildId
        }).save
    }

    const msg = await interaction.reply({
        content: 'What new category of resource would you like to add?',
        fetchReply: true
    })

    messageArray.push(msg as Message)

    const collector = interaction.channel?.createMessageCollector({
        max: 1
    })

    collector?.on('collect', async message => {
        const value = message.content

        resourceTypes.types.push({
            name: value,
            number: 0
        })

        resourceTypes.save()

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('continue')
                    .setLabel('Continue')
                    .setStyle('SUCCESS')
            )

        const btnMsg = await interaction.editReply({
            content: `Add Rescource type: \'**${message.content}**\'`,
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