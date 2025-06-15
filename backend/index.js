require('dotenv').config();
const mongoose = require('mongoose');
const Reward = require('./models/Reward');
const express = require('express');
const fs = require('node:fs');
const app = express();
app.use(express.json());
app.listen(3000, () => console.log('Server launched on port 3000'));
app.use('/fontawesome', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free'));
app.set('view engine', 'ejs');
app.use(express.static('public'));

function generateReward(rewards) {
    const availableRewards = rewards.filter(reward => reward.quantity > 0);
    const totalWeight = availableRewards.reduce((sum, reward) => sum + reward.weight, 0);
    const limit = Math.random() * totalWeight;

    let cumulative = 0;
    for (let reward of availableRewards) {
        cumulative += reward.weight;
        if (limit <= cumulative) return reward;
    }
    return null;
}

function generateSpinResult(resultReward, symbols) {
    if (resultReward.combination !== 'perdu') {
        return Array(3).fill(resultReward.combination);
    }

    let combination;
    let isWinning;
    do {
        combination = [
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
        ];
        isWinning = combination.every(symbol => symbol === combination[0]);
    } while (isWinning);

    return combination;
}

// Without middleware
app.get('/', function (req, res) {
    res.render('index');
});


app.post('/spin', async (req, res) => {

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas');

    const rewards = await Reward.find({});
    console.log('Rewards in DB : ', rewards);
    const symbols = ['biere', 'cafe', 'volant', 'crepe', 'buvette'];

    const reward = generateReward(rewards);
    console.log('generateReward(rewards) : ', reward);
    const combination = generateSpinResult(reward, symbols);
    console.log('generateSpinResult(reward, symbols) : ', combination);

    logResult(reward);

    if (reward) {
        reward.quantity -= 1;
        await reward.save();
    }

    res.json({
        combination: combination,
        prize: reward ? reward.combination : "perdu"
    });
});

function logResult(reward) {
    const now = new Date();
    const time = now.toLocaleTimeString("fr-FR");
    const content = `${time} ; récompense : ${reward.reward}\n`;
    fs.appendFile('./public/logs/tirages.txt', content, err => {
        if (err) {
            console.error(err);
        }
    });
}