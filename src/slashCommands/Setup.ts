import { ApplicationCommand, BaseCommandInteraction, ButtonInteraction, Message, MessageActionRow, MessageButton, MessageSelectMenu, SelectMenuInteraction } from "discord.js";
import { existsSync, fstat, mkdirSync, readFile, readFileSync, writeFile, writeFileSync } from "fs";
import configSchema from "../schema/config-schema";
import guildIdSchema from "../schema/guildId-schema";

export default async (interaction: BaseCommandInteraction): Promise<void> => {
    let dbConnection = await guildIdSchema.findOne({guildId: interaction.guild?.id})

    if(!dbConnection) {

        let moderatorRole = await interaction.guild?.roles.create({
            name: 'Moderator',
            color: 'BLURPLE'
        })

        let resourceAdder = await interaction.guild?.roles.create({
            name: 'Resource Adder',
            color: 'AQUA'
        })
    
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
            moderator: moderatorRole?.id,
            resourceAdder: resourceAdder?.id,
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
            resources: {
                resources: false,
                organizations: false,
                restaurants: false,
            }
        }).save()

    } 

    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('customRoles')
                .setLabel('Choose custom roles.')
                .setStyle('PRIMARY'),

            new MessageButton()
                .setCustomId('customResources')
                .setLabel('Choose resources')
                .setStyle('PRIMARY')
        )


    const message = await interaction.reply({
        content: 'What would you like to do?',
        components: [row],
        fetchReply: true
    });

    const collector = (message as Message).createMessageComponentCollector()

    collector.on('collect', (btnInt : ButtonInteraction) => {
        switch(btnInt.customId) {
            case 'customRoles': 
                customRoles(btnInt)
                break;
            case 'customResources':
                resources(btnInt)
                break;
        }
    })
    
}

async function resources(interaction : ButtonInteraction) {
    const options = [
        {
            label: 'Resources',
            value: 'resources'
        },
        {
            label: 'Organizations',
            value: 'organizations'
        },
        {
            label: 'Restaurants',
            value: 'restaurants'
        },
    ]

    const row = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('resourceSelect')
                .setPlaceholder('Select which resources you are using.')
                .setOptions(options)
                .setMinValues(1)
        )

    const resourceMessage = await interaction.reply({
        content: 'Which resources would you like to use?',
        components: [row],
        fetchReply: true
    })

    const resourceCollector = (resourceMessage as Message).createMessageComponentCollector()

    resourceCollector.on('collect',async (selectInt : SelectMenuInteraction) => {
        const resources = selectInt.values;
        let dbConnection = await guildIdSchema.findOne({guildId: interaction.guild?.id})

        console.log(dbConnection)
        console.log(resources)

        let resourceNames: string[] = []

        resources.forEach(resource => {
            switch(resource) {
                case 'resources' :
                    dbConnection.resources.resources = !dbConnection.resources.resources
                    resourceNames.push('resources')
                    break;
                case 'organizations' :
                    dbConnection.resources.organizations = !dbConnection.resources.organizations
                    resourceNames.push('organizations')
                    break;
                case 'restaurants' :
                    dbConnection.resources.restaurants = !dbConnection.resources.restaurants
                    resourceNames.push('restaurants')
                    break;
            }
        });

        dbConnection.save()

        console.log(resourceNames)

        let content: string
        if(resourceNames.length <= 1) {
            content = `Successfully updated ${resourceNames[0]}`
        } else if (resourceNames.length == 2) {
            content = `Successfully updated ${resourceNames[0]} and ${resourceNames[1]}`
        } else {
            content = `Successfully updated ${resourceNames[0]}, `
            for(let i = 1; i < resourceNames.length - 1; i++) {
                content += `${resourceNames[i]}, `
            }
            content += `and ${resourceNames[resourceNames.length - 1]}`
        }

        selectInt.reply({
            content: content
        })
    })
}

async function customRoles(interaction: ButtonInteraction) {
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

    customRoleCollector.on('collect', async (selectInt: SelectMenuInteraction) => {
        const roles = selectInt.values;
        let dbConnection = await guildIdSchema.findOne({guildId: interaction.guild?.id})

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

        selectInt.reply({
            content: content
        })
    })
}