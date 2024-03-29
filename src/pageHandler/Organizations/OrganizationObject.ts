import { BaseCommandInteraction, ButtonInteraction, DMChannel, Guild, Message, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, TextChannel, User } from "discord.js";
import userSchema from "../../schema/user-schema";
import OrganizationData from "../../resources/organizations/OrganizationData";
import resourceSchema from "../../schema/resource-schema";
import ResourceData from "../../resources/resources/ResourceData";
import guildIdSchema from "../../schema/guildId-schema";
import editOrganization from "../../resources/organizations/editOrganization";
import providerSchema from "../../schema/provider-schema";
import ProviderData from "../../resources/providers/ProviderData"

export default class OrganizationObject {
    data: OrganizationData;
    guild: Guild;
    userID: string;
    userName: string;

    message: any;
    embed: any;

    viewFull: boolean
    #isSaved = false;
    #viewingResourceEmbed = false;

    constructor(embedData: OrganizationData, guild: Guild, userID: string, userName: string) {
        this.data = embedData;
        this.guild = guild;
        this.userID = userID
        this.userName = userName

        this.message = undefined
        this.embed = this.data.BuildEmbed()

        this.viewFull = false;

        this.isSaved()
    }

    async addMessage (channel: DMChannel, userId: string) {

        this.message = await channel.send({
            content: this.data.name + ':',
            embeds: [this.data.BuildEmbed()],
            components: await this.getComponents()
        })

        const btnCollector = (this.message as Message).createMessageComponentCollector();

        btnCollector.on('collect', async (interaction: BaseCommandInteraction) => {
            if(interaction.isButton()) {
                switch(interaction.customId) {
                    case 'rate':
                        this.rate(interaction)
                        break;
                    case 'toggleFull':
                        this.toggleFullEmbed()
    
                        this.interactionReply(interaction)
                        break;
                    case 'save':
                        this.save()
    
                        this.interactionReply(interaction)
                        break;
                    case 'returnToOrg':
                        this.returnToOrg()

                        this.interactionReply(interaction)
                        break;
                    case 'edit':
                        editOrganization(interaction, this.data)
                        break;
                }
            }
            
            if(interaction.isSelectMenu()) {
                let value = interaction.values[0]
                switch(interaction.customId) {
                    case 'resourceSelect': 
                        this.viewResource(value)
                        this.interactionReply(interaction)
                        break;
                    case 'providerSelect':
                        this.interactionReply(interaction)
                        break;
                }
                
            }
            
        })
    }

    toggleFullEmbed() : void {
        this.viewFull = !this.viewFull
        if(this.viewFull) {
            this.embed = this.data.BuildFullEmbed()
        } else {
            this.embed = this.data.BuildEmbed()
        }

        this.refreshMessage()
    }

    async getComponents(): Promise<MessageActionRow[]> {
        let returnArray = []
        let row = new MessageActionRow()

        let toggle;
        if(this.viewFull) {
            toggle = new MessageButton()
                .setCustomId('toggleFull')
                .setStyle('PRIMARY')
                .setLabel('Show Less')
        } else {
            toggle = new MessageButton()
                .setCustomId('toggleFull')
                .setStyle('PRIMARY')
                .setLabel('Show More')
        }

        let saveButton;
        if(this.#isSaved){
            saveButton = new MessageButton()
                .setCustomId('save')
                .setStyle('PRIMARY')
                .setLabel('Unsave')
        } else {
            saveButton = new MessageButton()
                .setCustomId('save')
                .setStyle('SECONDARY')
                .setLabel('Save')
        }

        let rate = new MessageButton()
            .setCustomId('rate')
            .setStyle('SUCCESS')
            .setLabel(`Rate (${this.data.ratings.length})`)

        let resourceButton = new MessageButton()
            .setCustomId('returnToOrg')
            .setStyle('PRIMARY')
            .setLabel('Return to organization')

        let editButton = new MessageButton()
            .setCustomId('edit')
            .setStyle('DANGER')
            .setLabel('Edit or delete')

        if(this.#viewingResourceEmbed) {
            row.addComponents(resourceButton)
        } else {
            row.addComponents(
                toggle,
                rate,
                saveButton
            )

            if(await this.canAddNew(this.userID)) {
                row.addComponents(editButton)
            }
        }

        returnArray.push(row)
        
        if(this.data.resources.length > 0) {
            let options: {label: string, value: string}[] = []

            for(let i = 0; i < this.data.resources.length; i++) {
                options.push({
                    value: this.data.resources[i],
                    label: this.data.resources[i]
                })
            }

            let selectMenu = new MessageSelectMenu()
                .setCustomId('resourceSelect')
                .setPlaceholder('View resources from this organization')
                .addOptions(options)

            let selectRow = new MessageActionRow().addComponents(selectMenu)
            returnArray.push(selectRow)
        }

        if(this.data.providers.length > 0) {
            let options: {label: string, value: string}[] = []

            for(let i = 0; i < this.data.providers.length; i++) {
                options.push({
                    value: this.data.providers[i],
                    label: this.data.providers[i]
                })
            }

            let selectMenu = new MessageSelectMenu()
                .setCustomId('providerSelect')
                .setPlaceholder('View providers from this organization')
                .addOptions(options)

            let selectRow = new MessageActionRow().addComponents(selectMenu)
            returnArray.push(selectRow)
        }


        return returnArray        
    }

    async rate(interaction: ButtonInteraction) {
        let messages: Message[] = []

        const row = this.makeRatingButtons(-1)

        let starMsg = await interaction.reply({
            content: 'How many stars would you rate this resource?',
            components: [row],
            fetchReply: true,
        })

        messages.push(starMsg as Message)

        const starCollector =  (starMsg as Message).createMessageComponentCollector({
            max: 1
        })

        starCollector.on('collect', async (starInt: ButtonInteraction) => {
            let selected = -1;

            switch(starInt.customId) {
                case 'oneStar' :
                    selected = 1;
                    break;
                case 'twoStar' :
                    selected = 2;
                    break;
                case 'threeStar' :
                    selected = 3;
                    break;
                case 'fourStar' :
                    selected = 4;
                    break;
                case 'fiveStar' :
                    selected = 5;
                    break;
            }

            const updatedRow = this.makeRatingButtons(selected);
            
            interaction.editReply({
                content: 'Rated:',
                components: [updatedRow],
            })
            this.data.rate(starInt.user.id, selected)

            messages.forEach(message => {
                message.delete()
            })
        })
    }

    makeRatingButtons(highligted: number) {
        const row = new MessageActionRow()
    
        if(highligted == 1) {
            row.addComponents(
                new MessageButton()
                    .setLabel('⭐️')
                    .setCustomId('oneStar')
                    .setStyle('SUCCESS')
            )
        } else {
            row.addComponents(
                new MessageButton()
                    .setLabel('⭐️')
                    .setCustomId('oneStar')
                    .setStyle('PRIMARY')
            )
        }
    
        if(highligted == 2) {
            row.addComponents(
                new MessageButton()
                    .setLabel('⭐️⭐️')
                    .setCustomId('twoStar')
                    .setStyle('SUCCESS')
            )
        } else {
            row.addComponents(
                new MessageButton()
                    .setLabel('⭐️⭐️')
                    .setCustomId('twoStar')
                    .setStyle('PRIMARY')
            )
        }
    
        if(highligted == 3) {
            row.addComponents(
                new MessageButton()
                    .setLabel('⭐️⭐️⭐️')
                    .setCustomId('threeStar')
                    .setStyle('SUCCESS')
            )
        } else {
            row.addComponents(
                new MessageButton()
                    .setLabel('⭐️⭐️⭐️')
                    .setCustomId('threeStar')
                    .setStyle('PRIMARY')
            )
        }
    
        if(highligted == 4) {
            row.addComponents(
                new MessageButton()
                    .setLabel('⭐️⭐️⭐️⭐️')
                    .setCustomId('fourStar')
                    .setStyle('SUCCESS')
            )
        } else {
            row.addComponents(
                new MessageButton()
                    .setLabel('⭐️⭐️⭐️⭐️')
                    .setCustomId('fourStar')
                    .setStyle('PRIMARY')
            )
        }
            
        if(highligted == 5) {
            row.addComponents(
                new MessageButton()
                    .setLabel('⭐️⭐️⭐️⭐️⭐️')
                    .setCustomId('fiveStar')
                    .setStyle('SUCCESS')
            )
        } else {
            row.addComponents(
                new MessageButton()
                    .setLabel('⭐️⭐️⭐️⭐️⭐️')
                    .setCustomId('fiveStar')
                    .setStyle('PRIMARY')
            )
        }
    
        return row
    }

    interactionReply(interaction: BaseCommandInteraction) {
        interaction.reply({
            content: 'Button Clicked',
            fetchReply: true,
        }).then(msg => {
            (msg as Message).delete()
        })
    }

    removeMessage () {
        if(typeof this.message !== 'undefined') {
            this.message.delete()
        }
    }

    async refreshMessage() {
        (this.message as Message).edit({
            components: await this.getComponents(),
            embeds: [this.embed]
        })
    }

    async isSaved(): Promise<boolean> {
        let userDB = await userSchema.findOne({id: this.userID})

        if(!userDB) {
            this.#isSaved = false
            return false
        }
        
        for (let i = 0; i < userDB.savedOrganizations.length; i++) {
            if(userDB.savedOrganizations[i] == this.data.name){
                this.#isSaved = true
                return true
            }
        }
        this.#isSaved = false
        return false
    }

    async save(): Promise<void> {
        let userDB = await userSchema.findOne({id: this.userID})

        if(!userDB) {
            userDB = new userSchema({
                id: this.userID,
                name: this.userName,
                reports: {
                    userReports: [],
                    autoModeration: [],
                },
                savedResources: [],
                savedOrganizations: [],
                savedRestaurants: []
            })
        } 

        let found = false;
        let i = 0;

        while(i < userDB.savedOrganizations.length && !found) {
            if(userDB.savedOrganizations[i] == this.data.name) {
                found = true;
                this.#isSaved = false
                userDB.savedOrganizations.splice(i, 1)
            }
            i++
        }

        if(!found) {
            userDB.savedOrganizations.push(this.data.name)
            this.#isSaved = true
        }

        userDB.save()
        this.refreshMessage()
    }

    async viewResource(name: string) {
        let resource = await resourceSchema.findOne({name: name});

        let resourceData = new ResourceData(resource.name, this.guild.id)
        resourceData.SetData(resource)

        this.embed = resourceData.BuildFullEmbed()
        this.#viewingResourceEmbed = true;
        this.refreshMessage()
    }

    async viewProvider(name: string) {
        let provider = await providerSchema.findOne({name: name});

        let providerData = new ProviderData(provider.name, this.guild.id)
        providerData.SetData(provider)

        this.embed = providerData.BuildFullEmbed()
        this.#viewingResourceEmbed = true;
        this.refreshMessage()
    }

    returnToOrg() {
        this.embed = this.data.BuildFullEmbed()
        this.#viewingResourceEmbed = false;
        this.viewFull = true
        this.refreshMessage()
    }

    async canAddNew(userId: string): Promise<Boolean> {

        const guildSettings = await guildIdSchema.findOne({guildId: this.guild.id})
    
        let canAdd : any;
       
        const member = this.guild.members.cache.get(userId)
        
        canAdd = member?.roles.cache.has(guildSettings.resourceAdder)
        
        return canAdd
    }
}