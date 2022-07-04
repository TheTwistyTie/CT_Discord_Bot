import { ApplicationCommand, BaseCommandInteraction, ButtonInteraction, Guild, Message, MessageActionRow, MessageButton, MessageSelectMenu, SelectMenuInteraction } from "discord.js";
import { existsSync, fstat, mkdirSync, readFile, readFileSync, writeFile, writeFileSync } from "fs";
import regionSchema from "../schema/region-schema";
import configSchema from "../schema/config-schema";
import guildIdSchema from "../schema/guildId-schema";

export default async (interaction: BaseCommandInteraction): Promise<void> => {
    if(!interaction.inCachedGuild()) return;

    let dbConnection = await guildIdSchema.findOne({guildId: interaction.guild.id})

    if(!dbConnection) {

        let moderatorRole = await interaction.guild.roles.create({
            name: 'Moderator',
            color: 'BLURPLE'
        })

        let resourceAdder = await interaction.guild.roles.create({
            name: 'Resource Adder',
            color: 'AQUA'
        })
    
        let heRole = await interaction.guild.roles.create({
            name: 'HE/HIM',
            color: 'DARK_PURPLE'
        })

        let sheRole = await interaction.guild.roles.create({
            name: 'SHE/HER',
            color: 'DARK_PURPLE'
        })

        let theyRole = await interaction.guild.roles.create({
            name: 'THEY/THEM',
            color: 'DARK_PURPLE'
        })

        let otherRole = await interaction.guild.roles.create({
            name: 'OTHER',
            color: 'DARK_PURPLE'
        })

        let gameNight = await interaction.guild.roles.create({
            name: 'Game Night',
            color: 'RANDOM'
        })

        let meetUp = await interaction.guild.roles.create({
            name: 'Meet Ups',
            color: 'RANDOM'
        })

        let events = await interaction.guild.roles.create({
            name: 'Events',
            color: 'RANDOM'
        })

        dbConnection = await new guildIdSchema({
            guildId: interaction.guild.id,
            guildName: interaction.guild.name,
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
                .setStyle('PRIMARY'),

            new MessageButton()
                .setCustomId('customRegions')
                .setLabel('Set custom regions')
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
            case 'customRegions':
                customRegion(btnInt)
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

async function customRegion(interaction: ButtonInteraction) {
    if(!interaction.inCachedGuild()) return;

    let regionTypes = await regionSchema.findOne({guildId: interaction.guild.id})

    let text = ''
    let hasRegions = false;
    if(!regionTypes){
        text = 'You currently have no regions, would you like to add one?'
    } else {
        text = `You have ${regionTypes.regions.length} regions, would you like to view them or add more?`
        hasRegions = true;
    }

    let row = new MessageActionRow()

    let viewButton;
    if(hasRegions) {
        viewButton = new MessageButton()
            .setCustomId('view')
            .setLabel('View')
            .setStyle('PRIMARY')
    } else {
        viewButton = new MessageButton()
            .setCustomId('view')
            .setLabel('View')
            .setStyle('PRIMARY')
            .setDisabled(true)
    }

    let addButton = new MessageButton()
        .setCustomId('add')
        .setLabel('Add')
        .setStyle('PRIMARY')

    row.addComponents(
        viewButton,
        addButton
    )

    let regionMsg = await interaction.reply({
        content: text,
        components: [row],
        fetchReply: true
    })

    let collector = regionMsg.createMessageComponentCollector({max: 1})
    collector.on('collect', async (regionBtnInt: ButtonInteraction) => {
        switch(regionBtnInt.customId) {
            case 'view':
                viewRegions(regionBtnInt)
                break;
            case 'add':
                createRegion(regionBtnInt)
                break;
        }
    })
}

async function createRegion(interaction: ButtonInteraction) {
    if(!interaction.inCachedGuild()) return;

    let createRegionMessage = await interaction.reply({
        content: 'What is the region called?',
        fetchReply: true
    });

    let collector = interaction.channel?.createMessageCollector({max: 1})
    collector?.on('collect', async (regionMessage) => {
        let region = regionMessage.content;

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('continue')
                    .setLabel('Continue')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('cancel')
                    .setLabel('Cancel')
                    .setStyle('DANGER')
            )

        const btnMsg = await interaction.editReply({
            content: `Recieved: ${region}`,
            components: [row],
        })

        const confCollector = btnMsg.createMessageComponentCollector({
            max: 1
        })

        confCollector.on('collect', async (confBtnInt: ButtonInteraction) => {
            if(confBtnInt.customId === 'continue') {
                interaction.editReply({
                    content: 'Confimed',
                    components: [],
                })

                let regionTypes = await regionSchema.findOne({guildId: interaction.guild.id}) 

                if(!regionTypes) {
                    regionTypes = new regionSchema({guildId: interaction.guild.id})
                }

                let regionRole = await interaction.guild.roles.create({
                    name: region,
                    color: 'GREEN'
                })

                regionTypes.regions.push({
                    name: region,
                    roleId: regionRole.id,
                    resourceNumber: 0,
                    restaurantNumber: 0,
                })

                regionTypes.save()

            } else {
                interaction.editReply({
                    content: 'Canceled',
                    components: [],
                })
            }
        })
    })
}

async function viewRegions(interaction: ButtonInteraction) {
    if(!interaction.inCachedGuild()) return;

    let regions = await regionSchema.findOne({guildId: interaction.guild.id})
    let text = ''
    if(regions.regions.length == 1) {
        text = `You have one region:\n\t${regions.regions[0].name}`
    } else {
        text = `You hvae ${regions.regions.length} regions:\n`
        for(let i = 0; i < regions.regions.length; i++){
            text += `\t${regions.regions[i].name}\n`
        }
    }

    interaction.reply({
        content: text
    })
}