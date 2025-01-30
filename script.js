// 🎯 Select game elements
const startButton = document.getElementById("start");
const message = document.getElementById("my_text");
const gridContainer = document.getElementById("grid-container");
const difficultySelect = document.getElementById("difficulty");
const timerDisplay = document.getElementById("timer");

// 🎯 Game variables
let flippedCards = [];
let moves = 0;
let cards = [];
let timerInterval;
let timeElapsed = 0;

// 🎯 Load saved moves count
let totalMoves = localStorage.getItem("totalMoves") ? parseInt(localStorage.getItem("totalMoves")) : 0;

// 🎯 Load sounds
const flip = new Audio("assets/sounds/match.mp3");
const mismatchSound = new Audio("assets/sounds/mismatch.mp3");
const winnerBell = new Audio("assets/sounds/winner.mp3");

// 📌 Load game state on page refresh
document.addEventListener("DOMContentLoaded", function() {
    totalMoves = localStorage.getItem("totalMoves") ? parseInt(localStorage.getItem("totalMoves")) : 0;
    message.textContent = `Moves: ${totalMoves}`;
    setupGame(parseInt(difficultySelect.value) ** 2);
    loadGameState();
});

// 📌 New Game Button - Reset Game State
startButton.addEventListener("click", function() {
    localStorage.removeItem("cardStates");
    sessionStorage.removeItem("gameState");
    sessionStorage.removeItem("timer");

    clearGrid();
    clearInterval(timerInterval);
    timeElapsed = 0;
    moves = 0;
    flippedCards = [];

    const gridSize = parseInt(difficultySelect.value);
    gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

    setupGame(gridSize * gridSize);
    startTimer();
});

// 📌 Function to clear the grid
function clearGrid() {
    gridContainer.innerHTML = "";
}

// 📌 Function to setup the game board
function setupGame(number) {
    cards = generateCardValues(number);
    shuffle(cards);

    for (let i = 0; i < number; i++) {
        const card = document.createElement("div");
        card.className = "item card";
        card.dataset.value = cards[i];
        card.addEventListener("click", flipCard);
        gridContainer.appendChild(card);
    }

    restoreGameState();
}

// 📌 Generate unique pairs of card values
function generateCardValues(number) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numPairs = number / 2;
    return Array.from({ length: numPairs }, (_, i) => alphabet[i]).flatMap(value => [value, value]);
}

// 📌 Shuffle the cards
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 📌 Start the timer
function startTimer() {
    if (sessionStorage.getItem("timer")) {
        timeElapsed = parseInt(sessionStorage.getItem("timer"));
    }

    timerInterval = setInterval(() => {
        timeElapsed++;
        sessionStorage.setItem("timer", timeElapsed);
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        timerDisplay.textContent = `Time: ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }, 1000);
}

// 📌 Flip a card
function flipCard() {
    if (flippedCards.length >= 2 || this.classList.contains("matched")) return;

    flip.play();
    this.classList.add("flipped");
    this.textContent = this.dataset.value;
    flippedCards.push(this);

    if (flippedCards.length === 2) {
        checkMatch();
    }
}

// 📌 Check if the player has won
function checkWin() {
    if (document.querySelectorAll(".card.matched").length === cards.length) {
        stopTimer();
        document.getElementById("game-over-message").textContent = `Game Over! You won in ${moves} moves and ${timeElapsed} seconds.`;
    }
}