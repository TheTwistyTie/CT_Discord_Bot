import { ButtonInteraction, DMChannel, Message, MessageActionRow, MessageButton, TextChannel } from "discord.js"
import OrganizationObject from "./OrganizationObject";

export default class PageHandler {
    items: OrganizationObject[];
    channel: DMChannel;
    userId: string;

    constructor(items: OrganizationObject[], channel: DMChannel, userId: string) {
        this.items = items;
        this.channel = channel;
        this.userId = userId;

        this.init()
    }

    pageSize = 4;
    numPages = 1;
    currentPage = 1;
    messageIndexes: number[] = [];

    init() {
        this.numPages = parseInt((this.items.length / this.pageSize) as unknown as string, 10);
        if(this.items.length % this.pageSize != 0) {
            this.numPages++;
        }

        if(this.numPages == 1) {
            for(let i = 0; i < this.items.length; i++) {
                this.messageIndexes.push(i)
            }
        } else {
            this.messageIndexes = [0, 1, 2, 3]
        }

        this.show()
        setTimeout(() => {this.pageController()}, 2000)
    }

    clear(indexes: number[] | undefined): void {
        if(typeof indexes === 'undefined') {
            this.items.forEach(item => {
                item.removeMessage()
            });
        } else {
            indexes.forEach(index => {
                this.items[index].removeMessage() //remove item here
            })
        }
        
        if(typeof this.pageMessage != 'undefined') {
            this.pageMessage.delete()
        }
        this.messageIndexes = []
    }

    show(): void {
        for(let i = 0; i < this.messageIndexes.length; i++) {
            this.items[this.messageIndexes[i]].addMessage(this.channel, this.userId) //Show message here
        }
    }

    pageMessage: Message | undefined;
    async pageController () {
        const row = this.makeMessageRow()

        this.pageMessage = await this.channel.send({
            content: `Page ${this.currentPage} of ${this.numPages}`,
            components: [row]
        })

        const pageCollector = this.pageMessage.createMessageComponentCollector({
            max: 1
        })

        pageCollector.on('collect', (btnInt: ButtonInteraction) => {
            switch (btnInt.customId) {
                case 'next_page':
                    this.currentPage++
                    this.clear(this.messageIndexes)
                    
                    if(this.currentPage < this.numPages) {

                        for(let i = 0; i < this.pageSize; i++) {

                            this.messageIndexes.push(((this.currentPage - 1) * this.pageSize) + i)
                        }

                    } else if (this.currentPage == this.numPages) {
                    
                        let numRemaining = this.items.length - ((this.currentPage - 1) * this.pageSize)

                        for(let i = 0; i < numRemaining; i++) {
                            this.messageIndexes.push(((this.currentPage - 1) * this.pageSize) + i)
                        }

                    }

                    this.show()
                    break;

                case 'prev_page':

                    this.currentPage--
                    this.clear(this.messageIndexes)
                    
                    for(let i = 0; i < this.pageSize; i++) {
                        this.messageIndexes.push(((this.currentPage - 1) * this.pageSize) + i)
                    }
                    this.show()
                    break;
            }

            setTimeout(() => {this.pageController()}, 2000)
        })
    }

    makeMessageRow(): MessageActionRow {
        let prevPageButton;
            if(this.currentPage > 1) {
                prevPageButton = new MessageButton()
                    .setLabel('Previous Page.')
                    .setCustomId('prev_page')
                    .setStyle('PRIMARY')
            } else {
                prevPageButton = new MessageButton()
                    .setLabel('Previous Page.')
                    .setCustomId('prev_page')
                    .setStyle('PRIMARY')
                    .setDisabled(true)
            }

        let nextPageButton 
            if(this.currentPage < this.numPages) {
                nextPageButton = new MessageButton()
                    .setLabel('Next Page.')
                    .setCustomId('next_page')
                    .setStyle('PRIMARY')
            } else {
                nextPageButton = new MessageButton()
                    .setLabel('Next Page.')
                    .setCustomId('next_page')
                    .setStyle('PRIMARY')
                    .setDisabled(true)
            }

        return new MessageActionRow()
            .addComponents(
                prevPageButton,
                nextPageButton
            )
    }
}