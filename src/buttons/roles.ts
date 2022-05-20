import { ButtonInteraction, GuildMemberRoleManager, Message, MessageActionRow, MessageButton, MessageSelectMenu, SelectMenuInteraction } from "discord.js";
import guildIdSchema from "../schema/guildId-schema";

export default async (interaction: ButtonInteraction): Promise<void> => {
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('pronouns')
                .setLabel('Pronous')
                .setStyle('PRIMARY'),

            new MessageButton()
                .setCustomId('region')
                .setLabel('Region')
                .setStyle('PRIMARY')
        )

    const message = await interaction.reply({
        content: 'What role would you like to set?',
        components: [row],
        ephemeral: true,
        fetchReply: true
    })

    const collector = (message as Message).createMessageComponentCollector()

    collector?.on('collect', (i: ButtonInteraction) => {
        const {customId} = i
        switch(customId){
            case 'pronouns':
                setPronouns(i)
                break;
            case 'region':
                setRegion(i)
                break;
        }
    })
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
    const RegionIds = [
        '784933377824129025',
        '784933731831382067',
        '784933771127423027',
        '784933814328623125',
        '784933864678228008',
        '784933902530773022',
        '784933989361385482',
        '784934029203341352'
    ]

    const regionMessageComponent = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId("region_select")
                .setPlaceholder("Select a Region!")
                .setOptions([
                    {
                        label: 'Fairfield County',
                        value: '784933377824129025',
                    },
                    {
                        label: "Hartford County",
                        value: '784933731831382067',
                    },
                    {
                        label: "Litchfield County",
                        value: '784933771127423027',
                    },
                    {
                        label: "Middlesex Country",
                        value: '784933814328623125',
                    },
                    {
                        label: "New Haven County",
                        value: '784933864678228008',
                    },
                    {
                        label: "New London County",
                        value: '784933902530773022',
                    },
                    {
                        label: "Tolland County",
                        value: '784933989361385482',
                    },
                    {
                        label: "Windham County",
                        value: '784934029203341352'
                    }
                ]
            ),
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
            RegionIds.forEach(id => {
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