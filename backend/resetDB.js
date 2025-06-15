// Execute with : node resetDB.js
// Before running index.js ; erase and replace all data
require('dotenv').config();
const mongoose = require('mongoose');
const Reward = require('./models/Reward');

async function resetData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB Atlas');

        await Reward.deleteMany();

        const rewardsArray = [
            {combination: "biere", reward: "Des sous-bocks", quantity: 100, weight: 30},
            {combination: "cafe", reward: "Un café/un thé", quantity: 500, weight: 15},
            {combination: "volant", reward: "Deux volants pour ton match !", quantity: 6, weight: 6},
            {combination: "crepe", reward: "Une crêpe", quantity: 500, weight: 15},
            {combination: "buvette", reward: "Une carte buvette de 10€", quantity: 1, weight: 1},
            {combination: "perdu", reward: "Perdu", quantity: 10000, weight: 33}
        ];

        for (let reward of rewardsArray) {
            const newReward = new Reward(reward);
            await newReward.save();
        }

    } catch (err) {
        console.error('MongoDB error :', err);
    } finally {
        await mongoose.connection.close();
    }
}

resetData();