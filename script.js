//  Select game elements
const startButton = document.getElementById('start');
const message = document.getElementById('my_text');
const gridContainer = document.getElementById('grid-container');
const difficultySelect = document.getElementById('difficulty');
const timerDisplay = document.getElementById('timer');

// Game variables
let flippedCards = [];
let moves = 0;
let cards = [];
let timerInterval;
let timeElapsed = 0;

// Load sounds
const flip = new Audio('assets/sounds/match.mp3');
const mismatchSound = new Audio('assets/sounds/mismatch.mp3');
const winnerBell = new Audio('assets/sounds/winner.mp3');

// Load game state on refresh
document.addEventListener("DOMContentLoaded", function() {
    if (localStorage.getItem("gameState")) {
        console.log("Saved game found. Restoring...");
        loadGameState(); // Restore the game state if available
    } else {
        console.log("No saved game found. Starting fresh...");
        startNewGame(); // Start a new game if no saved data
    }
});

// Function to start a new game
function startNewGame() {
    message.textContent = "";
    clearGrid();

    stopTimer(); // 🔹 Ensure the previous timer is cleared before restarting

    timeElapsed = 0; // 🔹 Reset time elapsed
    sessionStorage.removeItem("timer"); // nsure old timer value is cleared

    moves = 0;
    flippedCards = [];

    const gridSize = parseInt(difficultySelect.value);
    gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

    setupGame(gridSize * gridSize);

    startTimer(); // 🔹 Start the timer fresh
}


// Function to setup the game board
function setupGame(number, restoredCards = null) {
    if (!restoredCards) {
        cards = generateCardValues(number); // Generate new card values
        shuffle(cards);
    } else {
        cards = restoredCards; // Use stored card values instead of generating new ones
    }

    clearGrid();

    for (let i = 0; i < number; i++) {
        const card = document.createElement("div");
        card.className = "item card";
        card.dataset.value = cards[i];
        card.dataset.index = i;

        card.addEventListener("click", flipCard);
        gridContainer.appendChild(card);
    }
}

// Start Button Listener
startButton.addEventListener('click', startNewGame);

// Clear Grid Function
function clearGrid() {
    gridContainer.innerHTML = '';
}

// Generate card values (pairs of letters)
function generateCardValues(number) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numPairs = number / 2;
    const values = Array.from({ length: numPairs }, (_, i) => alphabet[i]);
    return [...values, ...values];
}

// Shuffle function
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Start the timer
function startTimer() {
    stopTimer(); //  Stop any existing timer before starting a new one

    timerInterval = setInterval(() => {
        timeElapsed++;
        sessionStorage.setItem("timer", timeElapsed); // ✅ Update session storage
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        timerDisplay.textContent = `Time: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

// Stop the timer


function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval); // Clears the existing timer
        timerInterval = null; // Resets the variable to avoid multiple timers
    }
}


// Flip a card
function flipCard() {
    if (flippedCards.length >= 2 || this.classList.contains('matched')) return;

    flip.play();
    this.classList.add('flipped');
    this.textContent = this.dataset.value;
    flippedCards.push(this);

    if (flippedCards.length === 2) {
        checkMatch();
    }
}


// Check if two flipped cards match
function checkMatch() {
    const [card1, card2] = flippedCards;

    if (card1.dataset.value === card2.dataset.value) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        flippedCards = [];
        checkWin();
        winnerBell.play();
    } else {
        setTimeout(() => {
            mismatchSound.play();
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            card1.textContent = '';
            card2.textContent = '';
            flippedCards = [];
        }, 1000);
    }

    moves++;
    message.textContent = `Moves: ${moves}`;
    saveGameState();
}

// Check if player won
function checkWin() {
    const matchedCards = document.querySelectorAll('.card.matched').length;
    if (matchedCards === cards.length) {
        stopTimer();
        const gameOverMessage = document.getElementById('game-over-message');
        gameOverMessage.textContent = `Game Over! You won in ${moves} moves and ${timeElapsed} seconds.`;
    }
}

// Save game state
function saveGameState() {
    const gameState = {
        moves: moves,
        timeElapsed: timeElapsed,
        gridSize: parseInt(difficultySelect.value),
        cards: Array.from(document.querySelectorAll(".card")).map(card => ({
            index: card.dataset.index,
            value: card.dataset.value,
            flipped: card.classList.contains("flipped"),
            matched: card.classList.contains("matched")
        }))
    };

    console.log("Saving game state:", gameState);
    localStorage.setItem("gameState", JSON.stringify(gameState));
}


// Load game state

function loadGameState() {
    const savedGameState = JSON.parse(localStorage.getItem("gameState"));

    if (savedGameState) {
        moves = savedGameState.moves;
        timeElapsed = savedGameState.timeElapsed;
        message.textContent = `Moves: ${moves}`;
        difficultySelect.value = savedGameState.gridSize;

        gridContainer.style.gridTemplateColumns = `repeat(${savedGameState.gridSize}, 1fr)`;
        gridContainer.style.gridTemplateRows = `repeat(${savedGameState.gridSize}, 1fr)`;

        setupGame(savedGameState.gridSize * savedGameState.gridSize, savedGameState.cards);

        document.querySelectorAll('.card').forEach(card => {
            const savedCard = savedGameState.cards.find(c => c.index === card.dataset.index);
            if (savedCard) {
                card.dataset.value = savedCard.value;
                if (savedCard.matched) {
                    card.classList.add("matched");
                    card.textContent = savedCard.value;
                } else {
                    // Ensure unmatched cards reset on refresh
                    card.classList.remove("flipped");
                    card.textContent = "";
                }
            }
        });

        startTimer();
    }
}