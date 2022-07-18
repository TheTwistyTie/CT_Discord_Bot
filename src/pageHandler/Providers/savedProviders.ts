import { ButtonInteraction, DMChannel, Message } from "discord.js";
import ProviderData from "../../resources/providers/ProviderData";
import providerSchema from "../../schema/provider-schema";
import userSchema from "../../schema/user-schema";
import PageHandler from "./pageHandler"
import ResourceObject from "./ProviderObject";

export default async (interaction: ButtonInteraction): Promise<void> => {
    if(!interaction.inCachedGuild()) return;

    let userDB = await userSchema.findOne({id: interaction.user.id});
    let savedResources = userDB.savedResources;

    let resourcesDB = await providerSchema.find({guildId: interaction.guild.id})

    let savedResourceList = []
    for(let i = 0; i < savedResources.length; i++){
        for(let c = 0; c < resourcesDB.length; c++) {
            if(savedResources[i] == resourcesDB[c].name){
                savedResourceList.push(resourcesDB[c])
            }
        }
    }

    let savedResourceData: ProviderData[] = []
    savedResourceList.forEach(resource => {
        let data = new ProviderData(resource.name, resource.guildId)
        data.SetData(resource)

        savedResourceData.push(data)
    });

    let savedResourceObjs: ResourceObject[] = []
    savedResourceData.forEach(resource => {
        savedResourceObjs.push(new ResourceObject(resource, interaction.guild, interaction.user.id, interaction.user.username))
    });

    let dmMsg = await interaction.user.send({
        content: 'Your saved resources:',
    })

    let pageHandler = new PageHandler(savedResourceObjs, (dmMsg.channel as DMChannel), interaction.user.id)
}