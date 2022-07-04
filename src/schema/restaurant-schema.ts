import mongoose, { Mongoose } from "mongoose";

const schema = new mongoose.Schema({
    guildId: {
        type: String || undefined,
        required: true
    },
    name: {
        type: String || undefined,
        required: true
    },
    description: {
        type: String || undefined,
        required: true
    },
    url: {
        type: String || undefined,
        required: false
    },
    thumbnail: {
        type: String || undefined,
        required: false
    },
    image: {
        type: String || undefined,
        required: false
    },
    type: {
        type: [],
        required: true
    },
    region: {
        type: [],
        required: true
    },
    ratings: [
        {
            userId: String,
            rating: Number,
        }
    ],
    openHours: String,
    phoneNumber: String,
    address: String,
    email: String,
})

export default mongoose.model('restaurant', schema)