import { ButtonInteraction } from "discord.js";
import resourceTypeSchema from "src/schema/resourceType-schema";
import ResourceData from "../../resources/resources/ResourceData";
import resourceSchema from "../../schema/resource-schema";
import ResourceObject from "../objects/ResourceObject";

export default async (interaction : ButtonInteraction): Promise<void> => {
    if(!interaction.inCachedGuild()) return;
    const { guild } = interaction

    let resources = await resourceSchema.find({guildId: guild.id});
    resources.reverse();

    let resourceList = []
    resources.forEach(resource => {
        let resourceData = new ResourceData(resource.name, resource.guildId)
        resourceData.SetData(resource)
        
        let resourceObject = new ResourceObject(resourceData, guild)

        resourceList.push(resourceObject)
    });

    const typeList = resourceTypeSchema.findOne({guildId: guild.id})
    
    
}