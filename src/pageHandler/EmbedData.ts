import { MessageEmbed } from "discord.js";

export default class EmbedData {
    category: string;
    guildId: string;
    data: any;

    constructor(category: string, guildID: string) {
        this.category = category,
        this.guildId = guildID
    }

    title: string = '';
    description: string = ''
    color: string = ''
    image: string = ''
    thumbnail: string = ''
    url: string = ''

    HasTitle(): boolean {
        return (this.title !== '')
    }

    HasDescription(): boolean {
        return (this.description !== '')
    }

    HasColor(): boolean {
        return (this.color !== '')
    }

    HasImage(): boolean {
        return (this.image !== '')
    }

    HasThumbnail(): boolean {
        return (this.thumbnail !== '')
    }

    HasUrl(): boolean {
        return (this.url !== '')
    }

    SetTitle(value: string): void {
        this.title = value
    }

    SetDescription(value: string): void {
        this.description = value
    }

    SetColor(value: string): void {
        this.color = value
    }

    SetImage(value: string): void {
        this.image = value
    }

    SetThumbnail(value: string): void {
        this.thumbnail = value
    }

    SetUrl(value: string): void {
        this.url = value
    }

    GetData() {
        return {
            Title: this.title,
            Description: this.description,
            Color: this.color,
            Image: this.image,
            Thumbnail: this.thumbnail,
            Url: this.url,
        }
    }

    BuildEmbed(): MessageEmbed {
        const embed = new MessageEmbed()
            .setTitle(this.title)
            .setDescription(this.description)
    
        if(this.HasImage()){
            embed.setImage(this.image)
        }
    
        if(this.HasThumbnail()){
            embed.setThumbnail(this.thumbnail)
        }
    
        if(this.HasUrl()) {
            embed.setURL(this.url)
        }
    
        return embed
    }
}