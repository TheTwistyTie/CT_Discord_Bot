import  mongoose  from "mongoose";

const schema = new mongoose.Schema({
    guildId: {
        type: String || undefined,
        required: true
    },
    optionalRoles: [{
        role: {
            roleId: {
                type: String,
                required: true
            },
            roleName: {
                type: String,
                required: true
            },
            use: {
                type: Boolean,
                required: true
            },
        }
    }]
})

export default mongoose.model('config', schema)