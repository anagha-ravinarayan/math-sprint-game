// Pages
const gamePage = document.getElementById('game-page');
const scorePage = document.getElementById('score-page');
const splashPage = document.getElementById('splash-page');
const countdownPage = document.getElementById('countdown-page');
// Splash Page
const startForm = document.getElementById('start-form');
const radioContainers = document.querySelectorAll('.radio-container');
const radioInputs = document.querySelectorAll('input');
const startBtn = document.getElementById('start-game');
const bestScoresEl = document.querySelectorAll('.best-score-value');
// Countdown Page
const countdown = document.querySelector('.countdown');
// Game Page
const itemContainer = document.querySelector('.item-container');
const wrongBtn = document.querySelector('.wrong');
const rightBtn = document.querySelector('.right');
// Score Page
const finalTimeEl = document.querySelector('.final-time');
const baseTimeEl = document.querySelector('.base-time');
const penaltyTimeEl = document.querySelector('.penalty-time');
const playAgainBtn = document.querySelector('.play-again');

// Game
let questionCount = 0;
let equationsArray = [];
let playerGuessArray = [];
let bestScores = [];

// Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;

// Scroll
let valueY = 0;

// get Best Scores From LocalStorage and update DOM
function getBestScoresFromLocalStorage() {
  if (localStorage.getItem('bestScores')) {
    bestScores = JSON.parse(localStorage.getItem('bestScores'));
  } else {
    bestScores = [
      { questionCount: 10, bestScore: 0.0 },
      { questionCount: 25, bestScore: 0.0 },
      { questionCount: 50, bestScore: 0.0 },
      { questionCount: 99, bestScore: 0.0 },

    ];
    localStorage.setItem('bestScores', JSON.stringify(bestScores));
  }
  bestScoresEl.forEach((element, i) => {
    element.textContent = `${bestScores[i].bestScore}s`;
  });
}

function saveBestScoreToLocalStorage() {
  bestScores.forEach((score, i) => {
    if (score.questionCount === questionCount && (score.bestScore > finalTime || score.bestScore === 0.0)) {
      bestScores[i].bestScore = finalTime;
    }
  });
  localStorage.setItem('bestScores', JSON.stringify(bestScores));
}

// Process Results and show score page
function showScorePage() {
  baseTime = parseFloat(timePlayed.toFixed(1));
  playerGuessArray.forEach((guess, i) => {
    const rightAnswer = equationsArray[i].evaluated;
    if (guess !== rightAnswer) {
      penaltyTime += 0.5;
    }
  });
  finalTime = baseTime + penaltyTime;

  finalTimeEl.textContent = `${finalTime}s`;
  baseTimeEl.textContent = `Basetime : ${baseTime}s`;
  penaltyTimeEl.textContent = `Penalty : ${penaltyTime}s`;

  gamePage.hidden = true;
  scorePage.hidden = false;

  saveBestScoreToLocalStorage();
}

// Stop Timer and go to score page
function checkTime() {
  if (playerGuessArray.length === questionCount) {
    clearInterval(timer);
    wrongBtn.disabled = true;
    rightBtn.disabled = true;
    showScorePage();
  }
}

// Start Timer when Game page is clicked
function startTimer() {
  // Reset Times
  timePlayed = 0;
  baseTime = 0;
  penaltyTime = 0;
  finalTime = 0;

  timer = setInterval(() => {
    timePlayed += 0.1;
    checkTime();
  }, 100);
}

// Shuffle equations array
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

// Create Correct/Incorrect Random Equations
function createEquations() {
  let firstNumber = 0;
  let secondNumber = 0;
  let equationObject = {};
  const wrongFormat = [];

  // Randomly choose how many correct equations there should be
  const correctEquations = Math.floor(Math.random() * questionCount);
  // Set amount of wrong equations
  const wrongEquations = questionCount - correctEquations;
  // Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = Math.floor(Math.random() * 9);
    secondNumber = Math.floor(Math.random() * 9);
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: true };
    equationsArray.push(equationObject);
  }
  // Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = Math.floor(Math.random() * 9);
    secondNumber = Math.floor(Math.random() * 9);
    const equationValue = firstNumber * secondNumber;
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
    const formatChoice = Math.floor(Math.random() * 3);
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: false };
    equationsArray.push(equationObject);
  }
  shuffle(equationsArray);
}

// Add Equations to DOM
function equationsToDOM() {
  equationsArray.forEach(equation => {
    const item = document.createElement('div');
    item.classList.add('item');

    const equationText = document.createElement('h1');
    equationText.textContent = equation.value;

    item.appendChild(equationText);
    itemContainer.appendChild(item);
  });
}

// Displays 3, 2, 1, GO!
function startCountdown() {
  let count = 3;
  countdown.textContent = count;
  let interval = setInterval(() => {
    count--;
    if (count > 0) {
      countdown.textContent = count;
    } else if (count === 0) {
      countdown.textContent = 'Go!';
    } else if (count === -1) {
      clearInterval(interval);
      showGamePage();
    }
  }, 1000);
}

// Navigate to Countdown page
function showCountdownPage() {
  splashPage.hidden = true;
  countdownPage.hidden = false;
  startCountdown();
}

// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = '';
  // Spacer
  const topSpacer = document.createElement('div');
  topSpacer.classList.add('height-240');
  // Selected Item
  const selectedItem = document.createElement('div');
  selectedItem.classList.add('selected-item');
  // Append
  itemContainer.append(topSpacer, selectedItem);

  // Create Equations, Build Elements in DOM
  createEquations();
  equationsToDOM();

  // Set Blank Space Below
  const bottomSpacer = document.createElement('div');
  bottomSpacer.classList.add('height-500');
  itemContainer.appendChild(bottomSpacer);
}

// Navigate to Game page
function showGamePage() {
  wrongBtn.disabled = false;
  rightBtn.disabled = false;

  countdownPage.hidden = true;
  gamePage.hidden = false;

  itemContainer.scroll(0, valueY);
  startTimer();
}

// Get the value of selected Radio Element
function getRadioValue() {
  let value;
  radioInputs.forEach(radioInput => {
    if (radioInput.checked) {
      value = radioInput.value;
    }
  });
  return value;
}

// Event Listener Functions -------------------------------------

// Store User Guess and Scroll 80 pixels to next question
function select(guess) {
  playerGuessArray.push(guess);
  valueY += 80;
  itemContainer.scroll(0, valueY);
}

// Play Again
function playAgain() {
  scorePage.hidden = true;
  splashPage.hidden = false;

  questionCount = 0;
  equationsArray = [];
  playerGuessArray = [];
  valueY = 0;

  radioContainers.forEach(radioEl => {
    radioEl.classList.remove('selected-label');
    radioEl.children[1].checked = false;
    startBtn.disabled = true;
  });

  getBestScoresFromLocalStorage();
}

// Apply styles to selected Radio Element
function selectRadioElement() {
  radioContainers.forEach(radioEl => {
    // Remove selected label styling
    radioEl.classList.remove('selected-label');
    // Add selected label styling, if selected
    if (radioEl.children[1].checked) {
      radioEl.classList.add('selected-label');
      startBtn.disabled = false;
    }
  });
}

// Decide the count of questions
function selectQuestionCount(event) {
  event.preventDefault();
  questionCount = parseInt(getRadioValue());
  populateGamePage();
  showCountdownPage();
}

// Event Listeners -------------------------------------
startForm.addEventListener('click', selectRadioElement);
startForm.addEventListener('submit', selectQuestionCount);

// On Load
getBestScoresFromLocalStorage();