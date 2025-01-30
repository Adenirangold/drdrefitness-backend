const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const MembershipPlanSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },

    price: {
        type: Number,
        required: true,
        min: 0,
    },

    duration: {
        type: Number, // in days
        required: true,
        min: 0,
    },
});

const MembershipPlan = mongoose.model("MembershipPlan", MembershipPlanSchema);
module.exports= MembershipPlan;
