from utils import add, subtract, multiply, divide

class Calculator:
    def __init__(self):
        pass

    def add(self, num1, num2):
        try:
            num1 = float(num1)
            num2 = float(num2)
            return add(num1, num2)
        except ValueError:
            return "Invalid input. Please enter a number."

    def subtract(self, num1, num2):
        try:
            num1 = float(num1)
            num2 = float(num2)
            return subtract(num1, num2)
        except ValueError:
            return "Invalid input. Please enter a number."

    def multiply(self, num1, num2):
        try:
            num1 = float(num1)
            num2 = float(num2)
            return multiply(num1, num2)
        except ValueError:
            return "Invalid input. Please enter a number."

    def divide(self, num1, num2):
        try:
            num1 = float(num1)
            num2 = float(num2)
            if num2 == 0:
                return "Error. Division by zero."
            return divide(num1, num2)
        except ValueError:
            return "Invalid input. Please enter a number."
