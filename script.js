//  !!! used here DOM concept:  call my document > referencing HTML Element > variable  !!!
// 
const startButton = document.getElementById('start');
const message = document.getElementById('my_text');
const gridContainer = document.getElementById('grid-container');
const difficultySelect = document.getElementById('difficulty');
const timerDisplay = document.getElementById('timer');
// 

let flippedCards = [];
let moves = 0;
let cards = [];
let timerInterval;
let timeElapsed = 0;
let totalMoves = localStorage.getItem('totalMoves') ? parseInt(localStorage.getItem('totalMoves')) : 0; // !!! retrieved value + check value + parse value to string  by ternary expression !!! //


// !!! Load game state on page refresh using SessionStorage !!!
document.addEventListener('DOMContentLoaded', loadGameState);


// Load audio files for sound effects
const flip = new Audio('assets/sounds/match.mp3'); // Sound for matching cards
const mismatchSound = new Audio('assets/sounds/mismatch.mp3'); // Sound for mismatched cards
const winnerBell = new Audio('assets/sounds/winner.mp3')



// Start a new game      

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



// Clear the grid
function clearGrid() {
    gridContainer.innerHTML = ''; // typical DOM manipulation > assigning empty string to HTML Document //
}

// Setup the game
function setupGame(number) {
    cards = generateCardValues(number); // Generate card values
    shuffle(cards); // Shuffle the card values

    // Create cards and add them to the grid
    for (let i = 0; i < number; i++) {
        const card = document.createElement('div');
        card.className = 'item card'; // Add CSS classes
        card.dataset.value = cards[i]; // Assign value to the card
        card.addEventListener('click', flipCard); // Add click event listener
        gridContainer.appendChild(card); // Add card to the grid container
    }

    // !!! Restore game state if available
    restoreGameState();
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
// function startTimer() {
// timerDisplay.textContent = `Time: 00:00`; // Reset timer display
// 
// timerInterval = setInterval(() => { // !!! ES6 concepts > lambda functions !!!///
// timeElapsed++;
// sessionStorage.setItem('timer', timeElapsed); //!!! addition for Week 4  Save timer in session storage
// const minutes = Math.floor(timeElapsed / 60);
// const seconds = timeElapsed % 60;
// timerDisplay.textContent = `Time: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`; // !!! ES6 concepts > Template Literals !!!///
// }, 1000);
// }


function startTimer() {
    if (sessionStorage.getItem('timer')) {
        timeElapsed = parseInt(sessionStorage.getItem('timer')); // Restore time
    }

    timerInterval = setInterval(() => {
        timeElapsed++;
        sessionStorage.setItem('timer', timeElapsed); // Store timer in sessionStorage
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        timerDisplay.textContent = `Time: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}


// Stop the timer
function stopTimer() {
    clearInterval(timerInterval);
}

// Flip a card
function flipCard() {
    // Ignore clicks if 2 cards are already flipped or the card is already matched
    if (flippedCards.length >= 2 || this.classList.contains('matched')) return;

    flip.play();
    this.classList.add('flipped'); // Add 'flipped' class
    this.textContent = this.dataset.value; // Show card value
    flippedCards.push(this); // Add card to flippedCards array

    // If two cards are flipped, check for a match
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

    moves++; // Increment current game move counter
    totalMoves++; // Increment total moves across all sessions
    message.textContent = `Moves: ${moves}`;
    localStorage.setItem('totalMoves', totalMoves); // Store total moves in LocalStorage
    saveGameState(); // Save current game state


}

function checkWin() {
    const matchedCards = document.querySelectorAll('.card.matched').length;
    if (matchedCards === cards.length) { // Check if all cards are matched
        stopTimer(); // Stop the timer
        const gameOverMessage = document.getElementById('game-over-message');
        gameOverMessage.textContent = `Game Over! You won in ${moves} moves and ${timeElapsed} seconds.`; // Display the message

    }
}

// !!! Save Game State in SessionStorage !!!
function saveGameState() {
    const gameState = {
        moves: moves, // Save current moves
        timeElapsed: timeElapsed, // Save timer state
        flippedCards: Array.from(document.querySelectorAll('.card.flipped')).map(card => card.dataset.index),
        matchedCards: Array.from(document.querySelectorAll('.card.matched')).map(card => card.dataset.index)
    };
    sessionStorage.setItem('gameState', JSON.stringify(gameState)); // Store game state
}

// !!! Load game state on refresh using SessionStorage !!!
function loadGameState() {
    if (sessionStorage.getItem('gameState')) {
        restoreGameState();
    }
}


// !!! Restore game state after page refresh !!!
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