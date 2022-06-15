import { ButtonInteraction } from "discord.js";
import ResourceData from "src/resources/resources/ResourceData";
import resourceSchema from "../../schema/resource-schema";

export default async (interaction : ButtonInteraction): Promise<void> => {
    const { guild } = interaction

    let resources = await resourceSchema.find({guildId: guild?.id});
    resources.reverse();

    let resourceList = []
    resources.forEach(resource => {
        let resourceObj = new ResourceData(resource.name, resource.guildId)

        
    });


}