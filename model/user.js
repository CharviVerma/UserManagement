const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
    {
        fullname: { type: String, required: true,},
        email: { type: String, required: true, unique: true},
        password: { type: String, required: true},
        country: { type: String, required: true },
        
    },
    { collection: "users" }
)

const model = mongoose.model("UserSchema", UserSchema)
module.exports = model