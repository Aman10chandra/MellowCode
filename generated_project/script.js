// Get the display screen element
const displayScreen = document.getElementById('display-screen');

// Initialize variables to store the current number, previous number, and operation
let currentNumber = '';
let previousNumber = '';
let operation = '';

// Function to add a number to the current number
function addNumber(number) {
  if (currentNumber.includes('.') && number === '.') return;
  currentNumber += number;
  updateDisplay();
}

// Function to perform an operation
function performOperation(op) {
  if (currentNumber === '') return;
  if (previousNumber !== '') {
    calculateResult();
  }
  operation = op;
  previousNumber = currentNumber;
  currentNumber = '';
}

// Function to calculate the result of the operation
function calculateResult() {
  let result;
  switch (operation) {
    case '+':
      result = parseFloat(previousNumber) + parseFloat(currentNumber);
      break;
    case '-':
      result = parseFloat(previousNumber) - parseFloat(currentNumber);
      break;
    case '*':
      result = parseFloat(previousNumber) * parseFloat(currentNumber);
      break;
    case '/':
      if (currentNumber === '0') {
        result = 'Error: Division by zero';
      } else {
        result = parseFloat(previousNumber) / parseFloat(currentNumber);
      }
      break;
    default:
      result = '';
  }
  currentNumber = result.toString();
  previousNumber = '';
  operation = '';
  updateDisplay();
}

// Function to update the display screen
function updateDisplay() {
  displayScreen.value = currentNumber;
}

// Function to clear the calculator
function clearCalculator() {
  currentNumber = '';
  previousNumber = '';
  operation = '';
  updateDisplay();
}

// Function to delete a digit from the current number
function deleteDigit() {
  currentNumber = currentNumber.slice(0, -1);
  updateDisplay();
}

// Add event listeners to the keypad buttons
document.querySelectorAll('.keypad-button').forEach(button => {
  button.addEventListener('click', () => {
    const buttonValue = button.textContent;
    if (buttonValue >= '0' && buttonValue <= '9' || buttonValue === '.') {
      addNumber(buttonValue);
    } else if (buttonValue === '+' || buttonValue === '-' || buttonValue === '*' || buttonValue === '/') {
      performOperation(buttonValue);
    } else if (buttonValue === '=') {
      if (currentNumber !== '') {
        calculateResult();
      }
    } else if (buttonValue === 'C') {
      clearCalculator();
    } else if (buttonValue === 'DEL') {
      deleteDigit();
    }
  });
});