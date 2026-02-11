require('dotenv').config();
const mongoose = require('mongoose');
const Reward = require('./models/Reward');
const express = require('express');
const fs = require('node:fs');
const app = express();
const path = require('path');

app.use(express.json());
app.listen(process.env.PORT || 3000, () => console.log('Server launched on port 3000'));
app.use('/fontawesome', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free'));
app.set('view engine', 'ejs');
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error(err));

const logPath = path.join(__dirname, 'public', 'logs', 'tirages.txt');

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

app.get('/', function (req, res) {
    res.render('index');
});

app.post('/spin', async (req, res) => {

    const rewards = await Reward.find({ quantity: { $gt: 0 } });
    const symbols = ['biere', 'cafe', 'volant', 'crepe', 'buvette'];
    const reward = await selectRewardAndDecrement(rewards);
    const combination = generateSpinResult(reward, symbols);
    logResult(reward);

    res.json({
        combination: combination,
        prize: reward ? reward?.combination : "perdu"
    });
});

app.post('/fakeSpin', async (req, res) => {

    const rewards = await Reward.find({ quantity: { $gt: 0 } });
    const symbols = ['biere', 'cafe', 'volant', 'crepe', 'buvette'];
    const reward = await selectReward(rewards);
    const combination = generateSpinResult(reward, symbols);

    res.json({
        combination: combination,
        prize: reward ? reward?.combination : "perdu"
    });
});

function logResult(reward) {
    const now = new Date();
    const time = now.toLocaleString("fr-FR");
    const content = `${time} ; récompense : ${reward.reward}\n`;
    fs.appendFile(logPath, content, err => {
        if (err) {
            console.error(err);
        }
    });
}

async function selectRewardAndDecrement(rewards) {

    while (rewards.length > 0) {
        const reward = generateReward(rewards);
        if (!reward) return null;

        const updatedReward = await Reward.findOneAndUpdate(
            { _id: reward._id, quantity: { $gt: 0 } },
            { $inc: { quantity: -1 } },
            { new: true }
        );

        if (updatedReward) {
            return updatedReward;
        } else {
            rewards = rewards.filter(r => !r._id.equals(reward._id));
        }
    }
    return null;
}

async function selectReward(rewards) {

    while (rewards.length > 0) {
        const reward = generateReward(rewards);
        if (!reward) return null;

        const rewardInDB = await Reward.findOne(
            { _id: reward._id, quantity: { $gt: 0 } }
        );

        if (rewardInDB) {
            return rewardInDB;
        } else {
            rewards = rewards.filter(r => !r._id.equals(reward._id));
        }
    }
    return null;
}