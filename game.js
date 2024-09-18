// Setup the canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Variables
let slingshot = {
    x: 150,
    y: canvas.height - 150, // Position of the slingshot
    forkWidth: 30,
    forkHeight: 100, // Fork length of the slingshot
    bandLength: 100,
    isDragging: false,
    angle: 0,
    force: 0,
};

let projectile = {
    x: slingshot.x,
    y: slingshot.y,
    radius: 15, // Larger projectile for better visibility
    velocityX: 0,
    velocityY: 0,
    isFlying: false,
    depth: 1 // Depth for 3D scaling
};

let target = {
    x: getRandomInt(canvas.width / 2, canvas.width - 50),
    y: getRandomInt(100, canvas.height - 150),
    radius: 30,
    hit: false,
    depth: 1 // Target depth
};

let successCount = 0;
const gravity = 0.5;
const airResistance = 0.99;
const groundFriction = 0.8; // Friction on the ground

// Time limit (in seconds)
const timeLimit = 30; // 30 seconds
let timeLeft = timeLimit;
let gameOver = false;

// Mouse Position
let mousePos = { x: 0, y: 0 };

// Functions to handle user input
canvas.addEventListener('mousedown', (e) => {
    const dist = Math.hypot(e.offsetX - slingshot.x, e.offsetY - slingshot.y);
    if (dist <= slingshot.forkWidth) {
        slingshot.isDragging = true;
        projectile.isFlying = false; // Reset projectile
        projectile.x = slingshot.x;
        projectile.y = slingshot.y;
        projectile.velocityX = 0;
        projectile.velocityY = 0;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (slingshot.isDragging && !gameOver) {
        mousePos = { x: e.offsetX, y: e.offsetY };
        const dx = mousePos.x - slingshot.x;
        const dy = mousePos.y - slingshot.y;
        const distance = Math.min(120, Math.hypot(dx, dy)); // Limit pullback distance
        slingshot.angle = Math.atan2(dy, dx);
        slingshot.force = distance; // Force determined by how far the band is pulled
    }
});

canvas.addEventListener('mouseup', () => {
    if (slingshot.isDragging && !gameOver) {
        slingshot.isDragging = false;
        projectile.isFlying = true;
        const launchPower = 0.3; // Adjust the launch power
        projectile.velocityX = slingshot.force * Math.cos(slingshot.angle) * -launchPower;
        projectile.velocityY = slingshot.force * Math.sin(slingshot.angle) * -launchPower;
    }
});

// Helper function to generate a random integer between min and max
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

// Timer to count down from 30 seconds
function startTimer() {
    const timer = setInterval(() => {
        if (!gameOver) {
            timeLeft--;
            if (timeLeft <= 0) {
                gameOver = true;
                clearInterval(timer);
                alert(`Game Over! Hits: ${successCount}`);
            }
        }
    }, 1000);
}

// Game Loop
function update() {
    if (projectile.isFlying && !gameOver) {
        // Apply gravity
        projectile.velocityY += gravity;

        // Apply air resistance
        projectile.velocityX *= airResistance;
        projectile.velocityY *= airResistance;

        // Update projectile position
        projectile.x += projectile.velocityX;
        projectile.y += projectile.velocityY;

        // Ground collision
        if (projectile.y + projectile.radius > canvas.height) {
            projectile.y = canvas.height - projectile.radius;
            projectile.velocityY *= -0.6; // Bounce effect
            projectile.velocityX *= groundFriction; // Horizontal friction
        }

        // Wall collisions
        if (projectile.x + projectile.radius > canvas.width || projectile.x - projectile.radius < 0) {
            projectile.velocityX *= -0.6; // Bounce off the walls
        }

        // Check if the projectile hits the target
        const distToTarget = Math.hypot(projectile.x - target.x, projectile.y - target.y);
        if (distToTarget <= projectile.radius + target.radius && !target.hit) {
            target.hit = true; // Mark target as hit
            successCount++;    // Increase the success count
            resetTarget();     // Move the target to a new position
        }
    }
}

// Reset target after it is hit
function resetTarget() {
    target.x = getRandomInt(canvas.width / 2, canvas.width - 50);
    target.y = getRandomInt(100, canvas.height - 150);
    target.hit = false;
}

// Drawing Functions
function drawSlingshot() {
    // Draw slingshot base (forked wooden shape with 3D shading)
    ctx.beginPath();

    // Left fork (with 3D perspective)
    ctx.moveTo(slingshot.x - slingshot.forkWidth, slingshot.y + slingshot.forkHeight); // Bottom left
    ctx.lineTo(slingshot.x - 10, slingshot.y); // Left top (smaller for 3D effect)

    // Right fork (with 3D perspective)
    ctx.moveTo(slingshot.x + 10, slingshot.y); // Right top (smaller for 3D effect)
    ctx.lineTo(slingshot.x + slingshot.forkWidth, slingshot.y + slingshot.forkHeight); // Bottom right

    ctx.lineWidth = 6;
    ctx.strokeStyle = 'brown'; // Wooden fork color with light shading
    ctx.stroke();
    ctx.closePath();

    // Draw the elastic band (corrected orientation)
    if (slingshot.isDragging) {
        ctx.beginPath();
        // Draw bands with depth
        ctx.moveTo(slingshot.x - 10, slingshot.y); // Left band at top of fork
        ctx.lineTo(mousePos.x, mousePos.y);        // Connect band to the pulled mouse position
        ctx.moveTo(slingshot.x + 10, slingshot.y); // Right band at top of fork
        ctx.lineTo(mousePos.x, mousePos.y);        // Connect band to the pulled mouse position
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'black'; // Elastic band color
        ctx.stroke();
        ctx.closePath();
    }
}

// 3D Effect on projectile (larger if closer to the screen)
function drawProjectile() {
    const scale = 1 / projectile.depth;
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, projectile.radius * scale, 0, Math.PI * 2);
    ctx.fillStyle = 'darkgray';
    ctx.fill();
    ctx.closePath();
}

// 3D Effect on target (scale down to simulate depth)
function drawTarget() {
    const scale = 1 / target.depth;
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius * scale, 0, Math.PI * 2);
    ctx.fillStyle = target.hit ? 'green' : 'red'; // Change color when hit
    ctx.fill();
    ctx.closePath();
}

// Main render loop
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawSlingshot();
    drawProjectile();
    drawTarget();

    update();

    // Display success count and timer
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Hits: ${successCount}`, 20, 30);
    ctx.fillText(`Time Left: ${timeLeft}s`, 20, 60);

    if (!gameOver) {
        requestAnimationFrame(render);
    }
}

// Start the game loop and timer
startTimer();
render();
