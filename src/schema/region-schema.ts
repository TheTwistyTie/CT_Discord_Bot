import mongoose from "mongoose";

const schema = new mongoose.Schema({
    guildId: {
        type: String || undefined,
        required: true
    },
    regions: [{
        name: String,
        roleId: String,
        resourceNumber: Number,
        restaurantNumber: Number
    }]
})

export default mongoose.model('regions', schema)