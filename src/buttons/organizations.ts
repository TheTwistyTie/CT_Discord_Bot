import { ButtonInteraction, Message, MessageActionRow, MessageButton, Role, RoleManager, User } from "discord.js"
import guildIdSchema from "../schema/guildId-schema"
import userSchema from "../schema/user-schema"

export default async (interaction: ButtonInteraction): Promise<void> => {
    const row = new MessageActionRow()
    const findButton = new MessageButton()
    .setCustomId('find')
    .setLabel('Find new organizations!')
    .setStyle('PRIMARY')
    
    let savedButton;
    if(await hasSaved(interaction.user)) {
        savedButton = new MessageButton()
        .setCustomId('saved')
        .setLabel('View saved oragnaizations!')
        .setStyle('PRIMARY')
    } else {
        savedButton = new MessageButton()
        .setCustomId('saved')
        .setLabel('View saved oragnizations!')
        .setStyle('SECONDARY')
        .setDisabled(true)
    }

    row.addComponents(
        findButton,
        savedButton
    )

    const addable = await canAddNew(interaction)
    if(addable) {
        row.addComponents(
            new MessageButton()
                .setCustomId('newResource')
                .setLabel('Add new organization')
                .setStyle('PRIMARY')
        )
    }

    const message = await interaction.reply({
        content: 'What would you like to do?',
        components: [row],
        ephemeral: true,
        fetchReply: true
    })

    const collector = (message as Message).createMessageComponentCollector()

    collector?.on('collect', (i: ButtonInteraction) => {
        const {customId} = i
        switch(customId){
            case 'find':
                break;
            case 'saved':
                break;
            case 'add':
                break;
        }
    })
}

async function hasSaved(user: User) {
    let userData = await userSchema.findOne({id: user.id})
    if(!userData) {
        userData = new userSchema({
            id: user.id,
            name: user.username,
        })
    }

    if(userData.savedResources.length > 0) {
        return true;
    } else {
        return false;
    }
    
}

const canAddNew = async (interaction: ButtonInteraction): Promise<Boolean> => {

    const guildSettings = await guildIdSchema.findOne({guildId: interaction.guild?.id})

    let canAdd : any;
   
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    
    canAdd = member?.roles.cache.has(guildSettings.resourceAdder)
    
    return canAdd
}
