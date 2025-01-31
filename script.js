//  !!! used here DOM concept:  call my document > referencing HTML Element > variable  !!!
// 
const startButton = document.getElementById('start');
const message = document.getElementById('my_text');
const gridContainer = document.getElementById('grid-container');
const difficultySelect = document.getElementById('difficulty');
const timerDisplay = document.getElementById('timer');
// 

// Check localStorage Before Loading Game
document.addEventListener("DOMContentLoaded", function() {
    if (localStorage.getItem("gameState")) {
        console.log("Saved game found. Restoring...");
        loadGameState(); // Restore the game state if available
    } else {
        console.log("No saved game found. Starting fresh...");
        startNewGame(); // Start a new game if no saved data
    }
});

let flippedCards = [];
let moves = 0;
let cards = [];
let timerInterval;
let timeElapsed = 0;

// Load audio files for sound effects
const flip = new Audio('assets/sounds/match.mp3'); // Sound for matching cards
const mismatchSound = new Audio('assets/sounds/mismatch.mp3'); // Sound for mismatched cards
const winnerBell = new Audio('assets/sounds/winner.mp3')


function startNewGame() {
    // Reset game state
    message.textContent = "";
    clearGrid();
    clearInterval(timerInterval);
    timeElapsed = 0;
    moves = 0;
    flippedCards = [];

    const gridSize = parseInt(difficultySelect.value); // Get grid size
    gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

    setupGame(gridSize * gridSize);
    startTimer();
}


// Define `setupGame()` BEFORE it is called
function setupGame(number) {
    cards = generateCardValues(number); // Generate card values
    shuffle(cards); // Shuffle the card values

    // Clear the grid before creating a new one
    clearGrid();

    for (let i = 0; i < number; i++) {
        const card = document.createElement("div");
        card.className = "item card";
        card.dataset.value = cards[i];
        card.dataset.index = i; // Assign a unique index

        card.addEventListener("click", flipCard);
        gridContainer.appendChild(card);
    }
}

//Start Button Listener (Triggers New Game)
startButton.addEventListener('click', startNewGame);


// Clear Grid Function

function clearGrid() {
    gridContainer.innerHTML = ''; // typical DOM manipulation > assigning empty string to HTML Document //
}

// Generate card values (pairs of letters) // !!! used Functional Programming Concept > taking number > produced array with pair letters !!! 
function generateCardValues(number) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // List of letters
    const numPairs = number / 2; // Calculate how many pairs are needed


    const values = Array.from({ length: numPairs }, (_, i) => alphabet[i]); // Take the first N letters

    // !!! used  ES6  Spreding  !!! 
    return [...values, ...values]; // Duplicate letters for pairs    
}



// Shuffle an array  // !!! Functional Programming !!!
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Start the timer
function startTimer() {
    timerDisplay.textContent = `Time: 00:00`; // Reset timer display

    timerInterval = setInterval(() => { // !!! ES6 concepts > lambda functions !!!///
        timeElapsed++;
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        timerDisplay.textContent = `Time: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`; // !!! ES6 concepts > Template Literals !!!///
    }, 1000);
}

// Stop Timer Function

function stopTimer() {
    clearInterval(timerInterval);
}



// !!! used Listener for activating anonymous function > activating working match process !! //

startButton.addEventListener('click', function() {
    // Reset game state
    message.textContent = ""; // Clear message  //  DOM Manipulation
    clearGrid(); // Clear the grid
    clearInterval(timerInterval); // Stop any existing timer
    timeElapsed = 0; // Reset timer
    moves = 0; // Reset move counter
    flippedCards = []; // Reset flipped cards array
    const gridSize = parseInt(difficultySelect.value); // Get selected grid size
    gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`; // !!! used DOM  > assigning style via JS !!! //
    gridContainer.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
    setupGame(gridSize * gridSize); // Create a grid with the specified size
    startTimer(); // Start the timer
});


// Flip Card Function(Handles Click Event)

function flipCard() {
    if (flippedCards.length >= 2 || this.classList.contains('matched')) return;

    flip.play(); // Play flip sound
    this.classList.add('flipped');
    this.textContent = this.dataset.value;
    flippedCards.push(this);

    if (flippedCards.length === 2) {
        checkMatch();
    }
}

// Flip Card Function(Handles Click Event)

function flipCard() {
    if (flippedCards.length >= 2 || this.classList.contains('matched')) return;

    flip.play(); // Play flip sound
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
        // Cards match

        card1.classList.add('matched');
        card2.classList.add('matched');
        flippedCards = []; // Clear flippedCards array
        checkWin(); // Check if all pairs are matched
        winnerBell.play(); // Play match sound
    } else {
        // Cards do not match
        setTimeout(() => { // !!! ES6 concepts > lambda functions !!!///
            mismatchSound.play(); // Play mismatch sound
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            card1.textContent = '';
            card2.textContent = '';
            flippedCards = []; // Clear flippedCards array
        }, 1000); // 1-second delay
    }

    moves++; // Increment move counter
    message.textContent = `Moves: ${moves}`; // Update message with move count
}


function checkWin() {
    const matchedCards = document.querySelectorAll('.card.matched').length;
    if (matchedCards === cards.length) { // Check if all cards are matched
        stopTimer(); // Stop the timer
        const gameOverMessage = document.getElementById('game-over-message');
        gameOverMessage.textContent = `Game Over! You won in ${moves} moves and ${timeElapsed} seconds.`; // Display the message

    }
}



// Save Game State(localStorage)

function saveGameState() {
    const gameState = {
        moves: moves,
        timeElapsed: timeElapsed,
        flippedCards: flippedCards.map(card => card.dataset.index),
        matchedCards: Array.from(document.querySelectorAll(".card.matched")).map(card => card.dataset.index)
    };

    localStorage.setItem("gameState", JSON.stringify(gameState));
}

// Load Game State(localStorage)

function loadGameState() {
    const savedGameState = JSON.parse(localStorage.getItem("gameState"));

    if (savedGameState) {
        moves = savedGameState.moves;
        timeElapsed = savedGameState.timeElapsed;
        message.textContent = `Moves: ${moves}`;

        setupGame(savedGameState.gridSize);
        startTimer();
    }
}

// Clear the grid
// function clearGrid() {
// gridContainer.innerHTML = ''; // typical DOM manipulation > assigning empty string to HTML Document //
// }

// Setup the game
// function setupGame(number) {
// cards = generateCardValues(number); // Generate card values
// shuffle(cards); // Shuffle the card values
// 
// Create cards and add them to the grid
// for (let i = 0; i < number; i++) {
// const card = document.createElement('div');
// card.className = 'item card'; // Add CSS classes
// card.dataset.value = cards[i]; // Assign value to the card
// card.addEventListener('click', flipCard); // Add click event listener
// gridContainer.appendChild(card); // Add card to the grid container
// }
// }