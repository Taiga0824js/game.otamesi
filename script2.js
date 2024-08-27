document.addEventListener('DOMContentLoaded', (event) => {
    const player = document.getElementById('player');
    const gameArea = document.getElementById('gameArea');
    const step = 5; // 一回の移動距離

    let keys = {};

    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });

    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    function movePlayer() {
        let top = parseInt(window.getComputedStyle(player).getPropertyValue('top'));
        let left = parseInt(window.getComputedStyle(player).getPropertyValue('left'));

        if (keys['w'] && top > 0) {
            player.style.top = `${top - step}px`;
        }
        if (keys['a'] && left > 0) {
            player.style.left = `${left - step}px`;
        }
        if (keys['s'] && top < gameArea.clientHeight - player.clientHeight) {
            player.style.top = `${top + step}px`;
        }
        if (keys['d'] && left < gameArea.clientWidth - player.clientWidth) {
            player.style.left = `${left + step}px`;
        }

        requestAnimationFrame(movePlayer);
    }

    movePlayer();
});
