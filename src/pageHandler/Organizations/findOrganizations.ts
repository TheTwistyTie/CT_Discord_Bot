import { BaseCommandInteraction, ButtonInteraction, DMChannel, Interaction, Message, MessageActionRow, MessageButton, MessageSelectMenu, SelectMenuInteraction } from "discord.js";
import organizationTypeSchema from "../../schema/organizationType-schema";
import OrganizationData from "../../resources/organizations/OrganizationData";
import organizationSchema from "../../schema/organization-schema";
import OrganizationObject from "./OrganizationObject";
import PageHandler from "./PageHandler";
import regionSchema from "../../schema/region-schema";

let pageHandler: PageHandler
let resourceFinderMessage: Message
export default async (interaction : ButtonInteraction): Promise<void> => {
    if(!interaction.inCachedGuild()) return;
    const { guild } = interaction

    let organizations = await organizationSchema.find({guildId: guild.id});
    organizations.reverse();

    let organizationList: OrganizationObject[] = []
    organizations.forEach(resource => {
        let organizationData = new OrganizationData(resource.name, resource.guildId)
        organizationData.SetData(resource)
        
        let organizationObject = new OrganizationObject(organizationData, guild, interaction.user.id, interaction.user.username)

        organizationList.push(organizationObject)
    });

    const typeList = await organizationTypeSchema.findOne({guildId: guild.id})
    let tagOptions = []
    for(let i = 0; i < typeList.types.length; i++) {
        tagOptions.push({
            label: typeList.types[i].name + ` (${typeList.types[i].number})`,
            value: typeList.types[i].name
        })
    }

    const regionList = await regionSchema.findOne({guildId: guild.id})
    let regionOptions = []
    for(let i = 0; i < regionList.regions.length; i++) {
        regionOptions.push({
            label: regionList.regions[i].name + ` (${regionList.regions[i].resourceNumber})`,
            value: regionList.regions[i].name
        })
    }

    const typeSelectMenu = new MessageSelectMenu()
        .setCustomId('typeFilter')
        .setPlaceholder('Filter by tag.')
        .setOptions(tagOptions)
        .setMinValues(1)

    const regionSelectMenu = new MessageSelectMenu()
        .setCustomId('regionFilter')
        .setPlaceholder('Filter by region.')
        .setOptions(regionOptions)
        .setMinValues(1)

    const typeActionRow = new MessageActionRow().addComponents(
        typeSelectMenu,
    )

    const regionActionRow = new MessageActionRow().addComponents(
        regionSelectMenu,
    )

    const clearButton = new MessageButton()
        .setCustomId('clear')
        .setLabel('Clear Filters')
        .setStyle('PRIMARY')

    const clearActionRow = new MessageActionRow().addComponents(
        clearButton,
    )

    resourceFinderMessage = await interaction.user.send({
        content: 'Resource Finder:',
        components: [typeActionRow, regionActionRow, clearActionRow]
    })

    pageHandler = new PageHandler(organizationList, resourceFinderMessage.channel as DMChannel, interaction.user.id)
    

    let currentFilter: OrganizationObject[] = []
    let currentTypeFilter: string[] = []
    let currentRegionFilter: string[] = []

    let collector = resourceFinderMessage.createMessageComponentCollector()
    collector.on('collect', async (int: BaseCommandInteraction) => {
        if(int.isSelectMenu()){

            clear(false)
            if(int.customId == 'typeFilter') {
                let tags = int.values

                currentTypeFilter = tags;

                if(currentFilter.length == 0) {
                    for(let i = 0; i < organizationList.length; i++) {
                        let has = false
                        let c = 0;
                        while(c < tags.length && !has) {
                            if(organizationList[i].data.HasTag(tags[c])) {
                                has = true;
                            }
                            c++
                        }
    
                        if(has) {
                            currentFilter.push(organizationList[i])
                        }
                    }
                } else {
                    currentFilter = []
                    if(currentRegionFilter.length == 0) {
                        for(let i = 0; i < organizationList.length; i++) {
                            let has = false
                            let c = 0;
                            while(c < tags.length && !has) {
                                if(organizationList[i].data.HasTag(tags[c])) {
                                    has = true;
                                }
                                c++
                            }
        
                            if(has) {
                                currentFilter.push(organizationList[i])
                            }
                        }
                    } else {
                        let tempList: OrganizationObject[] = []
                        for(let i = 0; i < organizationList.length; i++) {
                            let has = false
                            let c = 0;
                            while(c < tags.length && !has) {
                                if(organizationList[i].data.HasTag(tags[c])) {
                                    has = true;
                                }
                                c++
                            }
        
                            if(has) {
                                tempList.push(organizationList[i])
                            }
                        }

                        for(let i = 0; i< tempList.length; i++) {
                            let has = false
                            let c = 0;
                            while(c < currentRegionFilter.length && !has) {
                                if(tempList[i].data.HasRegion(currentRegionFilter[c])) {
                                    has = true;
                                }
                                c++
                            }
        
                            if(has) {
                                currentFilter.push(tempList[i])
                            }
                        }
                    }
                }

            }

            if(int.customId == 'regionFilter') {
                let regions = int.values

                currentRegionFilter = regions;

                if(currentFilter.length == 0) {
                    for(let i = 0; i < organizationList.length; i++) {
                        let has = false
                        let c = 0;
                        while(c < regions.length && !has) {
                            if(organizationList[i].data.HasRegion(regions[c])) {
                                has = true;
                            }
                            c++
                        }
    
                        if(has) {
                            currentFilter.push(organizationList[i])
                        }
                    }
                } else {
                    currentFilter = []
                    if(currentTypeFilter.length == 0) {
                        for(let i = 0; i < organizationList.length; i++) {
                            let has = false
                            let c = 0;
                            while(c < regions.length && !has) {
                                if(organizationList[i].data.HasRegion(regions[c])) {
                                    has = true;
                                }
                                c++
                            }
        
                            if(has) {
                                currentFilter.push(organizationList[i])
                            }
                        }
                    } else {
                        let tempList: OrganizationObject[] = []
                        for(let i = 0; i < organizationList.length; i++) {
                            let has = false
                            let c = 0;
                            while(c < regions.length && !has) {
                                if(organizationList[i].data.HasRegion(regions[c])) {
                                    has = true;
                                }
                                c++
                            }
        
                            if(has) {
                                tempList.push(organizationList[i])
                            }
                        }

                        for(let i = 0; i< tempList.length; i++) {
                            let has = false
                            let c = 0;
                            while(c < currentTypeFilter.length && !has) {
                                if(tempList[i].data.HasTag(currentTypeFilter[c])) {
                                    has = true;
                                }
                                c++
                            }
        
                            if(has) {
                                currentFilter.push(tempList[i])
                            }
                        }
                    }
                }
            }

            if(currentFilter.length > 0) {
                pageHandler = new PageHandler(currentFilter, resourceFinderMessage.channel as DMChannel, interaction.user.id)
            } else {
                let empty = new OrganizationData('Nothing fits this filter.', guild.id);
                empty.SetDescription('Please widen your search or ask a provider for help.')
                let emptyObj = new OrganizationObject(empty, guild, interaction.user.id, interaction.user.username)

                pageHandler = new PageHandler([emptyObj], resourceFinderMessage.channel as DMChannel, interaction.user.id)
            }

            
        } else if(int.isButton()){
            currentFilter = []
            currentRegionFilter = []
            currentTypeFilter = []
            clear(false)
            pageHandler = new PageHandler(organizationList, resourceFinderMessage.channel as DMChannel, interaction.user.id)
            
        }

        let looseEnd = await int.reply({content: 'Action taken.', fetchReply: true});
        (looseEnd as Message).delete()
    })
    
}

let doneMessage: Message;
const createDoneMessage = (channel: DMChannel) => {
    let doneMessageRow = new MessageActionRow().addComponents(
        new MessageButton()
            .setLabel('Done.')
            .setCustomId('done_button')
            .setStyle('DANGER')
    )

    setTimeout(async () => {
        doneMessage = await channel.send({
            content: ' ',
            components: [doneMessageRow],
        })

        let msgCollector = doneMessage.createMessageComponentCollector()

        msgCollector.on('collect', async (btnInt) => {
            if(btnInt.customId == 'done_button') {
                clear(true)
            }
            let looseEnd = await btnInt.reply({
                content: 'Finished.',
                fetchReply: true
            });
            (looseEnd as Message).delete()
        })
    }, 800)
}

const clear = (removeFilters: boolean) => {
    if(removeFilters) {
        resourceFinderMessage.delete()
    }
    pageHandler.clear(undefined)
    //doneMessage.delete()
}