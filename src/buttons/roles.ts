import { ButtonInteraction, GuildMemberRoleManager, Message, MessageActionRow, MessageButton, MessageSelectMenu, SelectMenuInteraction } from "discord.js";
import guildIdSchema from "../schema/guildId-schema";
import regionSchema from "../schema/region-schema";

export default async (interaction: ButtonInteraction): Promise<void> => {
    const rows = await makeRow(interaction.guild?.id)

    const message = await interaction.reply({
        content: 'What role would you like to set?',
        components: rows,
        ephemeral: true,
        fetchReply: true
    })

    const collector = (message as Message).createMessageComponentCollector()

    collector?.on('collect', async (i: ButtonInteraction) => {
        const {customId, member} = i

        if(customId == 'pronouns') {
            setPronouns(i)
        } else if (customId == 'region') {
            setRegion(i)
        } else {
            let looseEnd = await i.reply({
                content: 'Clicked.',
                fetchReply: true
            });
    
            (looseEnd as Message).delete();
    
            const prefix = '<@&';
            const suffix = '>';
    
            const roles = (member?.roles as GuildMemberRoleManager)

            if(roles.cache.has(customId)){
                roles.remove(customId);
                i.followUp({
                    content: `Removed ${prefix}${customId}${suffix} successfully!`,
                    ephemeral: true,
                })
            } else {
                roles.add(customId);
                i.followUp({
                    content: `Added ${prefix}${customId}${suffix} successfully!`,
                    ephemeral: true,
                })
            }
        }
    })
}

async function makeRow(guildId: any) : Promise<MessageActionRow[]> {
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('pronouns')
                .setLabel('Pronous')
                .setStyle('PRIMARY'),
        )

    const regionConnection = await regionSchema.findOne({guildId: guildId})
    
    let regionButton;
    if(regionConnection)
    {
        regionButton = new MessageButton()
            .setCustomId('region')
            .setLabel('Set Regions')
            .setStyle('PRIMARY')

        row.addComponents(regionButton)
    }

    let dbConnection = await guildIdSchema.findOne({guildId: guildId})

    if(!dbConnection) {
        return [row]
    } else {
        let numExtraRoles = 0;
        let customRow = new MessageActionRow()
        if(dbConnection.gameNight.use) {
            customRow.addComponents(
                new MessageButton()
                    .setCustomId(dbConnection.gameNight.roleId)
                    .setLabel('Game Nights')
                    .setStyle('SECONDARY')
            )

            numExtraRoles++;
        }

        if(dbConnection.meetUps.use) {
            customRow.addComponents(
                new MessageButton()
                    .setCustomId(dbConnection.meetUps.roleId)
                    .setLabel('Meet Ups')
                    .setStyle('SECONDARY')
            )

            numExtraRoles++;
        }

        if(dbConnection.events.use) {
            customRow.addComponents(
                new MessageButton()
                    .setCustomId(dbConnection.events.roleId)
                    .setLabel('Events')
                    .setStyle('SECONDARY')
            )

            numExtraRoles++;
        }

        if(numExtraRoles > 0) {
            return [row, customRow]
        } else {
            return [row]
        }
    }    
}

async function setPronouns(interaction: ButtonInteraction): Promise<void> {
    let dbConnection = await guildIdSchema.findOne({guildId: interaction.guild?.id});

    let pgpMessageRow;
    if(!dbConnection) {
        interaction.reply({
            content: 'Something went wrong. :(',
            ephemeral: true
        })

        pgpMessageRow = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('975536919519838268')
                    .setLabel('HE/HIM')
                    .setStyle('PRIMARY'),

                new MessageButton()
                    .setCustomId('975537153784299540')
                    .setLabel('SHE/HER')
                    .setStyle('PRIMARY'),

                new MessageButton()
                    .setCustomId('975537280322240522')
                    .setLabel('THEY/THEM')
                    .setStyle('PRIMARY'),

                new MessageButton()
                    .setCustomId('975537475743281172')
                    .setLabel('OTHER')
                    .setStyle('PRIMARY'),
            )
    } else {
        pgpMessageRow = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId(dbConnection.heRoleId)
                    .setLabel('HE/HIM')
                    .setStyle('PRIMARY'),

                new MessageButton()
                    .setCustomId(dbConnection.sheRoleId)
                    .setLabel('SHE/HER')
                    .setStyle('PRIMARY'),

                new MessageButton()
                    .setCustomId(dbConnection.theyRoleId)
                    .setLabel('THEY/THEM')
                    .setStyle('PRIMARY'),

                new MessageButton()
                    .setCustomId(dbConnection.otherRoleId)
                    .setLabel('OTHER')
                    .setStyle('PRIMARY'),
            )
    }

    const message = await interaction.reply({
        content: 'What pronouns do you use?',
        components: [pgpMessageRow],
        ephemeral: true,
        fetchReply: true,
    })

    const collector = (message as Message).createMessageComponentCollector();

    collector.on('collect', async btnInt => {
        const {customId: roleID, member} = btnInt

        let looseEnd = await btnInt.reply({
            content: 'Clicked.',
            fetchReply: true
        });

        (looseEnd as Message).delete();

        const prefix = '<@&';
        const suffix = '>';

        const roles = (member?.roles as GuildMemberRoleManager)

        if(roles.cache.has(roleID)){
            roles.remove(roleID);
            btnInt.followUp({
                content: `Removed ${prefix}${roleID}${suffix} successfully!`,
                ephemeral: true,
            })
        } else {
            roles.add(roleID);
            btnInt.followUp({
                content: `Added ${prefix}${roleID}${suffix} successfully!`,
                ephemeral: true,
            })
        }
    })
}

async function setRegion(interaction: ButtonInteraction): Promise<void> {
    if(!interaction.inCachedGuild()) return;
    let regionList = await regionSchema.findOne({guildId: interaction.guild.id})
    let regionIds: string[] = []

    let options = [];

    for(let i = 0; i < regionList.regions.length; i++) {
        regionIds.push(regionList.regions[i].roleId)

        options.push({
            label: `${regionList.regions[i].name}`,
            value: regionList.regions[i].roleId
        })
    }

    const regionMessageComponent = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId("region_select")
                .setPlaceholder("Select a Region!")
                .setOptions(options),
        )

    const message = await interaction.reply({
        content: "What region are you from?",
        components: [regionMessageComponent],
        ephemeral: true,
        fetchReply: true
    })

    const regionCollector = (message as Message).createMessageComponentCollector();

    regionCollector.on('collect', (dropDownInt: SelectMenuInteraction) => {
        
        const { customId, member, values } = dropDownInt

        const roles = (member?.roles as GuildMemberRoleManager)
        
        if(customId === 'region_select')
        {
            regionIds.forEach(id => {
                if(roles.cache.has(id)){
                    roles.remove(id);
                }
            });

            roles.add(values[0])
        }

        dropDownInt.reply({
            content: 'Region Updated!',
            components: [],
            ephemeral: true,
        })
    })
}