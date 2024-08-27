import { ctx, canvas, powerUps as powerUpList, player as playerData, collectPowerUps, drawPowerUps, drawLives, drawPowerUpPoints, points as playerPoints } from './STG.js';

function handlePowerUpCollection() {
    powerUpList.forEach((powerUp, index) => {
        powerUp.y += powerUp.dy; // Move power-up downwards
        const dx = powerUp.x - (playerData.x + playerData.width / 2);
        const dy = powerUp.y - (playerData.y + playerData.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 15 || distance < 100 && Math.abs(dx) < 30 && Math.abs(dy) < 30) {
            powerUp.x -= dx * 0.1;
            powerUp.y -= dy * 0.1;
        }

        if (distance < 15) {
            powerUpList.splice(index, 1);
            if (powerUp.isPink) {
                if (playerData.lives < 5) {
                    playerData.lives++;
                } else if (playerData.lifeStock < 3) {
                    playerData.lifeStock++;
                }
            } else {
                playerPoints++;
                if (playerPoints >= 10) {
                    playerPoints = 0;
                    const rand = Math.random();
                    if (rand < 0.7) {
                        playerData.speedMultiplier = Math.min(playerData.speedMultiplier * 1.2, 5); // 最大500%
                        console.log("弾速UP！");
                    } else {
                        playerData.bulletCount = Math.min(playerData.bulletCount + 1, 4); // 最大4発
                        console.log("弾数UP！");
                    }
                }
            }
        }
    });
}

export { handlePowerUpCollection };
