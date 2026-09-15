/* ============================================================
   CALCULATOR LOGIC
   ------------------------------------------------------------
   DISPLAY BEHAVIOUR (as requested):
   - WHILE TYPING: the bottom (big) line shows the whole running
     expression as you build it, e.g. typing 2, +, 2 shows "2+2"
     on the bottom line. The top line stays blank.
   - AFTER "=" IS PRESSED: that finished expression ("2+2") moves
     up to the small TOP line, and the bottom line switches to
     show ONLY the final answer (e.g. "4").
   ------------------------------------------------------------
   STATE VARIABLES (the calculator's "memory" between clicks):

   currentValue     -> the number currently being typed (just the
                        active operand, e.g. "2", not the whole "2+2")
   previousValue    -> the operand entered before an operator
                        was pressed (the first number in the sum)
   pendingOperator  -> the operator waiting to be applied (+ − × ÷)
   expressionText   -> the finished expression to show on the top
                        line, e.g. "2+2". Only set once, by evaluate().
   justEvaluated    -> true right after "=" was pressed. While true,
                        the screen shows the RESULT + expressionText.
                        The next digit typed starts a fresh number.
   waitingForOperand-> true right after an operator was pressed, so
                        the next digit REPLACES currentValue instead
                        of appending to it.
   hasError         -> true when we are showing an error message
                        (e.g. division by zero)
   ============================================================ */

let currentValue = "0";
let previousValue = null;
let pendingOperator = null;
let expressionText = "";
let justEvaluated = false;
let waitingForOperand = false;
let hasError = false;

const MAX_DIGITS = 12; // stop the display from overflowing

// Grab the two screen elements once, so we don't search the DOM every time
const currentEl = document.getElementById("current");
const expressionEl = document.getElementById("expression");


/* ------------------------------------------------------------
   buildRunningDisplay()
   Builds the text shown on the bottom line WHILE TYPING
   (before "=" is pressed), by joining the pieces entered so far:
     - just "2"        -> before any operator is pressed
     - "2+"             -> operator pressed, second number not
                           started yet
     - "2+2"            -> second number has been typed
   ------------------------------------------------------------ */
function buildRunningDisplay() {
  if (previousValue === null || pendingOperator === null) {
    return currentValue;
  }
  if (waitingForOperand) {
    return previousValue + pendingOperator; // e.g. "2+"
  }
  return previousValue + pendingOperator + currentValue; // e.g. "2+2"
}


/* ------------------------------------------------------------
   updateScreen()
   Redraws the display based on the current state variables.
   Called after every button press that changes something.
   ------------------------------------------------------------ */
function updateScreen() {
  if (hasError) {
    currentEl.textContent = currentValue;
    currentEl.classList.add("error");
    expressionEl.textContent = "\u00A0";
    document.querySelectorAll(".key-op").forEach(function (button) {
      button.classList.remove("active-op");
    });
    return;
  }

  currentEl.classList.remove("error");

  if (justEvaluated) {
    // Show the locked-in result on the bottom line, and the
    // finished expression ("2+2") on the top line.
    currentEl.textContent = currentValue;
    expressionEl.textContent = expressionText;
  } else {
    // Still typing: show the running expression on the bottom
    // line, and keep the top line blank.
    currentEl.textContent = buildRunningDisplay();
    expressionEl.textContent = "\u00A0";
  }

  // Highlight the operator button that is currently active
  document.querySelectorAll(".key-op").forEach(function (button) {
    const isActive = button.dataset.op === pendingOperator && !justEvaluated;
    button.classList.toggle("active-op", isActive);
  });
}


/* ------------------------------------------------------------
   resetAll()
   Clears the calculator back to its starting state.
   Used by the "C" button and after an error is dismissed.
   ------------------------------------------------------------ */
function resetAll() {
  currentValue = "0";
  previousValue = null;
  pendingOperator = null;
  expressionText = "";
  justEvaluated = false;
  waitingForOperand = false;
  hasError = false;
}


/* ------------------------------------------------------------
   inputDigit(digit)
   Called when a number button (0-9) is pressed.
   ------------------------------------------------------------ */
function inputDigit(digit) {
  if (hasError) {
    resetAll();
  }

  // If the user just pressed "=", typing a new digit should
  // start a brand new calculation instead of appending
  if (justEvaluated) {
    currentValue = digit;
    previousValue = null;
    pendingOperator = null;
    expressionText = "";
    justEvaluated = false;
    updateScreen();
    return;
  }

  // If an operator was just pressed, this digit starts the
  // SECOND number of the sum. Replace currentValue instead of
  // appending to it — buildRunningDisplay() will then show the
  // full running expression, e.g. "2+2".
  if (waitingForOperand) {
    currentValue = digit;
    waitingForOperand = false;
    updateScreen();
    return;
  }

  // Don't let the number grow forever
  const digitCount = currentValue.replace("-", "").replace(".", "").length;
  if (digitCount >= MAX_DIGITS) {
    return;
  }

  // Replace the leading "0" instead of showing "05"
  if (currentValue === "0") {
    currentValue = digit;
  } else {
    currentValue = currentValue + digit;
  }

  updateScreen();
}


/* ------------------------------------------------------------
   inputDecimal()
   Called when the "." button is pressed.
   ------------------------------------------------------------ */
function inputDecimal() {
  if (hasError) {
    resetAll();
  }

  if (justEvaluated) {
    currentValue = "0.";
    previousValue = null;
    pendingOperator = null;
    expressionText = "";
    justEvaluated = false;
    updateScreen();
    return;
  }

  if (waitingForOperand) {
    currentValue = "0.";
    waitingForOperand = false;
    updateScreen();
    return;
  }

  // Only add a decimal point if there isn't one already
  if (currentValue.indexOf(".") === -1) {
    currentValue = currentValue + ".";
    updateScreen();
  }
}


/* ------------------------------------------------------------
   backspace()
   Removes the last character of the number currently being typed.
   ------------------------------------------------------------ */
function backspace() {
  if (hasError) {
    resetAll();
    updateScreen();
    return;
  }

  if (justEvaluated || waitingForOperand) {
    return; // nothing to delete right after a result or an operator
  }

  const isSingleDigit = currentValue.length === 1;
  const isNegativeSingleDigit =
    currentValue.length === 2 && currentValue.startsWith("-");

  if (isSingleDigit || isNegativeSingleDigit) {
    currentValue = "0";
  } else {
    currentValue = currentValue.slice(0, -1);
  }

  updateScreen();
}


/* ------------------------------------------------------------
   applyPercent()
   Converts the current number into a percentage (divides by 100).
   ------------------------------------------------------------ */
function applyPercent() {
  if (hasError || waitingForOperand) {
    return;
  }
  const number = parseFloat(currentValue);
  currentValue = formatResult(number / 100);
  updateScreen();
}


/* ------------------------------------------------------------
   calculate(a, b, operator)
   Performs one arithmetic operation and returns the result.
   Returns null if the operation is invalid (divide by zero).
   ------------------------------------------------------------ */
function calculate(a, b, operator) {
  switch (operator) {
    case "+":
      return a + b;
    case "−":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      if (b === 0) {
        return null; // signal an error to the caller
      }
      return a / b;
    default:
      return b;
  }
}


/* ------------------------------------------------------------
   formatResult(number)
   Turns a raw JavaScript number into a clean display string:
   - removes floating point rounding noise (e.g. 0.1 + 0.2)
   ------------------------------------------------------------ */
function formatResult(number) {
  if (!isFinite(number)) {
    return "Error";
  }

  // Round to 8 decimal places to avoid results like 0.30000000000000004
  const rounded = Math.round(number * 1e8) / 1e8;

  return rounded.toString();
}


/* ------------------------------------------------------------
   chooseOperator(operator)
   Called when +, −, ×, or ÷ is pressed.
   ------------------------------------------------------------ */
function chooseOperator(operator) {
  if (hasError) {
    return;
  }

  const alreadyHasPendingSum =
    pendingOperator !== null && previousValue !== null && !waitingForOperand;

  if (alreadyHasPendingSum) {
    // Chain operations: e.g. user typed 5 + 3 and now presses ×
    // First finish "5 + 3", then get ready for the next operator.
    // (This is what allows 5 + 3 × 2 to work without pressing "=".)
    const result = calculate(
      parseFloat(previousValue),
      parseFloat(currentValue),
      pendingOperator
    );

    if (result === null) {
      showDivisionError();
      return;
    }

    previousValue = formatResult(result);
    currentValue = previousValue;
  } else {
    previousValue = currentValue;
  }

  pendingOperator = operator;
  justEvaluated = false;
  waitingForOperand = true; // next digit pressed should replace, not append
  updateScreen();
}


/* ------------------------------------------------------------
   showDivisionError()
   Displays an error instead of crashing when dividing by zero.
   ------------------------------------------------------------ */
function showDivisionError() {
  hasError = true;
  currentValue = "Cannot divide by 0";
  previousValue = null;
  pendingOperator = null;
  expressionText = "";
  justEvaluated = false;
  waitingForOperand = false;
  updateScreen();
}


/* ------------------------------------------------------------
   evaluate()
   Called when "=" is pressed.
   Locks in the typed expression (e.g. "2+2") onto the top line,
   and puts the final answer onto the bottom line.
   ------------------------------------------------------------ */
function evaluate() {
  if (hasError) {
    return;
  }
  if (pendingOperator === null || previousValue === null) {
    return; // nothing to calculate yet
  }

  const result = calculate(
    parseFloat(previousValue),
    parseFloat(currentValue),
    pendingOperator
  );

  if (result === null) {
    showDivisionError();
    return;
  }

  // Save the expression exactly as it was typed, e.g. "2+2",
  // BEFORE clearing the values it's built from.
  expressionText = previousValue + pendingOperator + currentValue;

  currentValue = formatResult(result);
  previousValue = null;
  pendingOperator = null;
  justEvaluated = true;
  waitingForOperand = false;
  updateScreen();
}


/* ============================================================
   EVENT LISTENERS
   ------------------------------------------------------------
   No inline onclick attributes are used in the HTML.
   Every button is wired up here using addEventListener,
   based on its data-action attribute.
   ============================================================ */
document.querySelectorAll("button").forEach(function (button) {
  button.addEventListener("click", function () {
    const action = button.dataset.action;

    switch (action) {
      case "digit":
        inputDigit(button.dataset.digit);
        break;
      case "decimal":
        inputDecimal();
        break;
      case "operator":
        chooseOperator(button.dataset.op);
        break;
      case "equals":
        evaluate();
        break;
      case "clear":
        resetAll();
        updateScreen();
        break;
      case "backspace":
        backspace();
        break;
      case "percent":
        applyPercent();
        break;
    }
  });
});


/* Optional: allow the physical keyboard to control the calculator too */
document.addEventListener("keydown", function (event) {
  if (event.key >= "0" && event.key <= "9") {
    inputDigit(event.key);
  } else if (event.key === ".") {
    inputDecimal();
  } else if (event.key === "+") {
    chooseOperator("+");
  } else if (event.key === "-") {
    chooseOperator("−");
  } else if (event.key === "*") {
    chooseOperator("×");
  } else if (event.key === "/") {
    event.preventDefault(); // stop the browser's quick-find from opening
    chooseOperator("÷");
  } else if (event.key === "Enter" || event.key === "=") {
    evaluate();
  } else if (event.key === "Backspace") {
    backspace();
  } else if (event.key === "Escape") {
    resetAll();
    updateScreen();
  }
});


// Draw the initial "0" on screen when the page first loads
updateScreen();
