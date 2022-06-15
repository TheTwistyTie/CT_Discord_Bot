import mongoose, { Mongoose } from "mongoose";

const schema = new mongoose.Schema({
    id: String,
    name: String,
    reports:{
        userReports: [],
        autoModeration: [],
    },
    savedResources: [],
    savedOrganizations: [],
    savedRestaurants: []
})

export default mongoose.model('user', schema)