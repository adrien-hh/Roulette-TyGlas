const mongoose = require('mongoose');

const rewardsSchema = new mongoose.Schema({
    combination: String,
    reward: String,
    quantity: Number,
    weight: Number
});

module.exports = mongoose.model('Reward', rewardsSchema);
