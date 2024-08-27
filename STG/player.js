export const player = {
    x: 400,
    y: 500,
    width: 20,
    height: 20,
    color: 'red',
    bullets: [],
    score: 0,
    lives: 5,
    hitboxRadius: 3,
    speedMultiplier: 1,
    bulletCount: 1,
    lifeStock: 0
};

export function movePlayer(keys, canvas) {
    if (keys['w'] && player.y > 0) player.y -= 5;
    if (keys['a'] && player.x > 0) player.x -= 5;
    if (keys['s'] && player.y < canvas.height - player.height) player.y += 5;
    if (keys['d'] && player.x < canvas.width - player.width) player.x += 5;
}
