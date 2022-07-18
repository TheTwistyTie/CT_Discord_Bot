import { ColorResolvable, MessageEmbed } from "discord.js";
import { get } from "mongoose";
import resourceSchema from "../../schema/resource-schema";

export default class ResourceData {
    name: string;
    guildId: string;
    description: string = 'Default Description'
    thumbnail: string = ''
    url: string = ''
    image: string = ''

    type: string[] = []
    region: string[] = []

    ratings: [{
        userId: string,
        rating: number
    }] = [{userId: '0', rating: 3}]

    openHours = {
        name: 'Open Hours:',
        value: 'unset',
        inline: true,
    }

    phoneNumber = {
        name: 'Phone Number:',
        value: 'unset',
        inline: true,
    }

    address = {
        name: 'Address:',
        value: 'unset',
        inline: true,
    }

    email = {
        name: 'Email:',
        value: 'unset',
        inline: false,
    }

    eligibility = {
        name: 'Eligibility:',
        value: 'unset',
        inline: false,
    }

    organization = {
        name: 'Organization:',
        value: 'unset',
        inline: true,
    }

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
        region: string[],
        openHours: string,
        phoneNumber: string,
        address: string,
        email: string,
        eligibility: string,
        ratings: [{
            userId: string,
            rating: number
        }],
        organization: string,
    }): void {
        this.name = data.name
        this.guildId = data.guildId
        this.description = data.description
        this.url = data.url
        this.thumbnail = data.thumbnail
        this.image = data.image
        this.type = data.type
        this.region = data.region
        this.ratings = data.ratings
        this.openHours.value = data.openHours
        this.phoneNumber.value = data.phoneNumber
        this.address.value = data.address
        this.email.value = data.email
        this.eligibility.value = data.eligibility
        this.organization.value = data.organization
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

    SetRegion(nRegion: string): void {
        if(this.region.length == 0) {
            this.region = [nRegion]
        } else {
            let i = 0;
            let removed = false;
            while(i<this.region.length) {
                if(this.region[i] == nRegion) {
                    this.region.splice(i,1)
                    removed = true
                }
                i++
            }

            if(!removed) {
                this.region.push(nRegion)
            }
        }
    }

    SetRegionArray(values: string[]) {
        this.region = values
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

    SetOpenHours(value: string): void {
        this.openHours.value = value
    }

    SetPhoneNumber(value: string): void {
        this.phoneNumber.value = value;
    }

    SetAddress(value: string): void {
        this.address.value = value
    }

    SetEmail(value: string): void {
        this.email.value = value;
    }

    SetEligibility(value: string): void {
        this.eligibility.value = value
    }

    SetImage(value: string): void {
        this.image = value
    }

    SetOrganization(value: string): void {
        this.organization.value = value
    }

    AddRating(value: {userId: string, rating: number}): void {
        this.ratings.push(value)
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

    HasTag(value: string): boolean {
        let has = false;
        let i = 0;

        while(i<this.type.length && !has) {
            if(this.type[i] == value) {
                has = true;
            }
            i++
        }

        return has;
    }

    HasRegions(): boolean {
        return (this.region.length >= 1)
    }

    HasRegion(value: string): boolean {
        let has = false;
        let i = 0;

        while(i<this.region.length && !has) {
            if(this.region[i] == value) {
                has = true;
            }
            i++
        }

        return has;
    }

    HasOpenHours(): boolean {
        if(this.openHours.value === 'unset' || typeof this.openHours.value == 'undefined') {
            return false;
        }
        return true;
    }

    HasPhoneNumber(): boolean {
        if(this.phoneNumber.value === 'unset' || typeof this.phoneNumber.value == 'undefined') {
            return false;
        }
        return true;
    }

    HasAddress(): boolean {
        if(this.address.value == 'unset' || typeof this.address.value == 'undefined') {
            return false;
        }
        return true
    }

    HasEmail(): boolean {
        if(this.email.value == 'unset'|| typeof this.email.value == 'undefined') {
            return false
        }
        return true;
    }

    HasEligibility(): boolean {
        if(this.eligibility.value == 'unset' || typeof this.eligibility.value == 'undefined') {
            return false
        }
        return true;
    }

    HasOrganization(): boolean{
        if(this.organization.value == 'unset' || typeof this.organization.value == 'undefined') {
            return false
        }
        return true
    }

    GetType(): {name: string, value: string, inline: boolean} {
        let label = 'Tags:'

        if(this.type.length == 0) {
            return {
                name: label,
                value: 'untagged',
                inline: false
            }
        } else if (this.type.length == 1) {
            return {
                name: label,
                value: this.type[0],
                inline: true,
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
                value: text,
                inline: true,
            }
        }
    }

    GetTypeArray(): string[] {
        return this.type
    }

    GetRegion(): {name: string, value: string, inline: boolean} {
        let label = 'Regions:'

        if(this.region.length == 0) {
            return {
                name: label,
                value: 'untagged',
                inline: false
            }
        } else if (this.region.length == 1) {
            return {
                name: label,
                value: this.region[0],
                inline: true
            }
        } else {
            let text = this.region[0]

            let i = 1;
            while(i<this.region.length) {
                text += ', ' + this.region[i]
                i++
            }

            return {
                name: label,
                value: text,
                inline: true,
            }
        }
    }

    GetRegionArray(): string[] {
        return this.region
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

        if(this.HasType()) {
            embed.setFooter({text: this.GetType().value})
        }

    
        return embed
    }

    GetOrganization(): string {
        return this.organization.value
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
        if(this.HasOpenHours()) {
            fields.push(this.openHours)
        }

        if(this.HasPhoneNumber()) {
            fields.push(this.phoneNumber)
        }

        if(this.HasAddress()) {
            fields.push(this.address)
        }

        if(this.HasEmail()) {
            fields.push(this.email)
        }

        if(this.HasEligibility()) {
            fields.push(this.eligibility)
        }

        if(this.HasOrganization()) {
            fields.push(this.organization)
        }

        if(this.HasType()) {
            fields.push(this.GetType())
        }

        if(this.HasRegions()) {
            fields.push(this.GetRegion())
        }

        embed.addFields(fields)
    
        return embed
    }

    async rate(userId: string, rating: number) {
        let i = 0;
        let found = false
        
        while(i < this.ratings.length && !found) {
            if(this.ratings[i].userId == userId) {
                found = true;
                this.ratings[i].rating = rating
            }
            i++
        }

        if(!found) {
            this.ratings.push({
                userId: userId,
                rating: rating
            })
        }

        let dbConnection = await resourceSchema.findOne({name: this.name})
        if(dbConnection) {
            dbConnection.ratings = this.ratings;
            dbConnection.save()
        }
        
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
        let numRatings: number = 0
        let rating: number = 0

        while(numRatings < this.ratings.length) {
            rating += this.ratings[numRatings].rating
            numRatings++
        }
        rating = rating/numRatings
        if(numRatings == 0) {
            rating = 3;
        }

        const red = '#FF0000'
        const yellow = '#FFFF00'
        const green = '#00FF00'
        const grey = '#808080'

        let ratingPercent = (rating / 5.0) - 0.1

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

        return ratingColor as ColorResolvable
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