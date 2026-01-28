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
    "Dies of heartbreak"    
];

// -----STATE VARIABLES-----
let userName = "";
let selectedGender = "";
let noCount = 0;
let myTopicID = ""; 
const maxStages = 8;
let notificationSent = false; 

// ----- ON LOAD: CHECK URL & MEMORY -----
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const topicParam = urlParams.get('topic'); 

    if (topicParam) {
        // --- RECIPIENT MODE ---
        // The user clicked a link sent to them
        myTopicID = topicParam;
        document.getElementById("screen-0").classList.add("hidden");
        document.getElementById("screen-1").classList.remove("hidden");
    } else {
        // --- SENDER MODE ---
        // Check if we already created a link before (Persistence Fix)
        const savedTopic = localStorage.getItem("valentine_topic_id");
        
        if (savedTopic) {
            // Restore the previous session!
            myTopicID = savedTopic;
            showLinkScreen(savedTopic);
            startListening(true); // true = skip permission request for now
        } else {
            // New user
            document.getElementById("screen-0").classList.remove("hidden");
            document.getElementById("screen-1").classList.add("hidden");
        }
    }
    
    preloadAllImages();
};

// ----- SENDER LOGIC (SCREEN 0) -----

function startListening(isRestoring = false) {
    if (!isRestoring) playClickSound();

    if ("Notification" in window) {
        Notification.requestPermission().then(permission => {
            if (!isRestoring) generateLinkAndListen();
            else connectToEventSource(); // Just reconnect if restoring
        });
    } else {
        if (!isRestoring) generateLinkAndListen();
        else connectToEventSource();
    }
}

function generateLinkAndListen() {
    // Generate a random ID
    const randomID = Math.floor(Math.random() * 1000000);
    myTopicID = `valentine_app_${randomID}`;

    // SAVE IT TO MEMORY (Fix for refresh issue)
    localStorage.setItem("valentine_topic_id", myTopicID);

    showLinkScreen(myTopicID);
    connectToEventSource();
}

function showLinkScreen(topicID) {
    const baseUrl = window.location.href.split('?')[0];
    const magicLink = `${baseUrl}?topic=${topicID}`;
    
    document.getElementById("generated-link").value = magicLink;
    document.getElementById("link-result").classList.remove("hidden");
    document.getElementById("setup-btn").classList.add("hidden");
}

function connectToEventSource() {
    // Connect to ntfy server
    console.log("Listening on topic:", myTopicID);
    const eventSource = new EventSource(`${NTFY_BASE_URL}/${myTopicID}/sse`);
    
    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data); 
        
        // Only notify if it's a specific user action
        if (data.message && (data.message.includes("YES") || data.message.includes("heart"))) {
            showSystemNotification("💌 UPDATE!", data.message);
        }
    };
}

function showSystemNotification(title, body) {
    // Try to play sound
    playClickSound();

    // Try to show visual popup
    if (Notification.permission === "granted") {
        // Mobile browsers often require the page to be VISIBLE for this to work
        new Notification(title, { body: body, icon: "images/female_yes.png" });
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
        // Silent fail if audio not allowed
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
    
    if (noCount < maxStages) {
        noCount++;
    }
    
    updateGameUI();

    // If final stage reached, send notification
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
        yesBtn.classList.add('hidden');
        noBtn.classList.add('hidden');
        resetBtn.classList.remove('hidden');
    } else {
        const currentScale = 1 + (noCount * 0.4);
        yesBtn.style.transform = `scale(${currentScale})`;
    }
}

function resetGame() {
    playClickSound();
    noCount = 0;
    userName = "";
    selectedGender = "";
    notificationSent = false; 

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
    .then(response => console.log("Notification sent!"))
    .catch(err => console.error("Error:", err));
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