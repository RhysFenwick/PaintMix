// Variables
var targetColor = [0,0,0]; // RGB
var guessColor = [0,0,0]; // RGB
var totalScore = 0;
var guessCount = 0;
var maxGuesses = 3;

// Element references
// Groups
const sliderElements = document.getElementsByClassName("color-slider");
const guessBoxes = document.getElementsByClassName("guess-display");
const guessHints = document.getElementsByClassName("guess-hint");

// Singles 
const newRoundButton = document.getElementById("new-round-button");
const guessButton = document.getElementById("guess-button");
const targetDisplay = document.getElementById("target");
const guessDisplay = document.getElementById("guess-display");

// Sentence fragments
const comparatives = ["the tiniest bit", "a little bit","a bit", "a fair bit", "way", "WAY"];
const directions = ["more", "less"];

// Resets game with a new colour
function newRound() {
    targetColor = [Math.floor(Math.random()*256), Math.floor(Math.random()*256), Math.floor(Math.random()*256)];
    targetDisplay.style.backgroundColor = `rgb(${targetColor[0]}, ${targetColor[1]}, ${targetColor[2]})`;
    totalScore = 0;
    guessCount = 0;

    // Reset sliders to middle position
    for (let slider of sliderElements) {
        slider.value = 127;
        updateSliderLabel(slider);
    }

    // Clear guess boxes and hints
    for (let i = 0; i < maxGuesses; i++) {
        guessBoxes[i].style.backgroundColor = "lightgrey";
        guessHints[i].innerHTML = "";
    }
}

function calculateScore(guess, target) {
    let diff = Math.abs(guess[0]-target[0]) + Math.abs(guess[1]-target[1]) + Math.abs(guess[2]-target[2]);
    let score = Math.max(0, 765 - diff);
    return score;
}

// Takes an array of colour offsets for R, G and B from -255 to 255 and generates feedback
function generateFeedback(offsets) {
    let feedback = ["<p>Compared to the target colour, you had:"];
    for (let i = 0; i < 3; i++) {
        if (offsets[i] === 0) continue;
        let absOffset = Math.abs(offsets[i]);
        let magnitudeIndex = Math.min(5, Math.floor((absOffset-1)/51)); // 0-50: 0, 51-102: 1, 103-153: 2, 154-204: 3, 205-255: 4
        feedback.push(`${comparatives[magnitudeIndex]} ${directions[offsets[i] > 0 ? 0 : 1]} ${["red", "green", "blue"][i]}`);
    }
    feedback.push(".</p>");
    return feedback.join(" ");
}

newRoundButton.addEventListener("click", function() {
    newRound();
});

// The "guess" button functionality
guessButton.addEventListener("click", function() {
    newTurn();
});

function newTurn() {
    guessCount += 1;
    console.log(guessCount);
    guess();
    if (guessCount >= maxGuesses) {
        let score = calculateScore(guessColor, targetColor);
        totalScore += score;
        alert(`Game over! Your final score is ${totalScore} points.`);
    } else {
        // alert(`You have ${maxGuesses - guessCount} guesses remaining this round.`);
    }
}


function guess() {
    guessColor = [parseInt(document.getElementById("red-slider").value), parseInt(document.getElementById("green-slider").value), parseInt(document.getElementById("blue-slider").value)];
    let offsets = [guessColor[0]-targetColor[0], guessColor[1]-targetColor[1], guessColor[2]-targetColor[2]];
    let feedback = generateFeedback(offsets);

    // Get the relevant guess box and hint
    let guessBox = guessBoxes[guessCount - 1];
    let guessHint = guessHints[guessCount - 1];
    guessBox.style.backgroundColor = `rgb(${guessColor[0]}, ${guessColor[1]}, ${guessColor[2]})`;
    guessHint.innerHTML = feedback;
}

function updateSliderLabel(slider) {
    const label = document.querySelector(`label[for="${slider.id}"]`);
    label.textContent = `${slider.name.charAt(0).toUpperCase() + slider.name.slice(1)}: ${slider.value}`;
} 

for (let slider of sliderElements) {
    slider.addEventListener("input", function() {
        updateSliderLabel(slider);
    });
};

// Called on page load
addEventListener("load", function() {
    newRound();
});
