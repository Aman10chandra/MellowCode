let displayScreen = document.getElementById('display-screen');
let currentNumber = '';
let previousNumber = '';
let currentOperation = '';
let result = '';

// Function to update the display screen
function updateDisplayScreen(number) {
    displayScreen.value = number;
}

// Function to handle number button clicks
function handleNumberButtonClick(number) {
    currentNumber += number;
    updateDisplayScreen(currentNumber);
}

// Function to handle operation button clicks
function handleOperationButtonClick(operation) {
    if (currentNumber !== '') {
        previousNumber = currentNumber;
        currentNumber = '';
        currentOperation = operation;
    }
}

// Function to handle equals button click
function handleEqualsButtonClick() {
    if (previousNumber !== '' && currentNumber !== '') {
        let num1 = parseFloat(previousNumber);
        let num2 = parseFloat(currentNumber);
        switch (currentOperation) {
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
                    result = 'Error. Division by zero.';
                }
                break;
            default:
                result = '';
        }
        updateDisplayScreen(result.toString());
        previousNumber = '';
        currentNumber = '';
        currentOperation = '';
    }
}

// Function to handle clear button click
function handleClearButtonClick() {
    currentNumber = '';
    previousNumber = '';
    currentOperation = '';
    result = '';
    updateDisplayScreen('');
}

// Function to handle delete button click
function handleDeleteButtonClick() {
    if (currentNumber !== '') {
        currentNumber = currentNumber.slice(0, -1);
        updateDisplayScreen(currentNumber);
    }
}

// Add event listeners to number buttons
document.getElementById('button-0').addEventListener('click', function() {
    handleNumberButtonClick('0');
});
document.getElementById('button-1').addEventListener('click', function() {
    handleNumberButtonClick('1');
});
document.getElementById('button-2').addEventListener('click', function() {
    handleNumberButtonClick('2');
});
document.getElementById('button-3').addEventListener('click', function() {
    handleNumberButtonClick('3');
});
document.getElementById('button-4').addEventListener('click', function() {
    handleNumberButtonClick('4');
});
document.getElementById('button-5').addEventListener('click', function() {
    handleNumberButtonClick('5');
});
document.getElementById('button-6').addEventListener('click', function() {
    handleNumberButtonClick('6');
});
document.getElementById('button-7').addEventListener('click', function() {
    handleNumberButtonClick('7');
});
document.getElementById('button-8').addEventListener('click', function() {
    handleNumberButtonClick('8');
});
document.getElementById('button-9').addEventListener('click', function() {
    handleNumberButtonClick('9');
});
document.getElementById('button-decimal').addEventListener('click', function() {
    if (!currentNumber.includes('.')) {
        handleNumberButtonClick('.');
    }
});

// Add event listeners to operation buttons
document.getElementById('button-add').addEventListener('click', function() {
    handleOperationButtonClick('+');
});
document.getElementById('button-subtract').addEventListener('click', function() {
    handleOperationButtonClick('-');
});
document.getElementById('button-multiply').addEventListener('click', function() {
    handleOperationButtonClick('*');
});
document.getElementById('button-divide').addEventListener('click', function() {
    handleOperationButtonClick('/');
});

// Add event listeners to equals, clear, and delete buttons
document.getElementById('button-equals').addEventListener('click', handleEqualsButtonClick);
document.getElementById('button-clear').addEventListener('click', handleClearButtonClick);
document.getElementById('button-delete').addEventListener('click', handleDeleteButtonClick);
