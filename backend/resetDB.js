// Execute with : node resetDB.js
// Before running index.js ; erase and replace all data
require('dotenv').config();
const mongoose = require('mongoose');
const Reward = require('./models/Reward');
const path = require("path");
const fs = require("node:fs");

async function resetData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB Atlas');

        await Reward.deleteMany();

        const rewardsArray = [
            {combination: "biere", reward: "Des sous-bocks", quantity: 40, weight: 16},
            {combination: "cafe", reward: "Un café/un thé", quantity: 500, weight: 24},
            {combination: "volant", reward: "Deux volants pour ton match !", quantity: 6, weight: 2.5},
            {combination: "crepe", reward: "Une crêpe", quantity: 500, weight: 24},
            {combination: "buvette", reward: "Une carte buvette de 10€", quantity: 1, weight: 0.5},
            {combination: "perdu", reward: "Perdu", quantity: 10000, weight: 33}
        ];

        for (let reward of rewardsArray) {
            const newReward = new Reward(reward);
            await newReward.save();
        }

        console.log("DB reset succesfully")

    } catch (err) {
        console.error('MongoDB error :', err);
    } finally {
        await mongoose.connection.close();
    }
}

resetData();

const logPath = path.join(__dirname, 'public', 'logs', 'tirages.txt');
fs.writeFile(logPath, '', err => {
    if (err) {
        console.error('Erreur lors de la réinitialisation du fichier de log :', err);
    } else {
        console.log('Fichier de log réinitialisé au démarrage.');
    }
});