// data : Object { combination: (3) […], prize: "100" }
// combination: Array(3) [ "bar", "bar", "bar" ]
// prize: "100"
const spinButton = document.getElementById("spin");
const result = document.getElementById('result');
toggleVisibility(result);
spinButton.after(result);
spinButton.addEventListener('click', spin);
let isSpinning = false;
const symbols = [
    { name: 'biere', offset: 0 },
    { name: 'cafe', offset: 150 },
    { name: 'volant', offset: 300 },
    { name: 'crepe', offset: 450 },
    { name: 'buvette', offset: 600 }
];
let spinningIntervals = [];

async function fetchResult() {
    try {
        const response = await fetch('http://localhost:3000/spin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        const data = await response.json();
        console.log('Résultat du spin :', data);
        toggleVisibility(result);
        result.innerText = `Tu as gagné ${data.prize}`;
        return data;
    } catch (err) {
        console.error('Erreur lors de la requête POST :', err);
    }
}

function toggleVisibility(element) {
    element.classList.toggle('hidden');
}

function spin() {
    if (isSpinning) return;

    isSpinning = true;
    spinButton.disabled = true;
    spinningIntervals = [];

    for (let i = 1; i <= 3; i++) {
        const slot = document.getElementById(`slot${i}`);
        resetSlot(slot);
        const interval = spinSlot(slot);
        spinningIntervals.push(interval);
    }

    setTimeout(async () => {
        const backendResult = await fetchResult();
        const resultCombination = (backendResult.combination);
        console.log('Result combination : ', resultCombination);

        stopSlots(resultCombination);
    }, 1000 + Math.random() * 1000); // Délai aléatoire pour plus de réalisme
}

function spinSlot(slot) {
    const strip = slot.querySelector('.slot-images');

    let index = 0;
    const interval = setInterval(() => {
        strip.style.transform = `translateX(-50%) translateY(-${index * 150}px)`;
        strip.style.transition = 'transform 0.1s linear';
        index = (index + 1) % symbols.length;
    }, 100);

    return interval;
}

function stopSlots(finalSymbols) {
    const slots = [
        document.getElementById('slot1'),
        document.getElementById('slot2'),
        document.getElementById('slot3')
    ];

    finalSymbols.forEach((symbol, index) => {
        setTimeout(() => {
            stopSlot(slots[index], symbol, index === finalSymbols.length - 1, index);
        }, index * 500);
    });

    setTimeout(() => {
        isSpinning = false;

        spinButton.disabled = false;
    }, finalSymbols.length * 500 + 500);
}

function stopSlot(slot, targetSymbol, isLast, slotIndex) {
    clearInterval(spinningIntervals[slotIndex]);

    const strip = slot.querySelector('.slot-images');
    const symbolObject = symbols.find(s => s.name === targetSymbol);
    console.log("targetSymbol : ", targetSymbol)
    console.log("symbolObject : ", symbolObject)

    if (!symbolObject) {
        console.error(`Symbole non trouvé : ${targetSymbol}`);
        return;
    }

    setTimeout(() => {
        strip.style.transition = 'transform 0.3s ease-out';
        strip.style.transform = `translateX(-50%) translateY(-${symbolObject.offset}px)`;

        if (isLast) {
            isSpinning = false;
            spinButton.disabled = false;
        }
    }, 200);
}

function resetSlot(slot) {
    const strip = slot.querySelector('.slot-images');
    strip.style.transition = 'none';
    strip.style.transform = 'translateX(-50%) translateY(0)';
}

// Fonction que tu peux appeler depuis ton backend
function setResults(backendResults) {
    // Cette fonction peut être appelée avec les résultats de ton backend
    // backendResults devrait être un array de 3 symboles
    stopSlots(backendResults);
}
