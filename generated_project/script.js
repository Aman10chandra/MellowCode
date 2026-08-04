let displayScreen = document.getElementById('display-screen');
let currentNumber = '';
let previousNumber = '';
let operator = '';
let result = '';

// Function to update the display screen
function updateDisplayScreen(number) {
    displayScreen.value = number;
}

// Function to handle number button clicks
function handleNumberButtonClick(event) {
    const number = event.target.value;
    currentNumber += number;
    updateDisplayScreen(currentNumber);
}

// Function to handle operator button clicks
function handleOperatorButtonClick(event) {
    const operatorValue = event.target.value;
    if (operatorValue === '=') {
        calculateResult();
    } else if (operatorValue === 'C') {
        clearCalculator();
    } else if (operatorValue === 'DEL') {
        deleteLastDigit();
    } else {
        operator = operatorValue;
        previousNumber = currentNumber;
        currentNumber = '';
    }
}

// Function to calculate the result
function calculateResult() {
    if (previousNumber !== '' && currentNumber !== '') {
        const num1 = parseFloat(previousNumber);
        const num2 = parseFloat(currentNumber);
        switch (operator) {
            case '+':
                result = num1 + num2;
                break;
            case '-':
                result = num1 - num2;
                break;
            case '*':
                result = num1 * num2;
                break;
            case '/':
                if (num2 !== 0) {
                    result = num1 / num2;
                } else {
                    result = 'Error: Division by zero';
                }
                break;
            default:
                result = '';
        }
        updateDisplayScreen(result.toString());
        previousNumber = '';
        currentNumber = '';
    }
}

// Function to clear the calculator
function clearCalculator() {
    currentNumber = '';
    previousNumber = '';
    operator = '';
    result = '';
    updateDisplayScreen('');
}

// Function to delete the last digit
function deleteLastDigit() {
    currentNumber = currentNumber.slice(0, -1);
    updateDisplayScreen(currentNumber);
}

// Add event listeners to the number buttons
const numberButtons = document.querySelectorAll('.keypad-button:not(.operator-button)');
numberButtons.forEach(button => button.addEventListener('click', handleNumberButtonClick));

// Add event listeners to the operator buttons
const operatorButtons = document.querySelectorAll('.operator-button');
operatorButtons.forEach(button => button.addEventListener('click', handleOperatorButtonClick));