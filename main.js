// Variables
var targetColor = [0,0,0]; // RGB
var guessColor = [0,0,0]; // RGB
var maxScore = 0;
var guessCount = 0;
var maxGuesses = 3;
var hintLevel = 1; // 0 = off, 1 = simple, 2 = detailed

// Element references
// Groups
const sliderElements = document.getElementsByClassName("color-slider");
var guessBoxes = document.getElementsByClassName("guess-display");
var guessHintButtons = document.getElementsByClassName("hint-button");

// Singles 
const newRoundButton = document.getElementById("new-round-button");
const guessButton = document.getElementById("guess-button");
const infoButton = document.getElementById("info-button");
const infoPopup = document.getElementById("info-popup");
const settingsPopup = document.getElementById("settings-popup");
const settingsButton = document.getElementById("settings-button");
const scoringPopup = document.getElementById("scoring-popup");
const scoringButton = document.getElementById("scoring-button");
const hintPopup = document.getElementById("hint-popup");

const targetDisplay = document.getElementById("target");
const guessDisplay = document.getElementById("guess-display");

const maxGuessesSlider = document.getElementById("max-guesses-slider");
const maxGuessesLabel = document.getElementById("max-guesses-label");

// Sentence fragments
const comparatives = ["the tiniest bit", "a little bit","a bit", "a fair bit", "way", "WAY"];
const directions = ["more", "less"];

// Resets game with a new colour
function newRound() {
    targetColor = [Math.floor(Math.random()*256), Math.floor(Math.random()*256), Math.floor(Math.random()*256)];
    targetDisplay.style.backgroundColor = `rgb(${targetColor[0]}, ${targetColor[1]}, ${targetColor[2]})`;
    maxScore = 0;
    guessCount = 0;

    // Reset sliders to middle position
    for (let slider of sliderElements) {
        slider.value = 127;
        updateSliderLabel(slider);
    }

    getSettings();
    buildGuessBoxes();

    // Clear guess boxes and hints
    for (let i = 0; i < maxGuesses; i++) {
        var guessBackground = 255-((i+1)*(120/guessBoxes.length));
        guessBoxes[i].style.backgroundColor = `rgb(${guessBackground}, ${guessBackground}, ${guessBackground})`;
        guessBoxes[i].innerText = "?";
        guessHintButtons[i].style.display = "none";
    }
}

// Takes maxGuesses and creates a corresponding number of guess boxes
function buildGuessBoxes() {
    const guessContainer = document.getElementById("guess-row");
    guessContainer.innerHTML = "";
    for (let i = 0; i < maxGuesses; i++) {
        const guessBox = document.createElement("div");
        guessBox.className = "guess-div";
        const guessDisplay = document.createElement("div");
        guessDisplay.classList.add("guess-display","color-box");
        guessDisplay.innerText = "?";
        guessDisplay.style.backgroundColor = `rgb(${255-((i+1)*(120/maxGuesses))}, ${255-((i+1)*(120/maxGuesses))}, ${255-((i+1)*(120/maxGuesses))})`;
        guessDisplay.setAttribute("data-red", "0");
        guessDisplay.setAttribute("data-green", "0");
        guessDisplay.setAttribute("data-blue", "0");
        
        const hintBox = document.createElement("div");
        hintBox.className = "guess-hint";

        const hintButton = document.createElement("button");
        hintButton.className = "hint-button";
        hintButton.innerText = "Hint";
        hintButton.style.display = "none";
        hintBox.appendChild(hintButton);

        guessBox.appendChild(guessDisplay);
        guessBox.appendChild(hintBox);
        guessContainer.appendChild(guessBox);
    }
    // Update references
    guessBoxes = document.getElementsByClassName("guess-display");
    guessHintButtons = document.getElementsByClassName("hint-button");

    // Add event listeners to new hint buttons
    for (let i = 0; i < guessHintButtons.length; i++) {
        guessHintButtons[i].addEventListener("click", function() {
            hintPopup.innerHTML = generateHint(i);
            showPopup(hintPopup);
        });
    }
}

// Calculates score out of 765 (shifted down to 500 before being displayed) based on guess and target RGB arrays

function calculateScore(guess, target) {
    let diff = Math.abs(guess[0]-target[0]) + Math.abs(guess[1]-target[1]) + Math.abs(guess[2]-target[2]);
    let score = Math.max(0, 765 - diff);
    return score;
}

// Returns percentage as string with 1 decimal place
function getAccuracyPercent(score) {
    let accuracy = 100 * score / 765;
    return `${(Math.round(accuracy * 10) / 10).toString()}%`
}

// Takes the guess number (0-indexed) and generates a hint for that guess based on the data in the corresponding guess box
function generateHint(guess) {
    let guessBox = guessBoxes[guess];
    let guessRGB = [parseInt(guessBox.getAttribute("data-red")), parseInt(guessBox.getAttribute("data-green")), parseInt(guessBox.getAttribute("data-blue"))];
    let offsets = [targetColor[0]-guessRGB[0], targetColor[1]-guessRGB[1], targetColor[2]-guessRGB[2]];

    // Initialise hint text
    let hint = [`Your guess was ${guessRGB[0]} red, ${guessRGB[1]} green, and ${guessRGB[2]} blue.<br><br>
    This was ${getAccuracyPercent(calculateScore(guessRGB, targetColor))} accurate.<br><br>`];

    // Generate hints for each colour channel
    for (let i = 0; i < 3; i++) {
        if (offsets[i] == 0) {
            hint.push(`You got the ${["red","green","blue"][i]} value exactly right!<br>`);
        } else {
            let direction = offsets[i] > 0 ? "more" : "less";
            let amountIndex = Math.min(Math.floor(Math.abs(offsets[i]) / 43), comparatives.length - 1);
            if (hintLevel == 1) {
                hint.push(`You need ${direction} ${["red","green","blue"][i]}.<br>`);
            }
            else if (hintLevel == 2) {
                hint.push(`You need ${comparatives[amountIndex]} ${direction} ${["red","green","blue"][i]}.<br>`);
            }
        }
    }
    return hint.join("");
}

function newTurn() {
    guess();
    if (guessCount >= maxGuesses) {
        setScoringText();
        showPopup(scoringPopup);
    } else {
        // alert(`You have ${maxGuesses - guessCount} guesses remaining this round.`);
    }
}


function guess() {
    guessColor = [parseInt(document.getElementById("red-slider").value), parseInt(document.getElementById("green-slider").value), parseInt(document.getElementById("blue-slider").value)];

    // Get the relevant guess box and hint
    let guessBox = guessBoxes[guessCount];
    let guessHint = guessHintButtons[guessCount];
    
    // Recolour the guess box
    guessBox.style.backgroundColor = `rgb(${guessColor[0]}, ${guessColor[1]}, ${guessColor[2]})`;

    // Store guess colour in data attributes
    guessBox.setAttribute("data-red", guessColor[0]);
    guessBox.setAttribute("data-green", guessColor[1]);
    guessBox.setAttribute("data-blue", guessColor[2]);

    // Change text colour for contrast if necessary
    if ((guessColor[0]*0.299 + guessColor[1]*0.587 + guessColor[2]*0.114) < 186) {
        guessBox.style.color = "white";
    } else {
        guessBox.style.color = "black";
    }
    
    // Show hint button if settings allow
    if (hintLevel > 0) {
        guessHint.style.display = "inline-block";
    }
    
    // Add percentage score
    guessBox.innerText = getAccuracyPercent(calculateScore(guessColor, targetColor));

    maxScore = Math.max(maxScore, calculateScore(guessColor, targetColor));

    guessCount += 1;

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

function adjustSlider(sliderId, delta) {
    const slider = document.getElementById(sliderId);
    const step = parseInt(slider.step) || 1;
    const min = parseInt(slider.min);
    const max = parseInt(slider.max);

    let newValue = parseInt(slider.value) + delta * step;
    newValue = Math.max(min, Math.min(max, newValue));
    slider.value = newValue;

    // Trigger input event to update label
    slider.dispatchEvent(new Event('input'));
}

// Popup control logic - takes a popup div (not just id)
function showPopup(popup) {
    // Add a close button dynamically (deletes it if it already exists - a hacky way to change the text contents)
    if (popup.querySelector("#close-button") && popup.id != "scoring-popup") {
        popup.querySelector("#close-button").remove();
    }
    if (!popup.querySelector("#close-button") && popup.id != "scoring-popup") {
        const closeButton = document.createElement("button");
        closeButton.id = "close-button";
        closeButton.innerHTML = randomlyChoose(["Neato","Got it","OK","Thanks!","Cool beans","Yeah yeah","If you say so","Sweet","Righto","Cheers","Aye aye","Roger that","Understood", "Whatever"]);
        closeButton.addEventListener("click", function() {
            hidePopup(popup);
        });
        popup.appendChild(closeButton);
    }
    popup.style.display = "block";
}

function randomlyChoose(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function hidePopup(popup) {
    popup.style.display = "none";
}

function togglePopup(popup) {
    const currentDisplay = window.getComputedStyle(popup).display;    
    if (currentDisplay == "none") {
        showPopup(popup);
    }
    else {
        hidePopup(popup);
    }
}

// Popup text content
function setScoringText() {
    scoringPopup.innerHTML = `Congratulations! Your final score was ${Math.max(0,(maxScore-265))}/500 points.<br><br>
    Your most accurate guess was ${getAccuracyPercent(maxScore)} accurate.<br><br>
    The target color was ${targetColor[0]} red, ${targetColor[1]} green, and ${targetColor[2]} blue.<br><br>
    New game?<br>
    <button class="close-button" onclick="hidePopup(scoringPopup); newRound();">Yeah!</button>
    <button class="close-button" onclick="hidePopup(scoringPopup)">Nah</button>`;
}


// Event listeners

// Info button functionality
infoButton.addEventListener("click", function() {
    togglePopup(infoPopup);
});

// Settings button functionality
settingsButton.addEventListener("click", function() {
    togglePopup(settingsPopup);
});

// New round button functionality
newRoundButton.addEventListener("click", function() {
    newRound();
});

// The "guess" button functionality
guessButton.addEventListener("click", function() {
    newTurn();
});

// Slider increment/decrement button functionality
document.querySelectorAll('.increment').forEach(button => {
    button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-target');
        adjustSlider(targetId, +1);
    });
});

document.querySelectorAll('.decrement').forEach(button => {
    button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-target');
        adjustSlider(targetId, -1);
    });
});

// Hint button functionality
for (let i = 0; i < guessHintButtons.length; i++) {
    guessHintButtons[i].addEventListener("click", function() {
        hintPopup.innerHTML = generateHint(i);
        showPopup(hintPopup);
    });
}

// Change max guesses label when slider is moved
maxGuessesSlider.addEventListener("input", function() {
    maxGuessesLabel.textContent = maxGuessesSlider.value;
});

// Get settings (called on newRound())
function getSettings() {
    if (document.getElementById("hints-off").checked) {
        hintLevel = 0;
    } else if (document.getElementById("hints-simple").checked) {
        hintLevel = 1;
    } else if (document.getElementById("hints-detailed").checked) {
        hintLevel = 2;
    }
    maxGuesses = parseInt(maxGuessesSlider.value);
    maxGuessesLabel.textContent = maxGuessesSlider.value;
}

// Called on page load
addEventListener("load", function() {
    getSettings();
    newRound();
});