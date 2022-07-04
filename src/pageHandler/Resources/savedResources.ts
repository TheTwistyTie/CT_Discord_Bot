import { ButtonInteraction, DMChannel, Message } from "discord.js";
import ResourceData from "../../resources/resources/ResourceData";
import resourceSchema from "../../schema/resource-schema";
import userSchema from "../../schema/user-schema";
import PageHandler from "./PageHandler";
import ResourceObject from "./ResourceObject";

export default async (interaction: ButtonInteraction): Promise<void> => {
    if(!interaction.inCachedGuild()) return;

    let userDB = await userSchema.findOne({id: interaction.user.id});
    let savedResources = userDB.savedResources;

    let resourcesDB = await resourceSchema.find({guildId: interaction.guild.id})

    let savedResourceList = []
    for(let i = 0; i < savedResources.length; i++){
        for(let c = 0; c < resourcesDB.length; c++) {
            if(savedResources[i] == resourcesDB[c].name){
                savedResourceList.push(resourcesDB[c])
            }
        }
    }

    let savedResourceData: ResourceData[] = []
    savedResourceList.forEach(resource => {
        let data = new ResourceData(resource.name, resource.guildId)
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