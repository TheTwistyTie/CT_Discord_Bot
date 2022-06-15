import { ButtonInteraction, Guild, Message, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from "discord.js"
import resourceTypeSchema from "../../schema/resourceType-schema"
import resourceSchema from "../../schema/resource-schema"
import addType from "./addType"
import ResourceData from "./ResourceData"

export default async (interaction:ButtonInteraction) => {
    const {guild, user} = interaction
    const guildId = guild?.id || ''

    const initialMessage = await user.send({
        content: 'Thanks for adding something to our system!\nWhat is the name?',
    })

    const channel = initialMessage.channel;

    const nameCollector = await channel.createMessageCollector({
        max: 1,
        time: 60000
    })

    nameCollector.on('collect',async (resourceName: Message) => {
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('confirm')
                    .setLabel('Confirm')
                    .setStyle('SUCCESS'),

                new MessageButton()
                    .setCustomId('cancel')
                    .setLabel('Cancel')
                    .setStyle('DANGER')
            )

        const confMessage = await channel.send({
            content: `We received: '${resourceName.content}'`,
            components: [row]
        })

        const confCollector = confMessage.createMessageComponentCollector()

        confCollector.on('collect', async (btnInt: ButtonInteraction) => {
            if(btnInt.customId === 'confirm') {
                createResource(btnInt, resourceName.content, guildId)
            } else {
                let looseEnd = await btnInt.reply({
                    content: 'Cancled.',
                    fetchReply: true
                })

                setTimeout(() => {}, 2000);

                (looseEnd as Message).delete()
            }

            confMessage.delete();
            initialMessage.delete();
        })
    })
}

async function createResource(interaction: ButtonInteraction, name: string, guild: string) {
    const resourceData = new ResourceData(name, guild);
    const messageArray: Message[] = []

    const startMessage = await interaction.reply({
        content: `Tell us more about ${name}`,
        embeds: [resourceData.BuildEmbed()],
        components: makeMessageActionRow(resourceData),
        fetchReply: true
    })

    messageArray.push(startMessage as Message)

    const collector = (startMessage as Message).createMessageComponentCollector({
        max: 1
    })

    collector.on('collect', async (btnInt: ButtonInteraction) => {
        Action(btnInt, resourceData, messageArray)
    })
}

export async function createResourceRec(interaction: ButtonInteraction, resourceData: ResourceData, messageArray: Message[]) {
    const startMessage = await interaction.reply({
        content: `Tell us more about ${resourceData.name}`,
        embeds: [resourceData.BuildEmbed()],
        components: makeMessageActionRow(resourceData),
        fetchReply: true
    })

    messageArray.push(startMessage as Message)

    const collector = (startMessage as Message).createMessageComponentCollector({
        max: 1
    })

    collector.on('collect', async (btnInt: ButtonInteraction) => {
        Action(btnInt, resourceData, messageArray)
    })
}

async function Action(btnInt: ButtonInteraction, resourceData: ResourceData, messageArray: Message[]) {
    switch(btnInt.customId) {
        case 'change_name':
            changeName(resourceData, btnInt, messageArray)
            break;
        case 'change_description':
            changeDescription(resourceData, btnInt, messageArray)
            break;
        case 'add_url':
            changeUrl(resourceData, btnInt, messageArray)
            break;
        case 'add_thumbnail':
            changeThumbnail(resourceData, btnInt, messageArray)
            break;
        case 'add_image':
            changeImage(resourceData, btnInt, messageArray)
            break;
        case 'add_type':
            addTypes(resourceData, btnInt, messageArray)
            break;
        case 'submit':
            submit(resourceData, btnInt, messageArray)
            break;
        case 'cancel':
            messageArray.forEach(async message => {
                message.delete()
            });

            let loosend = await btnInt.reply({
                content: 'Canceled...',
                fetchReply: true
            })

            setTimeout(() => {}, 2000);

            (loosend as Message).delete()
            break;
    }
}

function makeMessageActionRow(resourceData: ResourceData): MessageActionRow[] {
    let nameButton = new MessageButton()
        .setCustomId('change_name')
        .setLabel('Change Name')
        .setStyle('PRIMARY')

    let descriptionButton;
    if(resourceData.HasDescription()){
        descriptionButton = new MessageButton()
            .setLabel('Change the Description')
            .setCustomId('change_description')
            .setStyle('SECONDARY')
    } else {
        descriptionButton = new MessageButton()
            .setLabel('Set the Description')
            .setCustomId('change_description')
            .setStyle('PRIMARY')
    }

    let typeButton
    if(resourceData.HasType()){
        typeButton = new MessageButton()
            .setCustomId('add_type')
            .setLabel('Add resource types')
            .setStyle('SECONDARY')
    } else {
        typeButton = new MessageButton()
            .setCustomId('add_type')
            .setLabel('Add resource types')
            .setStyle('PRIMARY')
    }

    const firstRow = new MessageActionRow()
        .addComponents(
            nameButton,
            descriptionButton,
            typeButton,
        )

    let urlButton;
    if(!resourceData.HasUrl()) {
        urlButton = new MessageButton()
            .setLabel('Add a link')
            .setCustomId('add_url')
            .setStyle('SECONDARY')
    } else {
        urlButton = new MessageButton()
            .setLabel('Change the link')
            .setCustomId('add_url')
            .setStyle('SECONDARY')
    }
    
    let thumbnailButton;
    if(!resourceData.HasThumbnail()) {
        thumbnailButton = new MessageButton()
            .setLabel('Add a logo')
            .setCustomId('add_thumbnail')
            .setStyle('SECONDARY')
    } else {
        thumbnailButton = new MessageButton()
            .setLabel('Change the thumbnail')
            .setCustomId('add_thumbnail')
            .setStyle('SECONDARY')
    }

    let imageButton;
    if(!resourceData.HasImage()) {
        imageButton = new MessageButton()
            .setLabel('Add an image')
            .setCustomId('add_image')
            .setStyle('SECONDARY')
    } else {
        imageButton = new MessageButton()
            .setLabel('Change the image')
            .setCustomId('add_image')
            .setStyle('SECONDARY')
    }

    const secondRow = new MessageActionRow()
        .addComponents(
            urlButton,
            thumbnailButton,
            imageButton
        )

    let submitButton;
    if(resourceData.HasDescription() && resourceData.HasType()) {
        submitButton = new MessageButton()
            .setCustomId('submit')
            .setLabel('Submit')
            .setStyle('SUCCESS')
    } else {
        submitButton = new MessageButton()
            .setCustomId('submit')
            .setLabel('Submit')
            .setStyle('SUCCESS')
            .setDisabled(true)
    }

    const cancelButton = new MessageButton()
        .setCustomId('cancel')
        .setLabel('Cancel')
        .setStyle('DANGER')

    const finalRow = new MessageActionRow()
        .addComponents(
            submitButton,
            cancelButton
        )

    return [firstRow, secondRow, finalRow]
}

async function changeName(resourceData: ResourceData, interaction: ButtonInteraction, messageArray: Message[]) {
    const { channel } = interaction;

    const mainMessage = await interaction.reply({
        content: 'What would you like the new name to be?',
        fetchReply: true,
    })

    messageArray.push(mainMessage as Message);

    const nameCollector = interaction.channel?.createMessageCollector({
        max: 1
    })

    nameCollector?.on('collect', async nameMsg => {
        
        const name = nameMsg.content;

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
            content: `Set the name as: \t\'**${name}**\'`,
            components: [row]
        })

        messageArray.push(btnMsg as Message)

        const confCollector = (btnMsg as Message).createMessageComponentCollector({
            max: 1
        })

        confCollector.on('collect', (btnInt) => {
            if(btnInt.customId === 'continue') {
                resourceData.SetName(name);
                
                interaction.editReply({
                    content: `Description Set`,
                    components: [],
                })
            } else {
                interaction.editReply({
                    content: `Canceled.`,
                    components: [],
                })
            }
            
            createResourceRec(btnInt as ButtonInteraction, resourceData, messageArray)
        })
    })
}

async function changeDescription(resourceData: ResourceData, interaction: ButtonInteraction, messageArray: Message[]) {
    const { channel } = interaction;

    const mainMessage = await interaction.reply({
        content: 'What would you like the description to be?',
        fetchReply: true,
    })

    messageArray.push(mainMessage as Message);

    const descriptionCollector = interaction.channel?.createMessageCollector({
        max: 1
    })

    descriptionCollector?.on('collect', async descriptionMsg => {
        
        const description = descriptionMsg.content;

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
            content: `Set the description as: \t\'**${description}**\'`,
            components: [row]
        })

        messageArray.push(btnMsg as Message)

        const confCollector = (btnMsg as Message).createMessageComponentCollector({
            max: 1
        })

        confCollector.on('collect', (btnInt) => {
            if(btnInt.customId === 'continue') {
                resourceData.SetDescription(description);
                
                interaction.editReply({
                    content: `Description Set`,
                    components: [],
                })
            } else {
                interaction.editReply({
                    content: `Canceled.`,
                    components: [],
                })
            }
            
            createResourceRec(btnInt as ButtonInteraction, resourceData, messageArray)
        })
    })
}

async function addTypes(resourceData: ResourceData, interaction: ButtonInteraction, messageArray: Message[]) {
    let resouceTypes = await resourceTypeSchema.findOne({guildId: resourceData.guildId})

    let options = [{
        label: 'Add new type of resource',
        value: 'add_new'
    }];
    if(!resouceTypes) {
        resouceTypes = new resourceTypeSchema({
            guildId: resourceData.guildId,
        })
    } else {
        for(let i = 0; i < resouceTypes.types.length; i++) {
            options.push({
                label: resouceTypes.types[i].name,
                value: resouceTypes.types[i].name
            })
        }
    }

    const row = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('resource_type')
                .setPlaceholder('Select what type of resource this is.')
                .setOptions(options)
                .setMinValues(1)
        )

    const resourceMsg = await interaction.reply({
        content: 'What kind of resource is this?',
        components: [row],
        fetchReply: true
    })

    messageArray.push(resourceMsg as Message)

    const typeCollector = (resourceMsg as Message).createMessageComponentCollector()

    typeCollector.on('collect', async (selectInt: SelectMenuInteraction) => {
        if(selectInt.values[0] == 'add_new') {
            addType(selectInt, resourceData, messageArray)
        } else {
            let text = 'Received: '
            selectInt.values.forEach(value => {
                text += value + ', '
            });

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

            let confMessage = await selectInt.reply({
                content: text,
                components: [row],
                fetchReply: true
            })

            messageArray.push(confMessage as Message)

            let collector = (confMessage as Message).createMessageComponentCollector({
                max: 1
            })

            collector.on('collect', (btnInt: ButtonInteraction) => {
                if(btnInt.customId == 'continue') {
                    selectInt.values.forEach(value => {
                        resourceData.SetType(value)
                    });

                    createResourceRec(btnInt, resourceData, messageArray)
                }
            })
        }
    })
}

async function changeUrl(resourceData: ResourceData, interaction: ButtonInteraction, messageArray: Message[]) {
    const { channel } = interaction;

    const mainMsg = await interaction.reply({
        content: 'What is the url you want to link to?',
        fetchReply: true,
    })

    messageArray.push(mainMsg as Message)

    const urlCollector = channel?.createMessageCollector({
        max: 1,
    })

    urlCollector?.on('collect', async urlMsg => {
        let url = urlMsg.content;
        

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
            content: `Links to: \'**${url}**\'`,
            components: [row],
        })

        const confCollector = await (btnMsg as Message).createMessageComponentCollector({
            max: 1,
        })

        confCollector.on('collect', (btnInt) => {
            if(btnInt.customId === 'continue') {
                interaction.editReply({
                    content: 'Confimed',
                    components: [],
                })
                resourceData.SetUrl(url)
            } else {
                interaction.editReply({
                    content: 'Canceled',
                    components: [],
                })
            }

            createResourceRec((btnInt as ButtonInteraction), resourceData, messageArray)
        })
        
    })
}

async function changeThumbnail(resourceData: ResourceData, interaction: ButtonInteraction, messageArray: Message[]) {
    const { channel } = interaction;

    const mainMsg = await interaction.reply({
        content: 'What is the thumbnail you\'d like to have? You can either paste a link directly to the image or upload your own!',
        fetchReply: true,
    })

    messageArray.push(mainMsg as Message)

    const urlCollector = channel?.createMessageCollector({
        max: 1,
    })

    urlCollector?.on('collect', async urlMsg => {
        let url: any = '';
        if(urlMsg.attachments.size == 0) {

        url = urlMsg.content;

        } else {
            url = urlMsg.attachments.first()?.url;
        }

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
            content: `Image URL: \'**${url}**\'`,
            components: [row],
        })

        messageArray.push(btnMsg as Message)

        const confCollector = await (btnMsg as Message).createMessageComponentCollector({
            max: 1,
        })

        confCollector.on('collect', (btnInt) => {
            if(btnInt.customId === 'continue') {
                interaction.editReply({
                    content: 'Confimed',
                    components: [],
                })
                resourceData.SetThumbnail(url)
            } else {
                interaction.editReply({
                    content: 'Canceled',
                    components: [],
                })
            }

            createResourceRec(btnInt as ButtonInteraction, resourceData, messageArray)
        })
    })
}

async function changeImage(resourceData: ResourceData, interaction: ButtonInteraction, messageArray: Message[]) {
    const { channel } = interaction;

    const mainMsg = await interaction.reply({
        content: 'What is the image you\'d like to have? You can either paste a link directly to the image or upload your own!',
        fetchReply: true,
    })

    messageArray.push(mainMsg as Message)

    const urlCollector = channel?.createMessageCollector({
        max: 1,
    })

    urlCollector?.on('collect', async urlMsg => {
        let url: any = '';
        if(urlMsg.attachments.size == 0) {

        url = urlMsg.content;

        } else {
            url = urlMsg.attachments.first()?.url;
        }

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
            content: `Image URL: \'**${url}**\'`,
            components: [row],
        })

        messageArray.push(btnMsg as Message)

        const confCollector = await (btnMsg as Message).createMessageComponentCollector({
            max: 1,
        })

        confCollector.on('collect', (btnInt) => {
            if(btnInt.customId === 'continue') {
                interaction.editReply({
                    content: 'Confimed',
                    components: [],
                })
                resourceData.SetImage(url)
            } else {
                interaction.editReply({
                    content: 'Canceled',
                    components: [],
                })
            }

            createResourceRec(btnInt as ButtonInteraction, resourceData, messageArray)
        })
    })
}

async function submit(resourceData: ResourceData, interaction: ButtonInteraction, messageArray: Message[]) {
    const { channel } = interaction

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

    const mainMsg = await interaction.reply({
        content: 'Are you sure that you want to submit this resource?',
        components: [row],
        embeds: [resourceData.BuildEmbed()],
        fetchReply: true,
    })

    messageArray.push(mainMsg as Message)

    const confConllector = (mainMsg as Message).createMessageComponentCollector({
        max: 1,
    })

    confConllector.on('collect',async (btnInt: ButtonInteraction) => {
        if(btnInt.customId === 'continue') {
            //btnInt.deferReply()

            const resources = await resourceSchema.find({guildId: resourceData.guildId})

            if(resources) {
                let duplicate = false
                resources.forEach(resource => {
                    if(resource.name == resourceData.name) {
                        duplicate = true;
                    }
                });

                if(!duplicate) {
                    let newResource = new resourceSchema({
                        guildId: resourceData.guildId,
                        name: resourceData.name,
                        description: resourceData.description,
                        url: resourceData.url,
                        thumbnail: resourceData.thumbnail,
                        image: resourceData.image,
                        type: resourceData.GetTypeArray(),
                    }).save()

                    let loosend = await btnInt.reply({
                        content: 'Saved!',
                        fetchReply: true
                    })

                    messageArray.forEach(message => {
                        message.delete()
                    });

                    (loosend as Message).delete()
                } else {
                    const row = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('tryAgain')
                                .setLabel('Try Again')
                                .setStyle('SUCCESS'),

                            new MessageButton()
                                .setCustomId('cancel')
                                .setLabel('Cancel')
                                .setStyle('DANGER')
                        )

                    let tryAgainMsg = await btnInt.reply({
                        content: 'It seems like there is another resource with this name. Has someone already submitted this?',
                        components: [row],
                        fetchReply: true
                    })

                    messageArray.push(tryAgainMsg as Message);

                    let tryAgainCollector = (tryAgainMsg as Message).createMessageComponentCollector({
                        max: 1
                    })

                    tryAgainCollector.on('collect', async (btnInt: ButtonInteraction) => {
                        if(btnInt.customId === 'tryAgain') {
                            createResourceRec(btnInt, resourceData, messageArray)
                        } else {
                            messageArray.forEach(async message => {
                                message.delete()
                            });
            
                            let loosend = await btnInt.reply({
                                content: 'Canceled...',
                                fetchReply: true
                            })
            
                            setTimeout(() => {}, 2000);
            
                            (loosend as Message).delete()
                        }
                    })
                }
            }
        } else {
            messageArray.forEach(async message => {
                message.delete()
            });

            let loosend = await btnInt.reply({
                content: 'Canceled...',
                fetchReply: true
            })

            setTimeout(() => {}, 2000);

            (loosend as Message).delete()
        }
    })
}