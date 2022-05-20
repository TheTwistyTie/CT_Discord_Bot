import { ButtonInteraction, Guild, Message, MessageActionRow, MessageButton, MessageEmbed, TextChannel } from "discord.js";
import EmbedData from "./EmbedData";

export default class MessageObject {
    data: EmbedData;
    index: number;
    guild: Guild;

    message: any;
    embed: any;

    constructor(embedData: EmbedData, index: number, guild: Guild) {
        this.data = embedData;
        this.index = index;
        this.guild = guild;

        this.message = undefined
        this.embed = this.data.BuildEmbed()
    }

    async addMessage (channel: TextChannel, userId: string) {
        this.message = await channel.send({
            content: this.data.title + ':',
            embeds: this.buildEmbed(),
            components: this.getComponents()
        })

        const btnCollector = (this.message as Message).createMessageComponentCollector();

        btnCollector.on('collect', (btnInt: ButtonInteraction) => {
            switch(btnInt.customId) {
                case 'rate':
                    break;
            }
        })
    }

    buildEmbed(): MessageEmbed[] {
        const embed = new MessageEmbed()
            .setTitle(this.data.title)
            .setDescription(this.data.description)
    
        if(this.data.HasImage()){
            embed.setImage(this.data.image)
        }
    
        if(this.data.HasThumbnail()){
            embed.setThumbnail(this.data.thumbnail)
        }
    
        if(this.data.HasUrl()) {
            embed.setURL(this.data.url)
        }
    
        return [embed]
    }

    getComponents(): MessageActionRow[] {
        return [new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('rate')
                    .setStyle('SUCCESS')
                    .setLabel('Rate')
            )]
    }

    getColor(rating: number, numRatings: number): string {
        const red = '#FF0000'
        const yellow = '#FFFF00'
        const green = '#00FF00'
        const grey = '#808080'

        let ratingPercent = (rating / 5.0) - 0.1

        return '#808080'

        let ratingColor
        if(ratingPercent < 0.5) {
            ratingColor = this.blendColors(red, yellow, ratingPercent * 2)
        } else {
            ratingColor = this.blendColors(yellow, green, (ratingPercent - 0.5) * 2)
        }

        if(numRatings < 5) {
            let geryblend = (numRatings / 5.0) - 0.1
    
            ratingColor = this.blendColors(grey, ratingColor, geryblend)
        }

        return ratingColor
    }

    blendColors = (color1: string, color2: string, percentage: number): string => {
    
        let color1RGB = [parseInt(color1[1] + color1[2], 16), parseInt(color1[3] + color1[4], 16), parseInt(color1[5] + color1[6], 16)];
        let color2RGB = [parseInt(color2[1] + color2[2], 16), parseInt(color2[3] + color2[4], 16), parseInt(color2[5] + color2[6], 16)];
    
        let color3RGB = [ 
            (1 - percentage) * color1RGB[0] + percentage * color2RGB[0], 
            (1 - percentage) * color1RGB[1] + percentage * color2RGB[1], 
            (1 - percentage) * color1RGB[2] + percentage * color2RGB[2]
        ];
    
        let color3 = '#' + this.intToHex(color3RGB[0]) + this.intToHex(color3RGB[1]) + this.intToHex(color3RGB[2]);
    
        return color3
    }
    
    intToHex = (num: number): string => {
        let hex = Math.round(num).toString(16);
        if (hex.length == 1)
            hex = '0' + hex;
        return hex;
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
            embeds: this.embed
        })
    }
}