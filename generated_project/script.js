// Get the display screen element
const displayScreen = document.getElementById('display-screen');

// Initialize variables to store the current calculation and result
let currentCalculation = '';
let result = '';

// Function to update the display screen
function updateDisplayScreen() {
    displayScreen.textContent = currentCalculation;
}

// Function to handle keypad button clicks
function handleKeypadButtonClick(event) {
    const buttonValue = event.target.textContent;
    if (buttonValue === 'C') {
        // Clear the current calculation and result
        currentCalculation = '';
        result = '';
        updateDisplayScreen();
    } else if (buttonValue === 'DEL') {
        // Remove the last character from the current calculation
        currentCalculation = currentCalculation.slice(0, -1);
        updateDisplayScreen();
    } else if (buttonValue === '=') {
        // Evaluate the current calculation and display the result
        try {
            result = eval(currentCalculation);
            displayScreen.textContent = result;
            currentCalculation = result.toString();
        } catch (error) {
            displayScreen.textContent = 'Error';
            currentCalculation = '';
        }
    } else {
        // Append the button value to the current calculation
        currentCalculation += buttonValue;
        updateDisplayScreen();
    }
}

// Add event listeners to the keypad buttons
const keypadButtons = document.querySelectorAll('.keypad-button');
keypadButtons.forEach(button => {
    button.addEventListener('click', handleKeypadButtonClick);
});

// Initialize the display screen
updateDisplayScreen();