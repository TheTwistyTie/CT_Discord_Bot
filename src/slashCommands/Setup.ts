import { ApplicationCommand, BaseCommandInteraction, ButtonInteraction, Message, MessageActionRow, MessageSelectMenu, SelectMenuInteraction } from "discord.js";
import { existsSync, fstat, mkdirSync, readFile, readFileSync, writeFile, writeFileSync } from "fs";
import configSchema from "../schema/config-schema";
import guildIdSchema from "../schema/guildId-schema";

export default async (interaction: BaseCommandInteraction): Promise<void> => {
    let dbConnection = await guildIdSchema.findOne({guildId: interaction.guild?.id})

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

        let gameNight = await interaction.guild?.roles.create({
            name: 'Game Night',
            color: 'RANDOM'
        })

        let meetUp = await interaction.guild?.roles.create({
            name: 'Meet Ups',
            color: 'RANDOM'
        })

        let events = await interaction.guild?.roles.create({
            name: 'Events',
            color: 'RANDOM'
        })

        console.log(heRole?.id)

        dbConnection = await new guildIdSchema({
            guildId: interaction.guild?.id,
            guildName: interaction.guild?.name,
            heRoleId: heRole?.id,
            sheRoleId: sheRole?.id,
            theyRoleId: theyRole?.id,
            otherRoleId: otherRole?.id,
            gameNight: {
                roleId: gameNight?.id,
                use: false
            },
            meetUps: {
                roleId: meetUp?.id,
                use: false
            },
            events: {
                roleId: events?.id,
                use: false
            },
        }).save()

        customRoles(interaction)

    } else {
        customRoles(interaction)
    }

    
}

async function customRoles(interaction: BaseCommandInteraction) {
    const options = [
        {
            label: 'Game Nights',
            value: 'Game Night'
        },
        {
            label: 'Meet Ups',
            value: 'Meet Up'
        },
        {
            label: 'Events',
            value: 'Events'
        },
    ]

    const row = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('customRoles')
                .setPlaceholder('Select additional roles')
                .setOptions(options)
                .setMinValues(1)
        )

    const customRoleMessage = await interaction.reply({
        content: 'Do you want to use any optional roles?',
        components: [row],
        fetchReply: true
    })

    const customRoleCollector = (customRoleMessage as Message).createMessageComponentCollector()

    customRoleCollector.on('collect', async (SelectInt: SelectMenuInteraction) => {
        const roles = SelectInt.values;
        let dbConnection = await guildIdSchema.findOne({guildId: interaction.guild?.id})

        console.log(dbConnection)
        console.log(roles)

        let roleIds: string[] = []

        roles.forEach(role => {
            switch(role) {
                case 'Game Night' :
                    dbConnection.gameNight.use = !dbConnection.gameNight.use
                    roleIds.push(dbConnection.gameNight.roleId)
                    break;
                case 'Meet Up' :
                    dbConnection.meetUps.use = !dbConnection.meetUps.use
                    roleIds.push(dbConnection.meetUps.roleId)
                    break;
                case 'Events' :
                    dbConnection.events.use = !dbConnection.events.use
                    roleIds.push(dbConnection.events.roleId)
                    break;
            }
        });

        dbConnection.save()

        console.log(roleIds)

        let content: string
        if(roleIds.length <= 1) {
            content = `Successfully updated <@&${roleIds[0]}>`
        } else if (roleIds.length == 2) {
            content = `Successfully updated <@&${roleIds[0]}> and <@&${roleIds[1]}>`
        } else {
            content = `Successfully updated <@&${roleIds[0]}>, `
            for(let i = 1; i < roleIds.length - 1; i++) {
                content += `<@&${roleIds[i]}>, `
            }
            content += `and <@&${roleIds[roleIds.length - 1]}>`
        }

        SelectInt.reply({
            content: content
        })
    })
}