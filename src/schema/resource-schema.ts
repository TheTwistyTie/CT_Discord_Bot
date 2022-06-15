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
    ratings: [
        {
            userId: String,
            rating: Number,
        }
    ]
})

export default mongoose.model('resource', schema)