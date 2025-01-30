//  Select game elements
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

// 🎯 Load saved moves count
let totalMoves = localStorage.getItem('totalMoves') ? parseInt(localStorage.getItem('totalMoves')) : 0;

// 🎯 Load sounds
const flip = new Audio('assets/sounds/match.mp3');
const mismatchSound = new Audio('assets/sounds/mismatch.mp3');
const winnerBell = new Audio('assets/sounds/winner.mp3');

// 📌 Load game state on page refresh
document.addEventListener("DOMContentLoaded", function() {
    loadGameState();
});

// 📌 New Game Button - Reset Game State
startButton.addEventListener('click', function() {
    // Clear stored game state
    localStorage.removeItem("cardStates");
    localStorage.removeItem("timer");
    sessionStorage.removeItem("gameState");

    // Reset variables
    clearGrid();
    clearInterval(timerInterval);
    timeElapsed = 0;
    moves = 0;
    flippedCards = [];

    // Get grid size & setup new game
    const gridSize = parseInt(difficultySelect.value);
    gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

    setupGame(gridSize * gridSize);
    startTimer();
});

// 📌 Function to clear the grid
function clearGrid() {
    gridContainer.innerHTML = '';
}

// 📌 Function to setup the game board
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

    restoreGameState(); // Restore previous game state if available
}

// 📌 Generate unique pairs of card values
function generateCardValues(number) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numPairs = number / 2;
    const values = Array.from({ length: numPairs }, (_, i) => alphabet[i]);
    return [...values, ...values];
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
    if (sessionStorage.getItem('timer')) {
        timeElapsed = parseInt(sessionStorage.getItem('timer'));
    }

    timerInterval = setInterval(() => {
        timeElapsed++;
        sessionStorage.setItem('timer', timeElapsed);
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        timerDisplay.textContent = `Time: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

// 📌 Stop the timer
function stopTimer() {
    clearInterval(timerInterval);
}

// 📌 Flip a card
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

// 📌 Check if two flipped cards match
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

// 📌 Check if the player has won
function checkWin() {
    const matchedCards = document.querySelectorAll('.card.matched').length;
    if (matchedCards === cards.length) {
        stopTimer();
        const gameOverMessage = document.getElementById('game-over-message');
        gameOverMessage.textContent = `Game Over! You won in ${moves} moves and ${timeElapsed} seconds.`;
    }
}

// 📌 Save the current game state
function saveGameState() {
    const cardStates = Array.from(document.querySelectorAll(".card")).map(card => ({
        letter: card.innerText,
        flipped: card.classList.contains("flipped"),
        matched: card.classList.contains("matched")
    }));

    localStorage.setItem("cardStates", JSON.stringify(cardStates));
    localStorage.setItem("timer", timeElapsed);
}

// 📌 Load the saved game state
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
            if (savedCards[index].matched) {
                card.classList.add("matched");
            }
        });
    }

    if (savedTime) {
        timeElapsed = parseInt(savedTime);
        document.getElementById("timer").innerText = `Time: ${Math.floor(timeElapsed / 60)}:${String(timeElapsed % 60).padStart(2, '0')}`;
    }
}

// 📌 Restore previous game state (on refresh)
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