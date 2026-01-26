const { use } = require("react");

const messages = [
    "Will you be my valentine?",    // Stage 0
    "Will you 'PLEASEEE' be my valentine?",  // Stage 1
    "Will you pretty PLEAASSE be my valentine?",    // Stage 2
    "Will you extra preety please with cherries on top be my Valentine??",  // Stage 3
    "I got you your favorite chocolates! Will you be my valentine now!?",  // Stage 4
    "Think about the flowers! Pleasssseeeee???", // Stage 5
    "You're killing me here... Please be my Valentime..?",  // Stage 6
    "I'll DIE if you don't say yes! Please say YES!",  // Stage 7
    "Dies of heartbreak"    // Stage 8
];

// -----STATE VARIABLES-----
let userName = "";
let selectGender = "";
let noCount = 0;
const maxStages = 8;

// -----SOUND FUCNTION-----
function playClickSound() {
    const audio = document.getElementById("click-sound");
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e =>console.log("Audio blocked untill user interaction"));
    }
}

// -----SCREEN NAVICATION----

// Go from Name Input -> Gender Selection
function goToScreen2() {
    playClickSound();
    const nameInput = document.getElementById("name-input");
    userName = nameInput.value.trim() || "Cutie"; // Default name if none provided

    document.getElementById("display-name").innerText = userName;

    // Hide Screen 1 and Show Screen 2
    document.getElementById("screen-1").classList.add("hidden");
    document.getElementById("screen-2").classList.remove("hidden");
}

// Go from Gender Selection -> Question Screen
function selectGender(gender) {
    playClickSound();
    selectGender = gender;

    // Select initial image (Stage 0)
    updateGameUI();

    // Hide Screen 2 and Show Screen 3
    document.getElementById("screen-2").classList.add("hidden");
    document.getElementById("screen-3").classList.remove("hidden");
}

// -----GAME LOGIC-----
function handleNo() {
    playClickSound();
    if (noCount < maxStages) {
    noCount++;
    }
    // Update Image, Text and utton size
    updateGameUI();
}

function handleYes() {
    playClickSound();

    // Change to Yes State
    const imageElement = document.getElementById("character-img");
    const textElement = document.getElementById("main-text");
   // const buttonContainer = document.querySelector(".button-container");

   document.getElementById("yes-btn").classList.add("hidden");
   document.getElementById("no-btn").classList.add("hidden");

    // Update Image and Text
    imgElement.src = `images/${selectedGender}_yes.png`;

    textElement.innerText = `YAYYY!!! Thank you so much, ${userName}! 💖`;

    // Hide No Buttons aince they said Yes
    //btnContainer.style.display = "none";

    // Optional: Add Confetti Effect here if I add a library later
}

function resetGame() {
    playClickSound();
    noCount = 0;
    userName = "";
    selectGender = "";

    document.getElementById("name-input").value = "";
    document.getElementById("yes-btn").style.transform = "scale(1)";

    document.getElementById("yes-btn").classList.remove("hidden");
    document.getElementById("no-btn").classList.remove("hidden");
    document.getElementById("reset-btn").classList.add("hidden");

    document.getElementById("screen-3").classList.add("hidden");
    document.getElementById("screen-1").classList.remove("hidden");
}

function updateGameUI() {
    // format: images/male_0.png, female_3.png, etc.
    const imgElement = document.getElementById("character-img");
    imgElement.src = `images/${selectGender}_${noCount}.png`;

    if (noCount === maxStages) {
        // Hide Yes/No, Show Reset
        yesBtn.classList.add('hidden');
        noBtn.classList.add('hidden');
        resetBtn.classList.remove('hidden');
    } else {
        // Grow the Yes Button normally
        const currentScale = 1 + (noCount * 0.4);
        yesBtn.style.transform = `scale(${currentScale})`;
    }
    // Update header Text
    const textElement = document.getElementById("main-text");
    textElement.innerText = messages[noCount];

    // make yes button bigger
    const yesBtn = document.getElementById("yes-btn");

    // Formula: Base size (1) + (Number of clicks * 0.4)
    // It will grow 40% bigger each time
    const currentScale = 1 + (noCount * 0.4);

    yesBtn.style.transform = `scale(${currentScale})`;
}