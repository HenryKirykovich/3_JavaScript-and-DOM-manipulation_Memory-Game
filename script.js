// 🎯 Select essential elements
const startButton = document.getElementById('start');
const message = document.getElementById('my_text');
const gridContainer = document.getElementById('grid-container');
const difficultySelect = document.getElementById('difficulty');
const timerDisplay = document.getElementById('timer');

// 🎯 Game variables
let flippedCards = [];
let moves = 0;
let cards = [];
let timerInterval;
let timeElapsed = 0;

// Retrieve total moves from localStorage
let totalMoves = localStorage.getItem('totalMoves') ? parseInt(localStorage.getItem('totalMoves')) : 0;

// 🎯 Load audio files
const flip = new Audio('assets/sounds/match.mp3');
const mismatchSound = new Audio('assets/sounds/mismatch.mp3');
const winnerBell = new Audio('assets/sounds/winner.mp3');

// 📌 Event listener for starting a new game
startButton.addEventListener('click', function() {
    // Clear saved game state
    localStorage.removeItem("cardStates");
    localStorage.removeItem("timer");
    sessionStorage.removeItem("gameState"); // Ensure session storage is cleared

    // Reset game variables
    message.textContent = ""; // Clear message
    clearGrid(); // Clear the grid
    clearInterval(timerInterval); // Stop any existing timer
    timeElapsed = 0;
    moves = 0;
    flippedCards = [];

    // Set grid size based on difficulty
    const gridSize = parseInt(difficultySelect.value);
    gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

    // Setup the game
    setupGame(gridSize * gridSize);
    startTimer();
});

// 📌 Load game state on page load
document.addEventListener("DOMContentLoaded", function() {
    loadGameState();
});

// 🎯 Function to clear the grid
function clearGrid() {
    gridContainer.innerHTML = '';
}

// 🎯 Function to setup the game board
function setupGame(number) {
    cards = generateCardValues(number);
    shuffle(cards);

    for (let i = 0; i < number; i++) {
        const card = document.createElement('div');
        card.className = 'item card';
        card.dataset.value = cards[i];
        card.addEventListener('click', flipCard);
        gridContainer.appendChild(card);
    }

    // Restore saved game state if available
    restoreGameState();
}

// 🎯 Function to generate pairs of card values (letters)
function generateCardValues(number) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numPairs = number / 2;
    const values = Array.from({ length: numPairs }, (_, i) => alphabet[i]);
    return [...values, ...values]; // Duplicate letters for pairs
}

// 🎯 Function to shuffle an array (Fisher-Yates shuffle)
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 🎯 Function to start the timer
function startTimer() {
    if (sessionStorage.getItem('timer')) {
        timeElapsed = parseInt(sessionStorage.getItem('timer')); // Restore time
    }

    timerInterval = setInterval(() => {
        timeElapsed++;
        sessionStorage.setItem('timer', timeElapsed);
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        timerDisplay.textContent = `Time: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

// 🎯 Function to stop the timer
function stopTimer() {
    clearInterval(timerInterval);
}

// 🎯 Function to flip a card
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

// 🎯 Function to check if two flipped cards match
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
    totalMoves++;
    message.textContent = `Moves: ${moves}`;
    localStorage.setItem('totalMoves', totalMoves);
    saveGameState();
}

// 🎯 Function to check if all pairs are matched
function checkWin() {
    const matchedCards = document.querySelectorAll('.card.matched').length;
    if (matchedCards === cards.length) {
        stopTimer();
        const gameOverMessage = document.getElementById('game-over-message');
        gameOverMessage.textContent = `Game Over! You won in ${moves} moves and ${timeElapsed} seconds.`;
    }
}

// 🎯 Function to save the game state
function saveGameState() {
    const cardStates = Array.from(document.querySelectorAll(".card")).map(card => ({
        letter: card.innerText,
        flipped: card.classList.contains("flipped")
    }));

    localStorage.setItem("cardStates", JSON.stringify(cardStates));
    localStorage.setItem("timer", document.getElementById("timer").innerText);
}

// 🎯 Function to load saved game state
function loadGameState() {
    let savedCards = JSON.parse(localStorage.getItem("cardStates"));
    let savedTime = localStorage.getItem("timer");

    if (savedCards) {
        const cards = document.querySelectorAll(".card");

        cards.forEach((card, index) => {
            card.innerText = savedCards[index].letter;
            if (savedCards[index].flipped) {
                card.classList.add("flipped");
            }
        });
    }

    if (savedTime) {
        document.getElementById("timer").innerText = savedTime;
    }
}

// 🎯 Function to restore game state from sessionStorage
function restoreGameState() {
    const savedState = JSON.parse(sessionStorage.getItem('gameState'));

    if (savedState) {
        moves = savedState.moves;
        timeElapsed = savedState.timeElapsed;
        message.textContent = `Moves: ${moves}`;

        startTimer();

        document.querySelectorAll('.card').forEach(card => {
            const index = card.dataset.index;
            if (savedState.flippedCards.includes(index)) {
                card.classList.add('flipped');
                card.textContent = card.dataset.value;
            }
            if (savedState.matchedCards.includes(index)) {
                card.classList.add('matched');
                card.textContent = card.dataset.value;
            }
        });
    }
}