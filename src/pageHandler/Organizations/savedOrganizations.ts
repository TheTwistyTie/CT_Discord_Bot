import { ButtonInteraction, DMChannel, Message } from "discord.js";
import OrganizationData from "../../resources/organizations/OrganizationData";
import organizationSchema from "../../schema/organization-schema";
import userSchema from "../../schema/user-schema";
import PageHandler from "./PageHandler";
import OrganizationObject from "./OrganizationObject";

export default async (interaction: ButtonInteraction): Promise<void> => {
    if(!interaction.inCachedGuild()) return;

    let userDB = await userSchema.findOne({id: interaction.user.id});
    let savedOrganizations = userDB.savedOrganizations;

    let resourcesDB = await organizationSchema.find({guildId: interaction.guild.id})

    let savedResourceList = []
    for(let i = 0; i < savedOrganizations.length; i++){
        for(let c = 0; c < resourcesDB.length; c++) {
            if(savedOrganizations[i] == resourcesDB[c].name){
                savedResourceList.push(resourcesDB[c])
            }
        }
    }

    let savedResourceData: OrganizationData[] = []
    savedResourceList.forEach(resource => {
        let data = new OrganizationData(resource.name, resource.guildId)
        data.SetData(resource)

        savedResourceData.push(data)
    });

    let savedResourceObjs: OrganizationObject[] = []
    savedResourceData.forEach(resource => {
        savedResourceObjs.push(new OrganizationObject(resource, interaction.guild, interaction.user.id, interaction.user.username))
    });

    let dmMsg = await interaction.user.send({
        content: 'Your saved organizations:',
    })

    let pageHandler = new PageHandler(savedResourceObjs, (dmMsg.channel as DMChannel), interaction.user.id)
}