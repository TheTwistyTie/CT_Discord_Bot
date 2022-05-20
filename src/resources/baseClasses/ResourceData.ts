import { MessageEmbed } from "discord.js";

export default class ResourceData {
    name: string;
    guildId: string;
    description: string = 'Default Description'
    thumbnail: string = ''
    url: string = ''
    image: string = ''

    constructor(name: string, guildId: string) {
        this.name = name;
        this.guildId = guildId
    }

    SetName(value: string): void {
        this.name = value
    }

    SetDescription(value: string): void {
        this.description = value
    }

    SetThumbnail(value: string): void {
        this.thumbnail = value
    }

    SetUrl(value: string): void {
        this.url = value
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

    BuildEmbed(resourceData: ResourceData): MessageEmbed {
        const embed = new MessageEmbed()
            .setTitle(resourceData.name)
            .setDescription(resourceData.description)
    
        if(resourceData.HasImage()){
            embed.setImage(resourceData.image)
        }
    
        if(resourceData.HasThumbnail()){
            embed.setThumbnail(resourceData.thumbnail)
        }
    
        if(resourceData.HasUrl()) {
            embed.setURL(resourceData.url)
        }
    
        return embed
    }
}