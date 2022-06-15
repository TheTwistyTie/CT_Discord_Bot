import { ButtonInteraction, Guild, Message, MessageActionRow, MessageButton, MessageEmbed, TextChannel } from "discord.js";
import ResourceData from "../../resources/resources/ResourceData";

export default class MessageObject {
    data: ResourceData;
    index: number;
    guild: Guild;

    message: any;
    embed: any;

    viewFull: boolean

    constructor(embedData: ResourceData, index: number, guild: Guild) {
        this.data = embedData;
        this.index = index;
        this.guild = guild;

        this.message = undefined
        this.embed = this.data.BuildEmbed()

        this.viewFull = false;
    }

    async addMessage (channel: TextChannel, userId: string) {
        this.message = await channel.send({
            content: this.data.name + ':',
            embeds: [this.data.BuildEmbed()],
            components: this.getComponents()
        })

        const btnCollector = (this.message as Message).createMessageComponentCollector();

        btnCollector.on('collect', (btnInt: ButtonInteraction) => {
            switch(btnInt.customId) {
                case 'rate':
                    break;
                case 'toggle':
                    this.toggleFullEmbed()
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

    getComponents(): MessageActionRow[] {
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

        let rate = new MessageButton()
            .setCustomId('rate')
            .setStyle('SUCCESS')
            .setLabel('Rate')
            
        row.addComponents(
            toggle,
            rate
        )

        return [row]
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

    refreshMessage() {
        (this.message as Message).edit({
            components: this.getComponents(),
            embeds: [this.embed]
        })
    }
}