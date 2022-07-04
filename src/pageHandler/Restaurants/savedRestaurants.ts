import { ButtonInteraction, DMChannel, Message } from "discord.js";
import RestaurantData from "../../resources/restaurants/RestaurantData";
import restaurantSchema from "../../schema/restaurant-schema";
import userSchema from "../../schema/user-schema";
import PageHandler from "./PageHandler";
import RestaurantObject from "./RestaurantObject";

export default async (interaction: ButtonInteraction): Promise<void> => {
    if(!interaction.inCachedGuild()) return;

    let userDB = await userSchema.findOne({id: interaction.user.id});
    let savedRestaurant = userDB.savedRestaurant;

    let resourcesDB = await restaurantSchema.find({guildId: interaction.guild.id})

    let savedResourceList = []
    for(let i = 0; i < savedRestaurant.length; i++){
        for(let c = 0; c < resourcesDB.length; c++) {
            if(savedRestaurant[i] == resourcesDB[c].name){
                savedResourceList.push(resourcesDB[c])
            }
        }
    }

    let savedResourceData: RestaurantData[] = []
    savedResourceList.forEach(resource => {
        let data = new RestaurantData(resource.name, resource.guildId)
        data.SetData(resource)

        savedResourceData.push(data)
    });

    let savedResourceObjs: RestaurantObject[] = []
    savedResourceData.forEach(resource => {
        savedResourceObjs.push(new RestaurantObject(resource, interaction.guild, interaction.user.id, interaction.user.username))
    });

    let dmMsg = await interaction.user.send({
        content: 'Your saved resources:',
    })

    let pageHandler = new PageHandler(savedResourceObjs, (dmMsg.channel as DMChannel), interaction.user.id)
}