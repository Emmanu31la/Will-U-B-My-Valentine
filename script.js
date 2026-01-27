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
let selectedGender = ""; // The variable is named "selectedGender"
let noCount = 0;
const maxStages = 8;

// -----SOUND FUNCTION-----
function playClickSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const now = audioContext.currentTime;
        
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
    } catch (e) {
        console.log("Audio context not available");
    }
}

// -----SCREEN NAVIGATION----

// Go from Name Input -> Gender Selection
function goToScreen2() {
    playClickSound();
    const nameInput = document.getElementById("name-input");
    userName = nameInput.value.trim() || "Cutie"; 

    document.getElementById("display-name").innerText = userName;

    document.getElementById("screen-1").classList.add("hidden");
    document.getElementById("screen-2").classList.remove("hidden");
}

// Go from Gender Selection -> Question Screen
// FIX 1: Renamed function to 'selectGender' to match your HTML
function selectGender(gender) {
    playClickSound();
    
    // FIX 2: Assign to the variable 'selectedGender', NOT 'selectGender'
    selectedGender = gender;

    updateGameUI();

    document.getElementById("screen-2").classList.add("hidden");
    document.getElementById("screen-3").classList.remove("hidden");
}

// -----GAME LOGIC-----
function handleNo() {
    playClickSound();
    if (noCount < maxStages) {
        noCount++;
    }
    updateGameUI();
}

function handleYes() {
    playClickSound();

    const imgElement = document.getElementById("character-img");
    const textElement = document.getElementById("main-text");
    const yesBtn = document.getElementById("yes-btn");
    const noBtn = document.getElementById("no-btn");

    yesBtn.classList.add("hidden");
    noBtn.classList.add("hidden");

    // FIX 3: Used correct variable name 'selectedGender'
    imgElement.src = `images/${selectedGender}_yes.png`;

    textElement.innerText = `YAYYY!!! Thank you so much, ${userName}! 💖`;
}

function resetGame() {
    playClickSound();
    noCount = 0;
    userName = "";
    selectedGender = "";

    document.getElementById("name-input").value = "";
    document.getElementById("yes-btn").style.transform = "scale(1)";

    document.getElementById("yes-btn").classList.remove("hidden");
    document.getElementById("no-btn").classList.remove("hidden");
    document.getElementById("reset-btn").classList.add("hidden");

    document.getElementById("screen-3").classList.add("hidden");
    document.getElementById("screen-1").classList.remove("hidden");
}

function updateGameUI() {
    const imgElement = document.getElementById("character-img");
    const textElement = document.getElementById("main-text");
    const yesBtn = document.getElementById("yes-btn");
    const noBtn = document.getElementById("no-btn");
    const resetBtn = document.getElementById("reset-btn");

    imgElement.src = `images/${selectedGender}_${noCount}.png`;
    textElement.innerText = messages[noCount];

    if (noCount === maxStages) {
        yesBtn.classList.add('hidden');
        noBtn.classList.add('hidden');
        resetBtn.classList.remove('hidden');
    } else {
        const currentScale = 1 + (noCount * 0.4);
        yesBtn.style.transform = `scale(${currentScale})`;
    }
}
// FIX 4: Removed the extra "}" that was here causing the crash