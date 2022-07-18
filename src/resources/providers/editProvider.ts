import { ButtonInteraction, Guild, Message, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from "discord.js"
import providerTypeSchema from "../../schema/providerType-schema"
import providerSchema from "../../schema/provider-schema"
import addType from "./addType"
import ProviderData from "./ProviderData"
import regionSchema from "../../schema/region-schema"
import guildIdSchema from "../../schema/guildId-schema"
import organizationSchema from "../../schema/organization-schema"

let originalData: ProviderData

export default async (interaction:ButtonInteraction, resourceData: ProviderData) => {
    originalData = resourceData;

    let messageArray: Message[] = []
    createResourceRec(interaction, resourceData, messageArray)
}

export async function createResourceRec(interaction: ButtonInteraction, resourceData: ProviderData, messageArray: Message[]) {
    const startMessage = await interaction.reply({
        content: `Tell us more about ${resourceData.name}`,
        embeds: [resourceData.BuildFullEmbed()],
        components: await makeMessageActionRow(resourceData),
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

async function Action(btnInt: ButtonInteraction, resourceData: ProviderData, messageArray: Message[]) {
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
        case 'add_region':
            addRegion(resourceData, btnInt, messageArray)
            break;
        case 'add_hours':
            addOpenHours(resourceData, btnInt, messageArray)
            break;
        case 'add_number':
            addPhoneNumber(resourceData, btnInt, messageArray)
            break;
        case 'add_address':
            addAddress(resourceData, btnInt, messageArray)
            break;
        case 'add_email':
            addEmail(resourceData, btnInt, messageArray)
            break;
        case 'add_eligibility':
            addEligibility(resourceData, btnInt, messageArray)
            break;
        case 'add_organization':
            addOrganization(resourceData, btnInt, messageArray)
            break;
        case 'submit':
            submit(resourceData, btnInt, messageArray)
            break;
        case 'delete':
            deleteResource(resourceData, btnInt, messageArray)
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

async function makeMessageActionRow(resourceData: ProviderData): Promise<MessageActionRow[]> {
    let organizationButton
    
    if(!resourceData.HasOrganization()) {
        organizationButton = new MessageButton()
        .setCustomId('add_organization')
        .setLabel('Add linked organization')
        .setStyle('PRIMARY')
    } else {
        organizationButton = new MessageButton()
        .setCustomId('add_organization')
        .setLabel('Change linked organization')
        .setStyle('SECONDARY')
    }

    let nameButton = new MessageButton()
        .setCustomId('change_name')
        .setLabel('Change Name')
        .setStyle('SECONDARY')
        .setDisabled(true)

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
            .setDisabled(true)
    } else {
        typeButton = new MessageButton()
            .setCustomId('add_type')
            .setLabel('Add resource types')
            .setStyle('PRIMARY')
            .setDisabled(true)
    }

    let regionButton
    if(resourceData.HasRegions()){
        regionButton = new MessageButton()
            .setCustomId('add_region')
            .setLabel('Add resource regions')
            .setStyle('SECONDARY')
            .setDisabled(true)
    } else {
        regionButton = new MessageButton()
            .setCustomId('add_region')
            .setLabel('Add resource regions')
            .setStyle('PRIMARY')
            .setDisabled(true)
    }

    const firstRow = new MessageActionRow

    let guildDB = await guildIdSchema.findOne({guildId: resourceData.guildId})
    if(guildDB.resources.organizations){
        firstRow.addComponents(organizationButton)
    }

    firstRow.addComponents(
            descriptionButton,
            typeButton,
            regionButton
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
            .setLabel('Add a picture')
            .setCustomId('add_thumbnail')
            .setStyle('SECONDARY')
    } else {
        thumbnailButton = new MessageButton()
            .setLabel('Change the picture')
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

    let openHoursButton;
    if(!resourceData.HasImage()) {
        openHoursButton = new MessageButton()
            .setLabel('Add open hours')
            .setCustomId('add_hours')
            .setStyle('SECONDARY')
    } else {
        openHoursButton = new MessageButton()
            .setLabel('Change open hours')
            .setCustomId('add_hours')
            .setStyle('SECONDARY')
    }

    let phoneNumberButton;
    if(!resourceData.HasPhoneNumber()) {
        phoneNumberButton = new MessageButton()
            .setLabel('Add phone number')
            .setCustomId('add_number')
            .setStyle('SECONDARY')
    } else {
        phoneNumberButton = new MessageButton()
            .setLabel('Change phone number')
            .setCustomId('add_number')
            .setStyle('SECONDARY')
    }

    const secondRow = new MessageActionRow()
        .addComponents(
            nameButton,
            urlButton,
            thumbnailButton,
            //imageButton,
            openHoursButton,
            
        )

    let addressButton;
        if(!resourceData.HasPhoneNumber()) {
            addressButton = new MessageButton()
                .setLabel('Add address')
                .setCustomId('add_address')
                .setStyle('SECONDARY')
        } else {
            addressButton = new MessageButton()
                .setLabel('Change address')
                .setCustomId('add_address')
                .setStyle('SECONDARY')
        }

    let emailButton;
        if(!resourceData.HasPhoneNumber()) {
            emailButton = new MessageButton()
                .setLabel('Add email')
                .setCustomId('add_email')
                .setStyle('SECONDARY')
        } else {
            emailButton = new MessageButton()
                .setLabel('Change email')
                .setCustomId('add_email')
                .setStyle('SECONDARY')
        }

    let eligibilityButton;
        if(!resourceData.HasPhoneNumber()) {
            eligibilityButton = new MessageButton()
                .setLabel('Add eligibility')
                .setCustomId('add_eligibility')
                .setStyle('SECONDARY')
        } else {
            eligibilityButton = new MessageButton()
                .setLabel('Change eligibility')
                .setCustomId('add_eligibility')
                .setStyle('SECONDARY')
        }

    const thirdRow = new MessageActionRow()
            .addComponents(
                phoneNumberButton,
                addressButton,
                emailButton,
                eligibilityButton,
            )

    let submitButton;
    if(resourceData.HasDescription() && resourceData.HasType() && resourceData.HasRegions()) {
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

    const deleteButton = new MessageButton()
        .setCustomId('delete')
        .setLabel('Delete Resource')
        .setStyle('DANGER')

    const finalRow = new MessageActionRow()
        .addComponents(
            submitButton,
            deleteButton,
            cancelButton
        )

    return [firstRow, secondRow, thirdRow, finalRow]
}

async function changeName(resourceData: ProviderData, interaction: ButtonInteraction, messageArray: Message[]) {
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

async function changeDescription(resourceData: ProviderData, interaction: ButtonInteraction, messageArray: Message[]) {
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

async function addTypes(resourceData: ProviderData, interaction: ButtonInteraction, messageArray: Message[]) {
    let resouceTypes = await providerTypeSchema.findOne({guildId: resourceData.guildId})

    let options = [{
        label: 'Add new type of provider',
        value: 'add_new'
    }];
    if(!resouceTypes) {
        resouceTypes = new providerTypeSchema({
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
                .setPlaceholder('Select what type of provider this is.')
                .setOptions(options)
                .setMinValues(1)
        )

    const resourceMsg = await interaction.reply({
        content: 'What kind of provider is this?',
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
                }
                createResourceRec(btnInt, resourceData, messageArray)
            })
        }
    })
}

async function addRegion(resourceData: ProviderData, interaction: ButtonInteraction, messageArray: Message[]) {
    let regionDB = await regionSchema.findOne({guildId: resourceData.guildId});
    
    if(!regionDB) {
        console.log('ERROR: resource creation without regions!')
        createResourceRec(interaction, resourceData, messageArray)
    } else {
        let regionOptions = []
        for (let i = 0; i < regionDB.regions.length; i++){
            regionOptions.push({
                label: regionDB.regions[i].name,
                value: regionDB.regions[i].name
            })
        }
    
        let row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('regionSelect')
                    .setPlaceholder('What regions is this in?')
                    .addOptions(regionOptions)
                    .setMinValues(1)
            )
    
        const regionMsg = await interaction.reply({
            content: 'What region(s) is this resource in?',
            components: [row],
            fetchReply: true
        })
    
        const collector = (regionMsg as Message).createMessageComponentCollector({
            max: 1
        })
        collector.on('collect', async (int: SelectMenuInteraction) => {
            const { values } = int;
    
            let text = 'Received: '
            values.forEach(value => {
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

            let confMessage = await int.reply({
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
                    values.forEach(value => {
                        resourceData.SetRegion(value)
                    });
                }
                createResourceRec(btnInt, resourceData, messageArray)
            })

        })
    }
}

async function changeUrl(resourceData: ProviderData, interaction: ButtonInteraction, messageArray: Message[]) {
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

async function changeThumbnail(resourceData: ProviderData, interaction: ButtonInteraction, messageArray: Message[]) {
    const { channel } = interaction;

    const mainMsg = await interaction.reply({
        content: 'What is the picture you\'d like to have? You can either paste a link directly to the image or upload your own!',
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

async function changeImage(resourceData: ProviderData, interaction: ButtonInteraction, messageArray: Message[]) {
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

        const confCollector = (btnMsg as Message).createMessageComponentCollector({
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

async function addOpenHours(resourceData: ProviderData, interaction: ButtonInteraction, messageArray: Message[]) {    
    const { channel } = interaction;

    const mainMsg = await interaction.reply({
        content: 'When is this provider planning on being online?\n\t*Press (Shift + Enter) for a new line.\n\tPress (Enter) to submit.*',
        fetchReply: true,
    })

    const hoursCollector = interaction.channel?.createMessageCollector({
        max: 1,
    })

    hoursCollector?.on('collect', async hoursInt => {
        const hours = hoursInt.content;
        
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
            content: `${'Open: '} \n\'**${hours}**\'`,
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
                resourceData.SetOpenHours(hours)
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

async function addPhoneNumber(resourceData: ProviderData, interaction: ButtonInteraction, messageArray: Message[]) {
    const mainMsg = await interaction.reply({
        content: 'What is the phone number you want your provider to have?',
        fetchReply: true,
    })

    const numberCollector = interaction.channel?.createMessageCollector({
        max: 1,
    })

    numberCollector?.on('collect', async numberMsg => {
        let number = numberMsg.content;

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

        let isNumber = await validNumber(number);
        //let isNumber = true;

        if(isNumber){       

            const btnMsg = await interaction.editReply({
                content: `${'Phone Number: '} \'**${number}**\'`,
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
                    resourceData.SetPhoneNumber(number)
                } else {
                    interaction.editReply({
                        content: 'Canceled',
                        components: [],
                    })
                }

                createResourceRec((btnInt as ButtonInteraction), resourceData, messageArray)
            })

        } else {

            const errMsg = await interaction.editReply({
                content: "\nThis is not a proper phone number.\nFormats:\n\t(123) 456-7890\n\t(123)456-7890\n\t123-456-7890\n\t123.456.7890\n\nWould you like to try again try again.",
                components: [row],
            })

            const confCollector = (errMsg as Message).createMessageComponentCollector({
                max: 1
            })

            confCollector.on('collect', (btnInt) => {
                if(btnInt.customId === 'continue') {
                    interaction.editReply({
                        content: 'Confimed',
                        components: []
                    })
                    resourceData.SetPhoneNumber(number)
                } else {
                    interaction.editReply({
                        content: 'Canceled',
                        components: []
                    })
                }

                createResourceRec(btnInt as ButtonInteraction, resourceData, messageArray)
            })

        }
        
    })
}

function validNumber(string: string) {
    const tester = (/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im);
    return tester.test(string);
}

async function addAddress(resourceData: ProviderData, interaction: ButtonInteraction, messageArray: Message[]) {
    const mainMsg = await interaction.reply({
        content: 'What is the address you want your provider to have?\n\t*Press (Shift + Enter) for a new line.\n\tPress (Enter) to submit.*',
        fetchReply: true,
    })

    const addressCollector = interaction.channel?.createMessageCollector({
        max: 1,
    })

    addressCollector?.on('collect', async addressMsg => {
        const address = addressMsg.content;
        
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
            content: `${'Address:'} \n\'**${address}**\'`,
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
                resourceData.SetAddress(address)
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

async function addEmail(resourceData: ProviderData, interaction: ButtonInteraction, messageArray: Message[]) {
    const { channel } = interaction;

    const mainMsg = await interaction.reply({
        content: 'What is the email you want your resource to have?',
        fetchReply: true,
    })

    const emailCollector = channel?.createMessageCollector({
        max: 1,
    })

    emailCollector?.on('collect', async emailMsg => {
        let email = emailMsg.content;

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

        let isEmail = await validEmail(email);
        //let isEmail = true;

        if(isEmail){       

            const btnMsg = await interaction.editReply({
                content: `${'Email: '} \'**${email}**\'`,
                components: [row],
            })

            const confCollector = await (btnMsg as Message).createMessageComponentCollector({
                max: 1,
            })

            confCollector.on('collect', (btnInt: ButtonInteraction) => {
                if(btnInt.customId === 'continue') {
                    interaction.editReply({
                        content: 'Confimed',
                        components: [],
                    })
                    resourceData.SetEmail(email)
                } else {
                    interaction.editReply({
                        content: 'Canceled',
                        components: [],
                    })
                }

                createResourceRec(btnInt, resourceData, messageArray)
            })

        } else {

            const errMsg = await interaction.editReply({
                content: "\nThis is not a proper email.\nFormat:\n\temail@website.com\n\nWould you like to try again try again.",
                components: [row],
            })

            const confCollector = (errMsg as Message).createMessageComponentCollector({
                max: 1
            })

            confCollector.on('collect', (btnInt: ButtonInteraction) => {
                if(btnInt.customId === 'continue') {
                    interaction.editReply({
                        content: 'Confimed',
                        components: []
                    })
                    addEmail(resourceData, btnInt, messageArray)
                } else {
                    interaction.editReply({
                        content: 'Canceled',
                        components: []
                    })

                    createResourceRec(btnInt, resourceData, messageArray)
                }
            })

        }
        
    })
}

function validEmail(email: string): boolean {
    if(email.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
        return true
      }
    return false
};

async function addEligibility(resourceData: ProviderData, interaction: ButtonInteraction, messageArray: Message[]) {
    const { channel } = interaction;

    const mainMsg = await interaction.reply({
        content: 'What requirements must someone meet in order to be eligible for this provider\'s help?\n\t*Press (Shift + Enter) for a new line.\n\tPress (Enter) to submit.*',
        fetchReply: true,
    })

    const eligibilityCollector = channel?.createMessageCollector({
        max: 1,
    })

    eligibilityCollector?.on('collect', async eligibilityMsg => {
        const eligibility = eligibilityMsg.content;
        
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
            content: `${'Eligibility:'} \n\'**${eligibility}**\'`,
            components: [row],
        })

        const confCollector = await (btnMsg as Message).createMessageComponentCollector({
            max: 1,
        })

        confCollector.on('collect', (btnInt: ButtonInteraction) => {
            if(btnInt.customId === 'continue') {
                interaction.editReply({
                    content: 'Confimed',
                    components: [],
                })
                resourceData.SetEligibility(eligibility)
            } else {
                interaction.editReply({
                    content: 'Canceled',
                    components: [],
                })
            }

            createResourceRec(btnInt, resourceData, messageArray)
        })
    })
}

async function addOrganization(resourceData: ProviderData, interaction: ButtonInteraction, messageArray: Message[]) {
    let organizationList = await organizationSchema.find({guildId: resourceData.guildId});
    let organizationOptionList: {label: string, value: string}[] = []

    for(let i = 0; i < organizationList.length; i++) {
        organizationOptionList.push({label: organizationList[i].name, value: organizationList[i].name})
    }

    const organizationSelectMenu = new MessageSelectMenu()
        .setCustomId('orgSelect')
        .setPlaceholder('Select an Organization')
        .addOptions(organizationOptionList)
        .setMinValues(0)

    const orgActionRow = new MessageActionRow()
        .addComponents(organizationSelectMenu)

    let selectMsg = await interaction.reply({
        content: 'Select an organization to link to.',
        components: [orgActionRow],
        fetchReply: true
    })

    let collector = (selectMsg as Message).createMessageComponentCollector({
        max: 1
    })

    collector.on('collect', async (selectInt: SelectMenuInteraction) => {
        const value = selectInt.values[0]

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

        let confMsg = await selectInt.reply({
            content: 'Received: ' + value,
            components: [row],
            fetchReply: true
        })

        let confCollector = (confMsg as Message).createMessageComponentCollector({max: 1})

        confCollector.on('collect', (confInt: ButtonInteraction) => {
            if(confInt.customId == 'continue') {
                resourceData.SetOrganization(value)
            }

            createResourceRec(confInt, resourceData, messageArray)
        })
    })
}

async function deleteResource(resourceData: ProviderData, interaction: ButtonInteraction, messageArray: Message[]) {
    const { channel } = interaction

    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('cancel')
                .setLabel('Cancel')
                .setStyle('SECONDARY'),
            new MessageButton()
                .setCustomId('deleteResource')
                .setLabel('Delete')
                .setStyle('DANGER')
        )

    const mainMsg = await interaction.reply({
        content: 'Are you sure that you want to delete this resource?',
        components: [row],
        embeds: [resourceData.BuildFullEmbed()],
        fetchReply: true,
    })

    messageArray.push(mainMsg as Message)

    const confConllector = (mainMsg as Message).createMessageComponentCollector({
        max: 1,
    })

    confConllector.on('collect',async (btnInt: ButtonInteraction) => {
        let text = ''
        if(btnInt.customId === 'deleteResource') {
            const resources = await providerSchema.find({guildId: resourceData.guildId})

            if(resources) {
                for(let i = 0; i < resources.length; i++) {
                    if(resources[i].name == resourceData.name) {
                        resources[i].delete()
                    }
                }

                if(resourceData.HasOrganization()) {
                    let organization = await organizationSchema.findOne({name: resourceData.organization.value})
                    for(let i = 0; i < organization.providers.length; i++) {
                        if(organization.providers[i] == resourceData.name) {
                            organization.providers.splice(i, 1)
                        }
                    }

                    organization.save()
                }
            }
            text = 'Deleted.'

            
        } else {
            text = 'Cancled.'
        }

        let looseEnd = await btnInt.reply({
            content: text,
            fetchReply: true
        })

        setTimeout(() => {
            (looseEnd as Message).delete()
        }, 2000)
    })
}

async function submit(resourceData: ProviderData, interaction: ButtonInteraction, messageArray: Message[]) {
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
        embeds: [resourceData.BuildFullEmbed()],
        fetchReply: true,
    })

    messageArray.push(mainMsg as Message)

    const confConllector = (mainMsg as Message).createMessageComponentCollector({
        max: 1,
    })

    confConllector.on('collect',async (btnInt: ButtonInteraction) => {
        if(btnInt.customId === 'continue') {
            //btnInt.deferReply()

            const resources = await providerSchema.find({guildId: resourceData.guildId})

            if(resources) {
                for(let i = 0; i < resources.length; i++) {
                    if(resources[i].name == resourceData.name) {
                        resources.splice(i, 1)
                    }
                }
                
                let newResource = new providerSchema({
                    guildId: resourceData.guildId,
                    name: resourceData.name,
                    description: resourceData.description,
                    url: resourceData.url,
                    thumbnail: resourceData.thumbnail,
                    image: resourceData.image,
                    type: resourceData.GetTypeArray(),
                    region: resourceData.GetRegionArray(),
                    openHours: resourceData.openHours.value,
                    phoneNumber: resourceData.phoneNumber.value,
                    address: resourceData.address.value,
                    email: resourceData.email.value,
                    eligibility: resourceData.eligibility.value,
                    organization: resourceData.organization.value,

                }).save()

                if(resourceData.organization.value != originalData.organization.value){
                    if(originalData.HasOrganization()) {
                        let oldOrganization = await organizationSchema.findOne({name: originalData.organization.value})
                        for(let i = 0; oldOrganization.providers.length; i++) {
                            if(oldOrganization.providers[i] == resourceData.name) {
                                oldOrganization.providers.splice(i, 1)
                            }
                        }
                    }

                    let organization = await organizationSchema.findOne({name: resourceData.organization.value})
                    if(typeof organization.providers == 'undefined') {
                        organization.providers = []
                    }

                    organization.providers.push(resourceData.name)
                    organization.save()
                }

                let loosend = await btnInt.reply({
                    content: 'Saved!',
                    fetchReply: true
                });

                (loosend as Message).delete();
                
                (mainMsg as Message).edit({
                    content: 'Sumbitted.',
                    components: [],
                    embeds: []
                })
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