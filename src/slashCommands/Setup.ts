import { ApplicationCommand, BaseCommandInteraction } from "discord.js";
import guildIdSchema from "../schema/guildId-schema";

export default async (interaction: BaseCommandInteraction): Promise<void> => {
    let dbConnection = await guildIdSchema.findOne({guildId: interaction.guild?.id})

    console.log(dbConnection)

    if(!dbConnection) {
    
        let heRole = await interaction.guild?.roles.create({
            name: 'HE/HIM',
            color: 'DARK_PURPLE'
        })

        let sheRole = await interaction.guild?.roles.create({
            name: 'SHE/HER',
            color: 'DARK_PURPLE'
        })

        let theyRole = await interaction.guild?.roles.create({
            name: 'THEY/THEM',
            color: 'DARK_PURPLE'
        })

        let otherRole = await interaction.guild?.roles.create({
            name: 'OTHER',
            color: 'DARK_PURPLE'
        })

        console.log(heRole?.id)

        dbConnection = await new guildIdSchema({
            guildId: interaction.guild?.id,
            guildName: interaction.guild?.name,
            heRoleId: heRole?.id,
            sheRoleId: sheRole?.id,
            theyRoleId: theyRole?.id,
            otherRoleId: otherRole?.id
        }).save()


    } else {
        interaction.reply({
            content: 'This server has already been set up!',
            ephemeral: true
        })
    }

    
}