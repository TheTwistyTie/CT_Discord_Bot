import { ButtonInteraction, DMChannel, Guild, Message, MessageActionRow, MessageButton, MessageEmbed, TextChannel, User } from "discord.js";
import userSchema from "../../schema/user-schema";
import ProviderData from "../../resources/providers/ProviderData";
import organizationSchema from "../../schema/organization-schema";
import OrganizationData from "../../resources/organizations/OrganizationData";
import guildIdSchema from "../../schema/guildId-schema";
import editResource from "../../resources/providers/editProvider";

export default class ProviderObject {
    data: ProviderData;
    guild: Guild;
    userID: string;
    userName: string;

    message: any;
    embed: any;

    viewFull: boolean
    #isSaved = false;
    #showingOrganization = false;

    constructor(embedData: ProviderData, guild: Guild, userID: string, userName: string) {
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
            components: await this.getComponents(userId)
        })

        const btnCollector = (this.message as Message).createMessageComponentCollector();

        btnCollector.on('collect', async (btnInt: ButtonInteraction) => {
            let looseEnd
            switch(btnInt.customId) {
                case 'rate':
                    this.rate(btnInt)
                    break;
                case 'toggleFull':
                    this.toggleFullEmbed()

                    this.interactionReply(btnInt)
                    break;
                case 'save':
                    this.save()

                    this.interactionReply(btnInt)
                    break;
                case 'seeOrg':
                    this.showOrganziation()

                    this.interactionReply(btnInt)
                    break;
                case 'edit':
                    editResource(btnInt, this.data)
                    break;
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

    async getComponents(userId: string): Promise<MessageActionRow[]> {
        let row = new MessageActionRow()
        let toggle;
        let saveButton;
        let rate;
        let seeOrgButton

        if(this.#showingOrganization) {
            seeOrgButton = new MessageButton()
            .setCustomId('seeOrg')
            .setStyle('PRIMARY')
            .setLabel('See resource')
        } else {
            seeOrgButton = new MessageButton()
            .setCustomId('seeOrg')
            .setStyle('PRIMARY')
            .setLabel('See linked organization')
        }

        if(this.viewFull) {
            toggle = new MessageButton()
                .setCustomId('toggleFull')
                .setStyle('PRIMARY')
                .setLabel('Show less')
        } else {
            toggle = new MessageButton()
                .setCustomId('toggleFull')
                .setStyle('PRIMARY')
                .setLabel('Show more')
        }
        
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

        rate = new MessageButton()
            .setCustomId('rate')
            .setStyle('SUCCESS')
            .setLabel(`Rate (${this.data.ratings.length})`)

        let editButton = new MessageButton()
            .setCustomId('edit')
            .setStyle('DANGER')
            .setLabel('Edit or delete')

        if(this.data.HasOrganization()) {
            if(this.#showingOrganization) {
                row.addComponents(seeOrgButton)
            } else {
                row.addComponents(
                    seeOrgButton,
                    toggle,
                    rate,
                    saveButton,
                )

                if(await this.canAddNew(userId)) {
                    row.addComponents(editButton)
                }
            }
        } else {
            row.addComponents(
                toggle,
                rate,
                saveButton,
            )

            if(await this.canAddNew(userId)) {
                row.addComponents(editButton)
            }
        }         

        return [row]
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

    interactionReply(interaction: ButtonInteraction) {
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
            components: await this.getComponents(this.userID),
            embeds: [this.embed]
        })
    }

    async isSaved(): Promise<boolean> {
        let userDB = await userSchema.findOne({id: this.userID})

        if(!userDB) {
            this.#isSaved = false
            return false
        }
        
        for (let i = 0; i < userDB.savedResources.length; i++) {
            if(userDB.savedResources[i] == this.data.name){
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

        while(i < userDB.savedResources.length && !found) {
            if(userDB.savedResources[i] == this.data.name) {
                found = true;
                this.#isSaved = false
                userDB.savedResources.splice(i, 1)
            }
            i++
        }

        if(!found) {
            userDB.savedResources.push(this.data.name)
            this.#isSaved = true
        }

        userDB.save()
        this.refreshMessage()
    }

    async showOrganziation() {
        if(this.#showingOrganization) {
            this.#showingOrganization = false;
            this.viewFull = true
            this.embed = this.data.BuildFullEmbed()
        } else {
            let organization = await organizationSchema.findOne({name: this.data.GetOrganization()})

            let orgData = new OrganizationData(organization.name, this.guild.id)
            orgData.SetData(organization)

            this.embed = orgData.BuildFullEmbed()
            this.#showingOrganization = true;
        }

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