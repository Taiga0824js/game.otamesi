// utils.js
export function detectCollisions(player, enemies, enemyBullets, powerUps, boss, secondaryBosses) {
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
                }
            });
        });
    }
}
