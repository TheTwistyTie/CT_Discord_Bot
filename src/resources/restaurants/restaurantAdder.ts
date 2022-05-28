import { ButtonInteraction, Guild, Message, MessageActionRow, MessageButton, MessageEmbed } from "discord.js"
import resourceSchema from "../../schema/resource-schema"
import RestaurantData from "./RestaurantData"

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
            content: `We received '**${resourceName.content}**'`,
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
    const resourceData = new RestaurantData(name, guild);
    const messageArray: Message[] = []

    const startMessage = await interaction.reply({
        content: `Tell us more about ${name}`,
        embeds: [getEmbed(resourceData)],
        components: makeMessageActionRow(resourceData),
        fetchReply: true
    })

    messageArray.push(startMessage as Message)

    const collector = (startMessage as Message).createMessageComponentCollector({
        max: 1
    })

    collector.on('collect', async (btnInt: ButtonInteraction) => {
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
    })
}

async function createResourceRec(interaction: ButtonInteraction, resourceData: RestaurantData, messageArray: Message[]) {
    const startMessage = await interaction.reply({
        content: `Tell us more about ${resourceData.name}`,
        embeds: [getEmbed(resourceData)],
        components: makeMessageActionRow(resourceData),
        fetchReply: true
    })

    messageArray.push(startMessage as Message)

    const collector = (startMessage as Message).createMessageComponentCollector({
        max: 1
    })

    collector.on('collect', async (btnInt: ButtonInteraction) => {
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
    })
}

function makeMessageActionRow(resourceData: RestaurantData): MessageActionRow[] {
    let allowSubmit = true

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

        allowSubmit = false;
    }

    const firstRow = new MessageActionRow()
        .addComponents(
            nameButton,
            descriptionButton,
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
    if(allowSubmit) {
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

function getEmbed(resourceData: RestaurantData): MessageEmbed {
    const embed = new MessageEmbed()
        .setTitle(resourceData.name)
        .setDescription(resourceData.description)

    if(resourceData.HasImage()) {
        embed.setImage(resourceData.image)
    }

    if(resourceData.HasThumbnail()) {
        embed.setThumbnail(resourceData.thumbnail)
    }

    if(resourceData.HasUrl()) {
        embed.setURL(resourceData.url)
    }

    return embed
}

async function changeName(resourceData: RestaurantData, interaction: ButtonInteraction, messageArray: Message[]) {
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

async function changeDescription(resourceData: RestaurantData, interaction: ButtonInteraction, messageArray: Message[]) {
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

async function changeUrl(resourceData: RestaurantData, interaction: ButtonInteraction, messageArray: Message[]) {
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

        if(!validURL(url)){
            if(validURL('https://' + url)){
                url = 'https://' + url
            }
        }
        
        messageArray.push(urlMsg)

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

function validURL (string: string) : boolean {
    let res = false;

    if(string.startsWith('https://')) {
        const tester = (/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
        res = tester.test(string);
    }

    return res
}

async function changeThumbnail(resourceData: RestaurantData, interaction: ButtonInteraction, messageArray: Message[]) {
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

async function changeImage(resourceData: RestaurantData, interaction: ButtonInteraction, messageArray: Message[]) {
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

async function submit(resourceData: RestaurantData, interaction: ButtonInteraction, messageArray: Message[]) {
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
        embeds: [buildEmbed(resourceData)],
        fetchReply: true,
    })

    messageArray.push(mainMsg as Message)

    const confConllector = (mainMsg as Message).createMessageComponentCollector({
        max: 1,
    })

    confConllector.on('collect',async (btnInt: ButtonInteraction) => {
        if(btnInt.customId === 'continue') {
            btnInt.deferReply()

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
                        image: resourceData.image
                    }).save()

                    let loosend = await btnInt.reply({
                        content: 'Saved!',
                        fetchReply: true
                    })

                    setTimeout(() => {
                        messageArray.forEach(message => {
                            message.delete()
                        }, 2000);
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

function buildEmbed(resourceData: RestaurantData): MessageEmbed {
    const embed = new MessageEmbed()
        .setTitle(resourceData.name)
        .setDescription(resourceData.description)

    if(resourceData.HasImage()){
        embed.setImage(resourceData.image)
    }

    if(resourceData.HasThumbnail()){
        embed.setThumbnail(resourceData.thumbnail)
    }

    if(resourceData.HasUrl()) {
        embed.setURL(resourceData.url)
    }

    return embed
}