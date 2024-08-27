// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Variables
let player = { x: 400, y: 500, width: 20, height: 20, color: 'red', bullets: [], score: 0, lives: 5, hitboxRadius: 3, speedMultiplier: 1, bulletCount: 1, lifeStock: 0 };
let enemies = [];
let enemyBullets = [];
let powerUps = [];
let boss = null;
let secondaryBosses = [];
let keys = {};
let gameInterval;
let bgm = document.getElementById('bgm');
let gunSound = document.getElementById('gunSound');
let bossBgm = new Audio('ice_boss_bgm.mp3');
let bossBgm2 = new Audio('ice_boss_bgm_2.mp3');
let skipToBoss = false;
let bossMode = false;
let bossShootInterval;
let yellowEnemyBulletInterval;
let bossDiamondBulletInterval;
let secondaryBossInterval;
let secondaryBossSlowAreaInterval;
let secondaryBossBulletInterval;
let secondaryBossTimeStopInterval;
let points = 0;
let stopTime = false;
let stopTimeStart = 0;
let whiteScreenStart = 0;
let fogOpacity = 0;
let secondPhase = false;
let secondaryBossHealth = 0;
let secondaryBossTimeStop = false;
let secondaryBossTimeStopStart = 0;
let generatedBullets = false;
let bossSpawned = false; // ボスが出現したかどうかのフラグ

// Background image setup
const bgImage = new Image();
bgImage.src = 'otamesi.png';
let bgScrollY = 0;

// Start background music
document.addEventListener('DOMContentLoaded', (event) => {
    bgm.play().catch(error => {
        console.error("BGM playback error: ", error);
        bgm.addEventListener('click', () => {
            bgm.play();
        }, { once: true });
    });
    gunSound.volume = 0.15; // 音量を半分に設定
});

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    // Check for I, O, P keys pressed simultaneously
    if (keys['i'] && keys['o'] && keys['p']) {
        player.score += 95000;
        if (player.score >= 100000 && !bossMode && !bossSpawned) {
            initiateTimeStop();
        }
    }

    // Check for J, K keys pressed simultaneously
    if (keys['j'] && keys['k']) {
        for (let i = 0; i < 40; i++) {
            const isPink = true;
            powerUps.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, color: isPink ? 'pink' : 'white', dy: 2, isPink });
        }
    }

    // Check for T, Y, U keys pressed simultaneously
    if (keys['t'] && keys['y'] && keys['u']) {
        for (let i = 0; i < 200; i++) {
            const isPink = false;
            powerUps.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, color: isPink ? 'pink' : 'white', dy: 2, isPink });
        }
    }
});

document.addEventListener('keyup', (e) => keys[e.key] = false);

// Player movement
function movePlayer() {
    if (keys['w'] && player.y > 0) player.y -= 5;
    if (keys['a'] && player.x > 0) player.x -= 5;
    if (keys['s'] && player.y < canvas.height - player.height) player.y += 5;
    if (keys['d'] && player.x < canvas.width - player.width) player.x += 5;
}

// Bullet movement
function moveBullets() {
    player.bullets.forEach((bullet, index) => {
        bullet.y -= 2 * player.speedMultiplier;
        if (bullet.y < 0) player.bullets.splice(index, 1);
    });
    enemyBullets.forEach((bullet, index) => {
        if (bullet.dx !== undefined && bullet.dy !== undefined) {
            bullet.x += bullet.dx;
            bullet.y += bullet.dy;
        } else {
            bullet.y += 1; // Increase enemy bullet speed
        }
        if (bullet.y > canvas.height || bullet.x < 0 || bullet.x > canvas.width) enemyBullets.splice(index, 1);
    });
}

// Enemy generation and movement
function generateEnemies() {
    if (enemies.length < 12 && !bossMode) {
        const x = Math.random() * (canvas.width - 20);
        const type = Math.floor(Math.random() * 4);
        let color, health, speed, behavior;

        switch (type) {
            case 0:
                color = 'green';
                health = 3;
                speed = 2;
                behavior = 'normal';
                break;
            case 1:
                color = 'blue';
                health = 1;
                speed = 4;
                behavior = 'fast';
                break;
            case 2:
                color = 'yellow';
                health = 1;
                speed = 2;
                behavior = 'random';
                break;
            case 3:
                color = 'purple';
                health = 1;
                speed = 2;
                behavior = 'shooter';
                break;
        }

        enemies.push({ x, y: 50, width: 20, height: 20, color, health, speed, behavior, direction: 1 });
    }
}

function moveEnemies() {
    enemies.forEach((enemy, index) => {
        if (enemy.behavior === 'random') {
            enemy.x += (Math.random() - 0.5) * enemy.speed;
        } else {
            enemy.x += enemy.speed * enemy.direction;
        }
        
        // Reverse direction if enemy hits the edge of the canvas
        if (enemy.x <= 0 || enemy.x >= canvas.width - enemy.width) {
            enemy.direction *= -1;
        }

        // Enemies shoot bullets less frequently
        if (Math.random() < 0.01) { // 発射頻度を減らす
            enemyBullets.push({ x: enemy.x + enemy.width / 2, y: enemy.y + enemy.height, radius: 10, color: enemy.color });
        }
        
        // Yellow enemy special attack
        if (enemy.behavior === 'random' && Math.random() < 0.005) { // 発射頻度をさらに減らす
            enemyBullets.push({ x: player.x + player.width / 2, y: player.y - 200, radius: 10, color: 'yellow' });
        }
    });
}

// Collision detection
function detectCollisions() {
    // Player bullets and enemies
    player.bullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                enemy.health -= 1;
                player.bullets.splice(bIndex, 1);
                if (enemy.health <= 0) {
                    enemies.splice(eIndex, 1);
                    player.score += 1000;
                    const isPink = Math.random() < 0.05;
                    powerUps.push({ x: enemy.x, y: enemy.y, color: isPink ? 'pink' : 'white', dy: 2, isPink });
                }
            }
        });
    });

    // Player and enemies
    enemies.forEach((enemy, index) => {
        const dx = (player.x + player.width / 2) - (enemy.x + enemy.width / 2);
        const dy = (player.y + player.height / 2) - (enemy.y + enemy.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < player.hitboxRadius + Math.min(enemy.width, enemy.height) / 2) {
            player.lives -= 1;
            enemies.splice(index, 1);
        }
    });

    // Player bullets and enemy bullets
    player.bullets.forEach((pBullet, pIndex) => {
        enemyBullets.forEach((eBullet, eIndex) => {
            const dx = pBullet.x - eBullet.x;
            const dy = pBullet.y - eBullet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < pBullet.width / 2 + eBullet.radius) {
                player.bullets.splice(pIndex, 1);
                enemyBullets.splice(eIndex, 1);
            }
        });
    });

    // Player and enemy bullets
    enemyBullets.forEach((bullet, index) => {
        const dx = bullet.x - (player.x + player.width / 2);
        const dy = bullet.y - (player.y + player.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < bullet.radius + player.hitboxRadius) {
            player.lives -= bullet.unbreakable ? 1.5 : 1;
            enemyBullets.splice(index, 1);
        }
    });

    // Player and slow areas
    enemyBullets.forEach((bullet, index) => {
        if (bullet.slowArea) {
            const dx = bullet.x - (player.x + player.width / 2);
            const dy = bullet.y - (player.y + player.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < bullet.radius + player.hitboxRadius) {
                player.speedMultiplier = 0.2; // スピードを-80%
                setTimeout(() => {
                    player.speedMultiplier = 1; // 2秒後に元に戻す
                }, 2000);
                enemyBullets.splice(index, 1); // スローエリアを消去
            }
        }
    });

    // Player bullets and boss
    if (boss) {
        player.bullets.forEach((bullet, bIndex) => {
            if (bullet.x < boss.x + boss.width &&
                bullet.x + bullet.width > boss.x &&
                bullet.y < boss.y + boss.height &&
                bullet.y + bullet.height > boss.y) {
                boss.health -= 1;
                player.bullets.splice(bIndex, 1);
                if (boss.health <= 0) {
                    for (let i = 0; i < 50; i++) {
                        const isPink = Math.random() < 0.05;
                        powerUps.push({ x: boss.x + Math.random() * boss.width, y: boss.y + Math.random() * boss.height, color: isPink ? 'pink' : 'white', dy: 2, isPink });
                    }
                    if (!secondPhase) {
                        initiateSecondPhase();
                    } else {
                        secondaryBosses = [];
                        secondPhase = false;
                        clearInterval(bossShootInterval);
                        clearInterval(bossDiamondBulletInterval);
                        clearInterval(secondaryBossInterval);
                        clearInterval(secondaryBossSlowAreaInterval);
                        clearInterval(secondaryBossBulletInterval);
                        clearInterval(secondaryBossTimeStopInterval);
                        bgm.play(); // 通常BGMに戻す
                        bossSpawned = false; // ボス出現フラグをリセット
                    }
                }
                updateBossHealthBar(boss.health / 60); // Update boss health bar
            }
        });
    }

    // Player bullets and secondary bosses
    if (secondPhase) {
        player.bullets.forEach((bullet, bIndex) => {
            secondaryBosses.forEach((secondaryBoss, sIndex) => {
                if (bullet.x < secondaryBoss.x + secondaryBoss.width &&
                    bullet.x + bullet.width > secondaryBoss.x &&
                    bullet.y < secondaryBoss.y + secondaryBoss.height &&
                    bullet.y + bullet.height > secondaryBoss.y) {
                    secondaryBoss.health -= 1;
                    player.bullets.splice(bIndex, 1);
                    if (secondaryBoss.health <= 0) {
                        secondaryBosses.splice(sIndex, 1);
                        secondaryBossHealth -= 45; // Reduce combined health by 45
                        if (secondaryBosses.length === 0) {
                            initiateThirdPhase();
                        }
                    }
                    updateSecondBossHealthBar(secondaryBossHealth / 135); // Update secondary boss health bar
                }
            });
        });
    }
}

// Power-up collection
function collectPowerUps() {
    powerUps.forEach((powerUp, index) => {
        powerUp.y += powerUp.dy; // Move power-up downwards
        const dx = powerUp.x - (player.x + player.width / 2);
        const dy = powerUp.y - (player.y + player.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 15 || (distance < 100 && Math.abs(dx) < 30 && Math.abs(dy) < 30)) {
            powerUp.x -= dx * 0.1;
            powerUp.y -= dy * 0.1;
        }

        if (distance < 15) {
            powerUps.splice(index, 1);
            if (powerUp.isPink) {
                if (player.lives < 5) {
                    player.lives++;
                } else if (player.lifeStock < 3) {
                    player.lifeStock++;
                }
            } else {
                points++;
                if (points >= 10) {
                    points = 0;
                    const rand = Math.random();
                    if (rand < 0.7) {
                        player.speedMultiplier = Math.min(player.speedMultiplier * 1.2, 5); // 最大500%
                        displayPowerUpInfo('Speed Up!'); // Show Speed Up message
                    } else {
                        player.bulletCount = Math.min(player.bulletCount + 1, 4); // 最大4発
                        displayPowerUpInfo('Bullet Count Up!'); // Show Bullet Count Up message
                    }
                }
                drawPowerUpPoints(); // Update the points display
            }
        }
    });
}

// Draw lives as pink circles
function drawLives() {
    const livesContainer = document.getElementById('lives');
    livesContainer.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        if (i >= player.lives) heart.classList.add('lost');
        livesContainer.appendChild(heart);
    }
}

// Draw power-up points as yellow circles
function drawPowerUpPoints() {
    const pointsContainer = document.getElementById('points');
    pointsContainer.innerHTML = '';
    for (let i = 0; i < 10; i++) {
        const point = document.createElement('div');
        point.classList.add('point');
        if (i < points) point.classList.add('active');
        pointsContainer.appendChild(point);
    }
}

// Display power-up information
function displayPowerUpInfo(message) {
    const infoContainer = document.getElementById('power-up-info');
    infoContainer.innerText = message;
    infoContainer.style.opacity = 1;
    setTimeout(() => {
        infoContainer.style.opacity = 0;
    }, 2000);
}

// Draw power-ups
function drawPowerUps() {
    powerUps.forEach(powerUp => {
        ctx.fillStyle = powerUp.color;
        ctx.fillRect(powerUp.x, powerUp.y, 10, 10);
    });
}

// Boss generation
function generateBoss() {
    boss = { x: 350, y: 50, width: 100, height: 100, color: 'cyan', health: 60, direction: 1, shootCooldown: 0 };
    bossMode = true;
    bossSpawned = true; // ボス出現フラグをセット

    bossShootInterval = setInterval(() => {
        if (boss) {
            for (let i = 0; i < 24; i++) { // 通常攻撃の弾数を増加
                const angle = (i - 12) * Math.PI / 12;
                const speed = 1;
                const bulletType = `ice-bullet-${Math.floor(Math.random() * 3) + 1}`;
                enemyBullets.push({
                    x: boss.x + boss.width / 2,
                    y: boss.y + boss.height,
                    radius: 10,
                    type: bulletType,
                    dx: speed * Math.cos(angle),
                    dy: speed * Math.sin(angle)
                });
            }

            setTimeout(() => {
                const positions = [];
                for (let i = 0; i < 40; i++) {
                    positions.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height });
                }

                positions.forEach(pos => {
                    const bulletType = `ice-bullet-${Math.floor(Math.random() * 3) + 1}`;
                    enemyBullets.push({
                        x: pos.x,
                        y: pos.y,
                        radius: 10,
                        type: bulletType,
                        dx: 0,
                        dy: 0,
                        delay: true
                    });
                });

                setTimeout(() => {
                    enemyBullets.forEach(bullet => {
                        if (bullet.delay) {
                            const angle = Math.random() * Math.PI * 2; // ランダムな方向に動き出す
                            bullet.dx = 1 * Math.cos(angle);
                            bullet.dy = 1 * Math.sin(angle);
                            delete bullet.delay;
                        }
                    });
                }, 2000);
            }, 5000);
        }
    }, 4000);
}


// Initiate second phase
function initiateSecondPhase() {
    secondPhase = true;
    // Clear existing boss and bullets
    boss = null;
    enemyBullets = [];
    
    // Generate three smaller bosses
    secondaryBossHealth = 3 * 45; // Combined health for all secondary bosses
    for (let i = 0; i < 3; i++) {
        let smallBoss = { x: 100 + i * 250, y: 50, width: 50, height: 50, color: 'cyan', health: 45, direction: 1, shootCooldown: 0 };
        secondaryBosses.push(smallBoss);
    }

    // Additional attacks for second phase
    secondaryBossInterval = setInterval(() => {
        if (secondaryBosses.length > 0) {
            secondaryBosses.forEach(secondaryBoss => {
                for (let i = 0; i < 18; i++) {
                    const angle = (i - 9) * Math.PI / 9;
                    const speed = 1;
                    enemyBullets.push({
                        x: secondaryBoss.x + secondaryBoss.width / 2,
                        y: secondaryBoss.y + secondaryBoss.height,
                        radius: 10,
                        color: 'cyan',
                        dx: speed * Math.cos(angle),
                        dy: speed * Math.sin(angle)
                    });
                }
            });
        }
    }, 2000);

    secondaryBossSlowAreaInterval = setInterval(() => {
        if (secondaryBosses.length > 0) {
            for (let i = 0; i < 3; i++) {
                const slowAreaX = Math.random() * (canvas.width - 50);
                const slowAreaY = Math.random() * (canvas.height - 50);
                enemyBullets.push({
                    x: slowAreaX,
                    y: slowAreaY,
                    radius: 25,
                    color: 'rgba(128, 128, 128, 0.5)',
                    dx: 0,
                    dy: 0,
                    slowArea: true
                });
            }
        }
    }, 6000);

    secondaryBossBulletInterval = setInterval(() => {
        if (secondaryBosses.length > 0) {
            const positions = [];
            for (let i = 0; i < 35; i++) {
                positions.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    angle: Math.random() * Math.PI * 2
                });
            }

            positions.forEach(pos => {
                enemyBullets.push({
                    x: pos.x,
                    y: pos.y,
                    radius: 10,
                    color: 'cyan',
                    dx: 0,
                    dy: 0,
                    delay: true,
                    angle: pos.angle
                });
            });

            setTimeout(() => {
                enemyBullets.forEach(bullet => {
                    if (bullet.delay) {
                        bullet.dx = 0.5 * Math.cos(bullet.angle);
                        bullet.dy = 0.5 * Math.sin(bullet.angle);
                        delete bullet.delay;
                    }
                });
            }, 2000);
        }
    }, 7000);

    secondaryBossTimeStopInterval = setInterval(() => {
        if (secondaryBosses.length > 0) {
            initiateSecondaryBossTimeStop();
        }
    }, 12000);

    bossBgm.pause();
    bossBgm2.play();
}

// Boss movement and shooting
function moveBoss() {
    if (boss) {
        boss.x += boss.direction * 2;
        if (boss.x <= 0 || boss.x >= canvas.width - boss.width) {
            boss.direction *= -1;
        }
    }
}

// Move secondary bosses
function moveSecondaryBosses() {
    secondaryBosses.forEach((secondaryBoss, index) => {
        secondaryBoss.x += secondaryBoss.direction * 2;
        if (secondaryBoss.x <= 0 || secondaryBoss.x >= canvas.width - secondaryBoss.width) {
            secondaryBoss.direction *= -1;
        }
    });
}

// Initiate time stop sequence
function initiateTimeStop() {
    stopTime = true;
    stopTimeStart = Date.now();
    bgm.pause();
}

// Handle time stop sequence
function handleTimeStop() {
    if (stopTime) {
        let elapsed = Date.now() - stopTimeStart;

        if (elapsed < 5000) {
            // Time stop for 5 seconds
            fogOpacity = Math.min(fogOpacity + 0.02, 0.5);
            ctx.fillStyle = `rgba(192, 192, 192, ${fogOpacity})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (elapsed < 7000) {
            // Shatter enemies and bullets
            enemies = [];
            enemyBullets = [];
            ctx.fillStyle = `rgba(192, 192, 192, ${fogOpacity})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (elapsed < 14000) {
            // Transition to white screen
            let progress = (elapsed - 7000) / 7000;
            ctx.fillStyle = `rgba(255, 255, 255, ${progress})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (elapsed > 10000 && !boss) {
                // Generate boss during white screen transition
                generateBoss();
                bossBgm.play();
            }
        } else {
            // End time stop
            stopTime = false;
            fogOpacity = 0;
        }
    }
}

// Initiate secondary boss time stop sequence
function initiateSecondaryBossTimeStop() {
    secondaryBossTimeStop = true;
    secondaryBossTimeStopStart = Date.now();
    generatedBullets = false;
}

// Handle secondary boss time stop sequence
function handleSecondaryBossTimeStop() {
    if (secondaryBossTimeStop) {
        let elapsed = Date.now() - secondaryBossTimeStopStart;

        if (elapsed < 500) {
            // Flashing screen effect
            ctx.fillStyle = `rgba(192, 192, 192, ${(elapsed % 100) / 200})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (elapsed < 2500) {
            // Time stop for 2 seconds
            ctx.fillStyle = `rgba(192, 192, 192, 0.5)`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            if (!generatedBullets) {
                const positions = [];
                for (let i = 0; i < 40; i++) {
                    positions.push({
                        x: Math.random() * canvas.width,
                        y: Math.random() * canvas.height,
                        angle: Math.random() * Math.PI * 2
                    });
                }

                positions.forEach(pos => {
                    enemyBullets.push({
                        x: pos.x,
                        y: pos.y,
                        radius: 10,
                        color: 'darkcyan', // 色を濃くする
                        dx: 0,
                        dy: 0,
                        delay: true,
                        angle: pos.angle
                    });
                });

                generatedBullets = true;
            }
            enemyBullets.forEach(bullet => {
                if (bullet.color === 'darkcyan') {
                    bullet.dx = 0;
                    bullet.dy = 0;
                } else if (!bullet.originalDx && !bullet.originalDy) {
                    bullet.originalDx = bullet.dx;
                    bullet.originalDy = bullet.dy;
                    bullet.dx = 0;
                    bullet.dy = 0;
                }
            });
        } else if (elapsed < 4500) {
            // Slow motion for 2 seconds
            ctx.fillStyle = `rgba(192, 192, 192, 0.5)`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            enemyBullets.forEach(bullet => {
                if (bullet.color === 'darkcyan' && bullet.delay) {
                    bullet.dx = 0.5 * Math.cos(bullet.angle);
                    bullet.dy = 0.5 * Math.sin(bullet.angle);
                    delete bullet.delay;
                } else if (bullet.originalDx && bullet.originalDy) {
                    bullet.dx = bullet.originalDx * 0.5;
                    bullet.dy = bullet.originalDy * 0.5;
                }
            });
        } else {
            // End time stop
            secondaryBossTimeStop = false;
            generatedBullets = false;
            enemyBullets.forEach(bullet => {
                if (bullet.originalDx && bullet.originalDy) {
                    bullet.dx = bullet.originalDx; // スロー解除
                    bullet.dy = bullet.originalDy; // スロー解除
                    delete bullet.originalDx;
                    delete bullet.originalDy;
                }
            });
        }
    }
}

// Initiate third phase (end of boss battle)
function initiateThirdPhase() {
    // Clear existing bullets
    enemyBullets = [];
    ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '48px Arial';
        ctx.fillText('ステージクリア！', canvas.width / 2 - 100, canvas.height / 2);
    }, 1000);
    setTimeout(() => {
        resetGame();
    }, 3000);
}

// Reset game to normal state after boss battle
function resetGame() {
    bossBgm2.pause(); // 第二形態のBGMを停止
    bossBgm2.currentTime = 0; // 再生位置をリセット
    bgm.play(); // 通常のBGMを再生

    bossMode = false;
    secondPhase = false;
    stopTime = false;
    secondaryBossTimeStop = false;
    generatedBullets = false;
    player.speedMultiplier = 1;
    player.bulletCount = 2;
    points = 0;
    secondaryBossHealth = 0;
    player.bullets = [];
    enemies = [];
    powerUps = [];
    clearInterval(bossShootInterval);
    clearInterval(bossDiamondBulletInterval);
    clearInterval(secondaryBossInterval);
    clearInterval(secondaryBossSlowAreaInterval);
    clearInterval(secondaryBossBulletInterval);
    clearInterval(secondaryBossTimeStopInterval);
}

// Draw boss health bar
function drawBossHealthBar(boss, totalHealth, index) {
    const healthBar = document.createElement('div');
    healthBar.classList.add('boss-health-bar');
    const health = document.createElement('div');
    health.classList.add('health');
    health.style.width = `${(boss.health / totalHealth) * 100}%`;
    healthBar.appendChild(health);
    document.body.appendChild(healthBar);
    return healthBar;
}

// Update boss health bar
function updateBossHealthBar(percentage) {
    const healthBar = document.querySelector('.boss-health-bar .health');
    if (healthBar) {
        healthBar.style.width = `${percentage * 100}%`;
    }
}

// Update second boss health bar
function updateSecondBossHealthBar(percentage) {
    const healthBar = document.querySelector('.second-boss-health-bar .health');
    if (healthBar) {
        healthBar.style.width = `${percentage * 100}%`;
    }
}

// Main game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    bgScrollY += 1; // Scroll speed
    if (bgScrollY >= canvas.height) bgScrollY = 0; // Reset scroll

    ctx.drawImage(bgImage, 0, bgScrollY - canvas.height, canvas.width, canvas.height);
    ctx.drawImage(bgImage, 0, bgScrollY, canvas.width, canvas.height);

    // Move player and bullets
    if (!stopTime && !secondaryBossTimeStop) {
        movePlayer();
        moveBullets();

        // Generate and move enemies if not skipping to boss
        if (!skipToBoss) {
            generateEnemies();
            moveEnemies();
        } else if (!boss) {
            // Generate boss if skipping to boss
            generateBoss();
        } else if (secondPhase) {
            // Move secondary bosses
            moveSecondaryBosses();
        }

        // Detect collisions
        detectCollisions();

        // Collect power-ups
        collectPowerUps();
    } else if (stopTime) {
        handleTimeStop();
    } else if (secondaryBossTimeStop) {
        handleSecondaryBossTimeStop();
    }

    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw player hitbox (blue dot)
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.hitboxRadius, 0, Math.PI * 2, false);
    ctx.fillStyle = 'blue';
    ctx.fill();
    ctx.closePath();

    // Draw bullets
    player.bullets.forEach(bullet => {
        ctx.fillStyle = 'white';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Draw enemy bullets
    enemyBullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2, false);
        if (bullet.dx !== undefined && bullet.dy !== undefined) {
            bullet.x += bullet.dx;
            bullet.y += bullet.dy;
        }
        ctx.fillStyle = bullet.color;
        ctx.fill();
        ctx.closePath();
    });

    // Draw enemies
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });

    // Draw power-ups
    drawPowerUps();

    // Draw boss
    if (boss) {
        ctx.fillStyle = boss.color;
        ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
        drawBossHealthBar(boss, 60, 0); // Draw main boss health bar
    }

    // Draw secondary bosses
    if (secondPhase) {
        secondaryBosses.forEach((secondaryBoss, index) => {
            ctx.fillStyle = secondaryBoss.color;
            ctx.fillRect(secondaryBoss.x, secondaryBoss.y, secondaryBoss.width, secondaryBoss.height);
        });
        // Draw combined health bar for secondary bosses
        drawBossHealthBar({ health: secondaryBossHealth }, 135, 1);
    }

    // Draw score
    document.getElementById('score').innerText = `Score: ${player.score}`;

    // Draw lives
    drawLives();

    // Draw power-up points
    drawPowerUpPoints();

    // Check game over
    if (player.lives <= 0) {
        clearInterval(gameInterval);
        clearInterval(bossShootInterval);
        clearInterval(bossDiamondBulletInterval);
        clearInterval(secondaryBossInterval);
        clearInterval(secondaryBossSlowAreaInterval);
        clearInterval(secondaryBossBulletInterval);
        clearInterval(secondaryBossTimeStopInterval);
        ctx.fillStyle = '#ccffcc';
        ctx.font = '48px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
    }

    // Check if score reaches 100,000 to initiate time stop
    if (player.score >= 100000 && !bossMode && !stopTime && !bossSpawned) {
        initiateTimeStop();
    }
}

// Start game
gameInterval = setInterval(gameLoop, 1000 / 60);

// Automatic shooting
setInterval(() => {
    if (!stopTime && !secondaryBossTimeStop) {
        for (let i = 0; i < player.bulletCount; i++) {
            let offsetX = 0, offsetY = 0;
            if (i === 1) offsetX = -10; // 1st power-up: left
            if (i === 2) offsetX = 10; // 2nd power-up: right
            if (i === 3) offsetY = -10; // 3rd power-up: up
            if (i === 4) offsetY = 10; // 4th power-up: down

            player.bullets.push({
                x: player.x + player.width / 2 - 2.5 + offsetX,
                y: player.y + offsetY,
                width: 5,
                height: 10
            });

            // Play gun sound
            const gunSound = new Audio('gun.mp3');
            gunSound.volume = 0.15;
            gunSound.play();
        }
    }
}, 500);
