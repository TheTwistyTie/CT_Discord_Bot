import mongoose from "mongoose";

const schema = new mongoose.Schema({
    guildId: {
        type: String || undefined,
        required: true
    },
    types: [{
        name: String,
        number: Number
    }]
})

export default mongoose.model('resouceType', schema)