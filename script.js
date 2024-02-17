// Declare global variables at the beginning
let totalavailableColors = ["red", "orange", "yellow", "purple", "green", "blue", "maroon","black"]; // Exclude "black" initially
let availableColors = ["red", "orange", "yellow", "purple", "green", "blue", "maroon","black"]; // Exclude "black" initially
let pottedColors = [];
let isGameActive = true;    
let shotCount = 0;
let turnCount = 0; // Initialize shot counter
let ballChoice = ""; // Add this at the beginning with your other global variables
let userPottedColors = [];
document.addEventListener('DOMContentLoaded', function() {
    // Check if the browser supports SpeechRecognition
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
    if (typeof SpeechRecognition !== "undefined") {
        const recognition = new SpeechRecognition();
        recognition.continuous = true; // Keep listening even after getting a result
        recognition.lang = "en-US"; // Set the language
        recognition.interimResults = false; // We only want final results
        
        recognition.onresult = function(event) {
            // Loop through the results of the speech recognition
            for (const res of event.results) {
                const text = res[0].transcript.trim(); // Get the text
                console.log("Heard:", text); // Debug: See what was heard
                
                if (text.toLowerCase() === "your turn") { // Check if the user said "your turn"
                    takeShot(); // Trigger the Take Shot function
                
                    
                }
                if (text.toLowerCase() === "I won") { // Check if the user said "your turn"
                    userwon(); // Trigger the Take Shot function
                   
                    
                }
            }
        };

        recognition.start(); // Start listening
        
    } else {
        console.log("SpeechRecognition is not supported in this browser.");
    }

 
});

document.getElementById('winButton').addEventListener('click', function() {
    userwon()
    

});

 function userwon(){
    for (let i = 0; i < 100; i++) { // Generate 100 confetti pieces
        var confetti = document.createElement('div');
        confetti.className = 'confetti ' + ['red', 'blue', 'green', 'yellow'][Math.floor(Math.random() * 4)]; // Random color
        confetti.style.left = Math.random() * window.innerWidth + 'px'; // Random starting position
        confetti.style.top = '-10px'; // Start above the screen
        document.body.appendChild(confetti);
        
        // Animate confetti
        (function(confetti) {
            var x = Math.random() * 1000 - 500; // Random x translation
            var rotation = Math.random() * 360; // Random rotation
            var delay = Math.random() * 2000; // Random animation delay
            var duration = 3000 + Math.random() * 3000; // Random animation duration
            
            confetti.style.transition = `transform ${duration}ms ease-out, opacity ${duration * 0.8}ms`;
            confetti.style.opacity = 0;
            setTimeout(function() {
                confetti.style.transform = `translate(${x}px, 100vh) rotate(${rotation}deg)`; // Fall down
                confetti.style.opacity = 1;
                // Remove confetti after animation
                setTimeout(function() {
                    confetti.remove();
                }, duration);
            }, delay);
        })(confetti);
    }
    isGameActive = false; 
    document.getElementById('winButton').style.display = 'none';
    document.getElementById('takeShot').style.display = 'none';
}
// Ensure the DOM is fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('newGame').addEventListener('click', newGame);
    // Ensure the takeShot function is correctly bound to the button in your HTML
    // For example, if your take shot button has an id="takeShot", you can add an event listener here as well
    document.getElementById('takeShot').addEventListener('click', takeShot);
});

function takeShot() {
    takeaShot()
    taketurn()
    if (!isGameActive) return;

    const difficulty = document.getElementById('difficulty').value;
    let singleBallPottedChance;
    let nextBallPottedChance;

    switch (difficulty) {
        case 'easy':
            singleBallPottedChance = 30;
            nextBallPottedChance = 10;
            break;
        case 'medium':
            singleBallPottedChance = 40;
            nextBallPottedChance = 15;
            break;
        case 'medium-hard':
            singleBallPottedChance = 50;
            nextBallPottedChance = 25;
            break;
        case 'hard':
            singleBallPottedChance = 60;
            nextBallPottedChance = 35;
            break;
    }

    let outcome = calculateOutcome(singleBallPottedChance,nextBallPottedChance);
    document.getElementById('result').innerHTML = `Outcome: ${outcome}`;
    placeWhiteBall();
    updatePottedBallsDisplay();
    checkGameEndCondition();
    moveBalls(); // Call this function to slightly adjust ball positions
}
function moveBalls() {
    const balls = document.querySelectorAll('.ball:not(.potted)'); // Select all balls that haven't been potted
    balls.forEach(ball => {
        const deltaX = (Math.random() - 0.7) * 10; // Adjust for a small random movement, -5 to 5 pixels
        const deltaY = (Math.random() - 0.8) * 10;
        ball.style.left = `${ball.offsetLeft + deltaX}px`;
        ball.style.top = `${ball.offsetTop + deltaY}px`;
    });
}
function calculateOutcome(singleBallChance, nextBallPottedChance) {
    let result = Math.random() * 100;
    let outcomeHTML = 'None';

    // Check if it's time to pot the black ball
    if (availableColors.length === 0 && !pottedColors.includes("black")) { // Adjusted condition
        if (result <= singleBallChance) {
            pottedColors.push("black");
            outcomeHTML = "Black ball potted. You Loose!";
            document.getElementById('takeShot').style.display = 'none';
            isGameActive = false;
            document.getElementById('winButton').style.display = 'none';
            // No need to hide the black ball specifically, as game ends here
        }
    } else {
        // Handle potting other balls
        if (availableColors.length > 0 && result <= singleBallChance) {
            let colorIndex = Math.floor(Math.random() * availableColors.length);
            let pottedColor = availableColors.splice(colorIndex, 1)[0];
            pottedColors.push(pottedColor);
            hidePottedBall(pottedColor)
            outcomeHTML = `${formatBallColor(pottedColor)} ball potted by computer`;

            // Additional chances to pot more balls
            for (let i = 0; i < 2; i++) {
                if (availableColors.length > 0 && Math.random() * 100 <= nextBallPottedChance) {
                    colorIndex = Math.floor(Math.random() * availableColors.length);
                    pottedColor = availableColors.splice(colorIndex, 1)[0];
                    pottedColors.push(pottedColor);
                    hidePottedBall(pottedColor) // Hide the potted ball
                    outcomeHTML += `, ${formatBallColor(pottedColor)} ball potted`;
                }
            }
        }
    }

    return outcomeHTML;
}

document.addEventListener('DOMContentLoaded', function() {
    // Listen for click events on the 'Start Tracking' button
    document.getElementById('startTrackingBtn').addEventListener('click', function() {
        startCamera();
        this.disabled = true; // Optional: Disable the button after starting the camera
    });
});

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.getElementById('cameraFeed');
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            video.play();
            video.width = video.videoWidth;
            video.height = video.videoHeight;
            document.getElementById('overlay').setAttribute('width', video.videoWidth);
            document.getElementById('overlay').setAttribute('height', video.videoHeight);
            trackBalls(); // Start tracking
        };
    } catch (error) {
        console.error("Error accessing the camera:", error);
    }
}

function trackBalls() {
    const video = document.getElementById('cameraFeed');
    const canvas = document.getElementById('overlay');
    const context = canvas.getContext('2d');

    // Placeholder for tracking logic
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // TODO: Implement ball tracking logic here

    requestAnimationFrame(trackBalls); // Keep updating the canvas
}

function hidePottedBall(pottedColor) {
    // Determine the selector based on the player's choice of ball type (solid or striped)
    let selector;
    if (ballChoice === 'small') {
        // If player chose small (solid), hide a solid ball of the potted color
       

        selector = `.${pottedColor}.striped:not([style*="display: none"])`;
    } else if (ballChoice === 'big') {
        // If player chose big (striped), hide a striped ball of the potted color
         selector = `.${pottedColor}:not(.striped):not([style*="display: none"])`;
    } else {
        // Fallback if no ballChoice is made or does not match expected values
        selector = `.${pottedColor}:not([style*="display: none"])`;
    }

    // Find the ball of the specified color and type (if specified) that is not yet hidden
    const ballOfColorAndType = document.querySelector(selector);

    // Hide the first one if it exists
    if (ballOfColorAndType) {
        ballOfColorAndType.style.display = 'none';
    }
}


function takeaShot() {
    if (!isGameActive) return; // Existing condition check

    shotCount++; // Increment shot count
    document.getElementById('shotCounter').textContent = `Shots taken: ${shotCount}`; // Update display

    // Your existing shot logic...
}
function taketurn() {
    if (!isGameActive) return; // Existing condition check

    turnCount++; // Increment shot count
    document.getElementById('turnCounter').textContent = `turns taken: ${turnCount}`; // Update display

    // Your existing shot logic...
}
function updatePottedBallsDisplay() {
    const container = document.getElementById('pottedBalls');
    container.innerHTML = ''; // Clear previous balls
    pottedColors.forEach(color => {
        const ball = document.createElement('div');
        ball.className = 'potted-ball ' + color;
        // Apply striped or solid class based on player's choice
        if (ballChoice === 'small') {
            // Assuming 'small' balls should be solid and 'big' should be striped
            ball.classList.add('striped');
        } else if (ballChoice === 'big') {
           
            ball.classList.add('solid');
        }
        container.appendChild(ball);
    });
}

function checkGameEndCondition() {
    if (pottedColors.length === availableColors.length) {
        document.getElementById('result').innerHTML = '<strong>You Lose</strong>';
        isGameActive = false;
    }
}

function newGame() {
    isGameActive = true;
    pottedColors = [];

    document.getElementById('result').innerHTML = '';
    document.getElementById('pottedBalls').innerHTML = ''; // Clear displayed balls
    document.getElementById('selectedPottedBalls').innerHTML = ''; // Clear displayed balls
    availableColors = ["red", "orange", "yellow", "purple", "green", "blue", "maroon",];

    document.getElementById('result').innerHTML = 'Your break!';
    document.getElementById('ballChoice').style.display = 'block'; // Show the choice buttons
  
    document.querySelectorAll('.ball').forEach(ball => {
        ball.style.display = 'block'; // Make all balls visible again
    });
    const whiteBall = document.getElementById('whiteBall');
    whiteBall.style.left = 200+"px";
    whiteBall.style.top = 200+"px";
    createAndArrangeBalls()
    shotCount = 0; // Initialize shot counter
    turnCount = 0;

}


function formatBallColor(color) {
    return color.charAt(0).toUpperCase() + color.slice(1);
}

function placeWhiteBall() {
    const poolTable = document.getElementById('poolTable');
    const whiteBall = document.getElementById('whiteBall');

    let maxX = poolTable.clientWidth - whiteBall.offsetWidth;
    let maxY = poolTable.clientHeight - whiteBall.offsetHeight;

    let xPosition = Math.floor(Math.random() * maxX);
    let yPosition = Math.floor(Math.random() * maxY);

    whiteBall.style.left = xPosition + 'px';
    whiteBall.style.top = yPosition + 'px';
}
function potChoice(choice) {
    document.getElementById('result').innerHTML = `You are shooting for ${choice} balls!`; // Update message to reflect choice
    document.getElementById('ballChoice').style.display = 'none'; // Hide the choice buttons
    document.getElementById('takeShot').style.display = 'block';
    document.getElementById('winButton').style.display = 'block';
   
    ballChoice = choice; // Store the player's choice
    takeaShot()
    taketurn()
    

    // No need to immediately change the appearance of the balls on the table here,
    // as your requirement is to change the appearance in the potted menu.
}
function checkWinCondition(clickedBallColor) {
    if (clickedBallColor !== 'black') {
        return;
    }

    // Check if all non-black balls are potted by the user
    const isEveryOtherBallPottedByUser = totalavailableColors.filter(color => color !== 'black').every(color => userPottedColors.includes(color));
    
    if (isEveryOtherBallPottedByUser) {
        userwon(); // Trigger the win condition
    } else {
        console.log("You cannot pot the black ball yet.");
    }
}


function createAndArrangeBalls() {
    const poolTable = document.getElementById('poolTable');
    const existingBalls = poolTable.querySelectorAll('.ball');
    const ballColors = ["red", "orange", "yellow", "purple", "green", "blue", "maroon"]; // Exclude black from initial colors

    if (existingBalls.length === 0) {
        // Prepare ball colors and types
        let ballDescriptors = [];

        // Add one of each color as solid
        ballColors.forEach(color => ballDescriptors.push({ color, striped: false }));

        // Add one black ball as solid
        ballDescriptors.push({ color: "black", striped: false });

        // Fill the rest as striped balls by duplicating the first 7 colors
        ballColors.forEach(color => ballDescriptors.push({ color, striped: true }));

        // Shuffle the ballDescriptors array to randomize the ball arrangement
        ballDescriptors.sort(() => Math.random() - 0.5);

        const rows = 5; // Total rows in the triangle
        let xPosStart = 550; // Starting X position for the first row
        let ballIndex = 0;

        for (let row = 1; row <= rows; row++) {
            let yPos = (400 - (row * 25 + (row - 1) * 10)) / 2;

            for (let count = 0; count < row; count++) {
                const { color, striped } = ballDescriptors[ballIndex];
                const ball = document.createElement('div');
                ball.className = `ball ${color}` + (striped ? ' striped' : '');
                ball.setAttribute('data-color', color); // Setting data attribute for color identification
                ball.id = `${color}Ball-${ballIndex + 1}`;
                ball.style.left = `${xPosStart}px`;
                ball.style.top = `${yPos}px`;
                ball.addEventListener('click', function() {
                    moveBallToSelectedPottedArea(ball);
                    let clickedBallColor = ball.getAttribute('data-color'); // Get the color of the clicked ball
                    checkWinCondition(clickedBallColor); // Pass this color to the function
                });
                poolTable.appendChild(ball);

                yPos += 35;
                ballIndex++;
            }
            xPosStart += 35;
        }
    } else {
        // Reset positions and visibility for existing balls
        resetBallPositionsAndVisibility();
    }
}


function resetBallPositionsAndVisibility() {
    const poolTable = document.getElementById('poolTable');
    const balls = poolTable.querySelectorAll('.ball');
    if (balls.length < 15) { // Check if the number of balls is less than expected for a 5-row triangle
        console.error("Unexpected number of balls. Expected at least 15 for a 5-row triangle.");
        return; // Exit the function to avoid further errors
    }

    let xPosStart = 550; // Initial X position for the triangle's point on the left
    const rows = 5; // Total rows in the triangle
    let ballCounter = 0; // Keep track of the number of balls positioned

    for (let row = 1; row <= rows; row++) {
        let yPos = (400 - (row * 25 + (row - 1) * 10)) / 2; // Adjust yPos calculation for vertical centering

        for (let count = 0; count < row; count++) {
            // Use ballCounter to access the ball from the NodeList
            if (ballCounter < balls.length) {
                const ball = balls[ballCounter++];
                ball.style.left = `${xPosStart}px`;
                ball.style.top = `${yPos}px`;
                ball.style.display = 'block'; // Make the ball visible
                yPos += 35; // Move down for the next ball in the row
            }
        }
        xPosStart += 35; // Move to the right for the start of the next row
    }
}

function moveBallToSelectedPottedArea(ball) {
    const colorClass = ball.className.split(' ').find(cls => totalavailableColors.includes(cls.replace('striped', '').trim()));
    const isStriped = ball.classList.contains('striped');

    // Add the potted ball's color to userPottedColors
    userPottedColors.push(colorClass); // Update this line to track user-potted balls

    const selectedPottedBall = document.createElement('div');
    selectedPottedBall.className = `potted-ball ${colorClass} ${isStriped ? 'striped' : ''}`;
    document.getElementById('selectedPottedBalls').appendChild(selectedPottedBall);
    ball.style.display = 'none'; // Hide the original ball

}



