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
    moderator: {
        type: String || undefined,
        required: true
    },
    resourceAdder: {
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
    gameNight: {
        roleId: String || undefined,
        use: Boolean
    },
    meetUps: {
        roleId: String || undefined,
        use: Boolean
    },
    events: {
        roleId: String || undefined,
        use: Boolean
    },
    resources: {
        resources: Boolean,
        organizations: Boolean,
        restaurants: Boolean,
    }
})

export default mongoose.model('guildId', schema)