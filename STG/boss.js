import { ctx, canvas, boss as bossData, enemyBullets, secondaryBosses, secondaryBossHealth, bossMode, secondPhase, stopTime, secondaryBossTimeStop, bossShootInterval, bossDiamondBulletInterval, secondaryBossInterval, secondaryBossSlowAreaInterval, secondaryBossBulletInterval, secondaryBossTimeStopInterval, bgm, bossBgm, bossBgm2, player, detectCollisions, collectPowerUps, moveBullets, handleTimeStop, handleSecondaryBossTimeStop, initiateThirdPhase, stopTimeStart, fogOpacity, generatedBullets, secondaryBossTimeStopStart } from './STG.js';

function generateBoss() {
    bossData.x = 350;
    bossData.y = 50;
    bossData.width = 100;
    bossData.height = 100;
    bossData.color = 'cyan';
    bossData.health = 60;
    bossData.direction = 1;
    bossData.shootCooldown = 0;
    bossMode = true;

    bossShootInterval = setInterval(() => {
        if (bossData) {
            for (let i = 0; i < 24; i++) { // 通常攻撃の弾数を増加
                const angle = (i - 12) * Math.PI / 12;
                const speed = 1;
                enemyBullets.push({
                    x: bossData.x + bossData.width / 2,
                    y: bossData.y + bossData.height,
                    radius: 10,
                    color: 'cyan',
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
                    enemyBullets.push({
                        x: pos.x,
                        y: pos.y,
                        radius: 10,
                        color: 'cyan',
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

    // Boss diamond pattern attack
    bossDiamondBulletInterval = setInterval(() => {
        if (bossData) {
            const direction = Math.random() < 0.5 ? 'right' : 'left';
            const xStart = direction === 'right' ? canvas.width - 50 : 50;
            const xEnd = direction === 'right' ? 50 : canvas.width - 50;

            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 3; j++) {
                    enemyBullets.push({
                        x: xStart,
                        y: 50 + j * 50,
                        radius: 10,
                        color: 'cyan',
                        dx: (xEnd - xStart) / 100,
                        dy: 2
                    });
                }
            }
        }
    }, 10000);
}

function initiateSecondPhase() {
    secondPhase = true;
    // Clear existing boss and bullets
    bossData = null;
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

function moveBoss() {
    if (bossData) {
        bossData.x += bossData.direction * 2;
        if (bossData.x <= 0 || bossData.x >= canvas.width - bossData.width) {
            bossData.direction *= -1;
        }
    }
}

function moveSecondaryBosses() {
    secondaryBosses.forEach((secondaryBoss, index) => {
        secondaryBoss.x += secondaryBoss.direction * 2;
        if (secondaryBoss.x <= 0 || secondaryBoss.x >= canvas.width - secondaryBoss.width) {
            secondaryBoss.direction *= -1;
        }
    });
}

function initiateSecondaryBossTimeStop() {
    secondaryBossTimeStop = true;
    secondaryBossTimeStopStart = Date.now();
    generatedBullets = false;
}

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

function drawBossHealthBar(boss, totalHealth, index) {
    ctx.fillStyle = 'red';
    ctx.fillRect(50, 20 + index * 30, (canvas.width - 100) * (boss.health / totalHealth), 20);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(50, 20 + index * 30, canvas.width - 100, 20);
}

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

export { generateBoss, initiateSecondPhase, moveBoss, moveSecondaryBosses, initiateSecondaryBossTimeStop, handleSecondaryBossTimeStop, drawBossHealthBar, resetGame, initiateThirdPhase };
