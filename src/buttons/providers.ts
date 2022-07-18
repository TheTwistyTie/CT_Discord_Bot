import { ButtonInteraction, Message, MessageActionRow, MessageButton, Role, RoleManager, User } from "discord.js"
import savedProviders from "../pageHandler/Providers/savedProviders"
import findProviders from "../pageHandler/Providers/findProviders"
import addProvider from "../resources/providers/addProvider"
import guildIdSchema from "../schema/guildId-schema"
import userSchema from "../schema/user-schema"

export default async (interaction: ButtonInteraction): Promise<void> => {
    const row = new MessageActionRow()
    const findButton = new MessageButton()
        .setCustomId('find')
        .setLabel('Find new resources!')
        .setStyle('PRIMARY')
    
    let savedButton;
    if(await hasSaved(interaction.user)) {
        savedButton = new MessageButton()
        .setCustomId('saved')
        .setLabel('View saved resources!')
        .setStyle('PRIMARY')
    } else {
        savedButton = new MessageButton()
        .setCustomId('saved')
        .setLabel('View saved resources!')
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
                .setCustomId('add')
                .setLabel('Add new provider')
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

    collector?.on('collect', async (i: ButtonInteraction) => {
        const {customId} = i
        let content = ''
        switch(customId){
            case 'find':
                findProviders(i);
                content = 'Finding provider!\nCheck your DM\'s'
                break;
            case 'saved':
                savedProviders(i);
                content = 'Viewing saved providers!\nCheck your DM\'s'
                break;
            case 'add':
                addProvider(i)
                content = 'Adding provider!\nCheck your DM\'s'
                break;
        }

        let loosend = await i.reply({content: content, fetchReply: true})
        setTimeout(() => {(loosend as Message).delete()}, 2000);
        
    })
}

async function hasSaved(user: User) {
    let userData = await userSchema.findOne({id: user.id})
    if(!userData) {
        userData = new userSchema({
            id: user.id,
            name: user.username,
        }).save()
    }

    if(userData.savedResources.length > 1) {
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
