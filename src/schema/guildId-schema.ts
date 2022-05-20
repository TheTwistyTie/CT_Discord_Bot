import mongoose, { Mongoose } from "mongoose";

const schema = new mongoose.Schema({
    guildId: {
        type: String || undefined,
        required: true
    },
    guildName: {
        type: String || undefined,
        required: true
    },
    heRoleId: {
        type: String || undefined,
        required: true
    },
    sheRoleId: {
        type: String || undefined,
        required: true
    },
    theyRoleId: {
        type: String || undefined,
        required: true
    },
    otherRoleId: {
        type: String || undefined,
        required: true
    },
})

export default mongoose.model('guildId', schema)