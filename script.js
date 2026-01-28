// ----- CONFIGURATION -----
const NTFY_BASE_URL = "https://ntfy.sh";

const messages = [
    "Will you be my valentine?",    
    "Will you 'PLEASEEE' be my valentine?",  
    "Will you pretty PLEAASSE be my valentine?",    
    "Will you extra preety please with cherries on top be my Valentine??",  
    "I got you your favorite chocolates! Will you be my valentine now!?",  
    "Think about the flowers! Pleasssseeeee???", 
    "You're killing me here... Please be my Valentime..?",  
    "I'll DIE if you don't say yes! Please say YES!",  
    "Dies of heartbreak 💀"    
];

// -----STATE VARIABLES-----
let userName = "";
let selectedGender = "";
let noCount = 0;
let myTopicID = ""; 
const maxStages = 8;
let notificationSent = false; 

// ----- ON LOAD: CHECK URL -----
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const topicParam = urlParams.get('topic'); 

    if (topicParam) {
        // RECIPIENT MODE
        myTopicID = topicParam;
        document.getElementById("screen-0").classList.add("hidden");
        document.getElementById("screen-1").classList.remove("hidden");
    } else {
        // SENDER MODE
        document.getElementById("screen-0").classList.remove("hidden");
        document.getElementById("screen-1").classList.add("hidden");
    }
    
    preloadAllImages();
};

// ----- SENDER LOGIC -----

function startListening() {
    playClickSound();

    if ("Notification" in window) {
        Notification.requestPermission().then(permission => {
            generateLinkAndListen();
        });
    } else {
        generateLinkAndListen();
    }
}

function generateLinkAndListen() {
    const randomID = Math.floor(Math.random() * 1000000);
    myTopicID = `valentine_app_${randomID}`;

    const baseUrl = window.location.href.split('?')[0];
    const magicLink = `${baseUrl}?topic=${myTopicID}`;
    
    document.getElementById("generated-link").value = magicLink;
    document.getElementById("link-result").classList.remove("hidden");
    document.getElementById("setup-btn").classList.add("hidden");

    // START LISTENING
    const eventSource = new EventSource(`${NTFY_BASE_URL}/${myTopicID}/sse`);
    
    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data); 
        
        if (data.message.includes("YES")) {
            showSystemNotification("💖 THEY SAID YES!", data.message);
        } else if (data.message.includes("heart")) {
            showSystemNotification("💀 Bad News...", data.message);
        }
    };
}

function showSystemNotification(title, body) {
    playClickSound();
    if (Notification.permission === "granted") {
        new Notification(title, { body: body });
    } else {
        alert(`${title}\n${body}`);
    }
}

function copyLink() {
    const linkBox = document.getElementById("generated-link");
    linkBox.select();
    document.execCommand("copy");
    alert("Link copied! Send it to your Valentine.");
}

// ----- SOUND FUNCTION -----
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

// ----- GAME NAVIGATION -----

function goToScreen2() {
    playClickSound();
    const nameInput = document.getElementById("name-input");
    userName = nameInput.value.trim() || "Cutie"; 
    document.getElementById("display-name").innerText = userName;
    document.getElementById("screen-1").classList.add("hidden");
    document.getElementById("screen-2").classList.remove("hidden");
}

function selectGender(gender) {
    playClickSound();
    selectedGender = gender;
    updateGameUI();
    document.getElementById("screen-2").classList.add("hidden");
    document.getElementById("screen-3").classList.remove("hidden");
}

// ----- GAME LOGIC -----

function handleNo() {
    playClickSound();
    
    // 1. Increment Sadness
    if (noCount < maxStages) {
        noCount++;
    }
    
    // 2. Update the Screen
    updateGameUI();

    // If we reached the final stage (8), send the notification immediately.
    if (noCount === maxStages) {
        sendNtfyNotification(false);
    }
}

function handleYes() {
    playClickSound();
    
    const imgElement = document.getElementById("character-img");
    const textElement = document.getElementById("main-text");
    const yesBtn = document.getElementById("yes-btn");
    const noBtn = document.getElementById("no-btn");

    yesBtn.classList.add("hidden");
    noBtn.classList.add("hidden");

    imgElement.src = `images/${selectedGender}_yes.png`;
    textElement.innerText = `YAYYY!!! Thank you so much, ${userName}! 💖`;

    sendNtfyNotification(true);
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
        // Hide Buttons, Show Reset
        yesBtn.classList.add('hidden');
        noBtn.classList.add('hidden');
        resetBtn.classList.remove('hidden');
    } else {
        // Grow Yes Button
        const currentScale = 1 + (noCount * 0.4);
        yesBtn.style.transform = `scale(${currentScale})`;
    }
}

function resetGame() {
    playClickSound();
    noCount = 0;
    userName = "";
    selectedGender = "";
    notificationSent = false; // Reset the notification blocker

    document.getElementById("name-input").value = "";
    document.getElementById("yes-btn").style.transform = "scale(1)";
    document.getElementById("yes-btn").classList.remove("hidden");
    document.getElementById("no-btn").classList.remove("hidden");
    document.getElementById("reset-btn").classList.add("hidden");

    document.getElementById("screen-3").classList.add("hidden");
    document.getElementById("screen-1").classList.remove("hidden");
}

// ----- SENDING NOTIFICATION LOGIC -----
function sendNtfyNotification(accepted) {
    if (!myTopicID || notificationSent) return;

    notificationSent = true; 
    console.log("Sending Notification... Accepted:", accepted); // Debug line

    let messageText = "";
    let tags = [];
    
    if (accepted) {
        messageText = `${userName} said YES! 💖`;
        tags = ["tada", "heart"];
    } else {
        messageText = `${userName} broke your heart... 💀`;
        tags = ["skull"];
    }

    fetch(`${NTFY_BASE_URL}/${myTopicID}`, {
        method: "POST",
        body: messageText,
        headers: {
            "Title": "Valentine App Update",
            "Tags": tags.join(",")
        }
    })
    .then(response => console.log("Notification sent successfully!"))
    .catch(err => console.error("Could not send notification", err));
}

// ----- PRELOAD IMAGES -----
function preloadAllImages() {
    const genders = ["male", "female", "nb"];
    const max = 8;
    genders.forEach(gender => {
        for (let i = 0; i <= max; i++) {
            new Image().src = `images/${gender}_${i}.png`;
        }
        new Image().src = `images/${gender}_yes.png`;
    });
}