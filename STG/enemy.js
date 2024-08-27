// enemy.js
import { ctx, canvas, enemies, enemyBullets, player, generateEnemies, moveEnemies } from './STG.js';

export let enemies = [];
export let enemyBullets = [];

export function generateEnemies(canvas, player) {
    if (enemies.length < 12) {
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

export function moveEnemies(canvas, player) {
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
