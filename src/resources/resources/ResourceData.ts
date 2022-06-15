import { ColorResolvable, MessageEmbed } from "discord.js";
import { get } from "mongoose";

export default class ResourceData {
    name: string;
    guildId: string;
    description: string = 'Default Description'
    thumbnail: string = ''
    url: string = ''
    image: string = ''

    type: string[] = []

    ratings: [{
        userId: string,
        rating: number
    }] = [{userId: '0', rating: 3}]

    constructor(name: string, guildId: string) {
        this.name = name;
        this.guildId = guildId
    }

    SetData(data: {
        name: string,
        guildId: string,
        description: string,
        url: string,
        thumbnail: string,
        image: string,
        type: string[],
        ratings: [{
            userId: string,
            rating: number
        }],
    }): void {
        this.name = data.name
        this.guildId = data.guildId
        this.description = data.description
        this.url = data.url
        this.thumbnail = data.thumbnail
        this.image = data.image
        this.type = data.type
        this.ratings = data.ratings
    }

    SetType(nType: string): void {
        if(this.type.length == 0) {
            this.type = [nType]
        } else {
            let i = 0;
            let removed = false;
            while(i<this.type.length) {
                if(this.type[i] == nType) {
                    this.type.splice(i,1)
                    removed = true
                }
                i++
            }

            if(!removed) {
                this.type.push(nType)
            }
        }
    }

    SetTypeArray(values: string[]) {
        this.type = values
    }

    SetName(value: string): void {
        console.log(this.name)
        this.name = value
    }

    SetDescription(value: string): void {
        this.description = value
    }

    SetThumbnail(value: string): void {
        this.thumbnail = value
    }

    SetUrl(value: string): void {
        if(this.validURL(value)) {
            this.url = value
        } else {
            value = 'https://' + value
            if(this.validURL(value)) {
                this.url = value
            }
        }

    }

    SetImage(value: string): void {
        this.image = value
    }

    HasDescription(): boolean {
        return (this.description !== 'Default Description')
    }

    HasThumbnail(): boolean {
        return (this.thumbnail !== '')
    }

    HasUrl(): boolean {
        return (this.url !== '')
    }

    HasImage(): boolean {
        return (this.image !== '')
    }

    HasType(): boolean {
        if(this.type.length >= 1) {
            return true
        }
        return false
    }

    GetType(): {name: string, value: string} {
        let label = 'Tags:'

        if(this.type.length == 0) {
            return {
                name: label,
                value: 'untagged'
            }
        } else if (this.type.length == 1) {
            return {
                name: label,
                value: this.type[0]
            }
        } else {
            let text = this.type[0]

            let i = 1;
            while(i<this.type.length) {
                text += ', ' + this.type[i]
                i++
            }

            return {
                name: label,
                value: text
            }
        }
    }

    GetTypeArray(): string[] {
        return this.type
    }

    BuildEmbed(): MessageEmbed {
        const embed = new MessageEmbed()
            .setTitle(this.name)
            .setDescription(this.description)
            .setColor(this.getColor())
    
        if(this.HasImage()){
            embed.setImage(this.image)
        }
    
        if(this.HasThumbnail()){
            embed.setThumbnail(this.thumbnail)
        }
    
        if(this.HasUrl()) {
            embed.setURL(this.url)
        }

        let fields = []
        if(this.HasType()) {
            //fields.push(this.GetType())
            embed.setFooter({text: this.GetType().value})
        }

    
        return embed
    }

    BuildFullEmbed(): MessageEmbed {
        const embed = new MessageEmbed()
            .setTitle(this.name)
            .setDescription(this.description)
            .setColor(this.getColor())
    
        if(this.HasImage()){
            embed.setImage(this.image)
        }
    
        if(this.HasThumbnail()){
            embed.setThumbnail(this.thumbnail)
        }
    
        if(this.HasUrl()) {
            embed.setURL(this.url)
        }

        let fields = []
        if(this.HasType()) {
            fields.push(this.GetType())
            //embed.setFooter({text: this.GetType().value})
        }

        embed.addFields(fields)
    
        return embed
    }

    validURL(string: string) {
        let res = false;
    
        if(string.startsWith('https://')) {
            const tester = (/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
            res = tester.test(string);
        }
    
        return res
    }

    getColor(): ColorResolvable {
        let numRatings = 0
        let rating = 0
        while(numRatings < this.ratings.length) {
            rating += this.ratings[numRatings].rating
            numRatings++
        }
        rating = rating/numRatings

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
}