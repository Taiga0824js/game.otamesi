// scripts.js
document.addEventListener('DOMContentLoaded', () => {
    const songForm = document.getElementById('song-form');
    const songTitleInput = document.getElementById('song-title');
    const songLyricsInput = document.getElementById('song-lyrics');
    const songList = document.getElementById('songs');

    songForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = songTitleInput.value.trim();
        const lyrics = songLyricsInput.value.trim();

        if (title && lyrics) {
            addSong(title, lyrics);
            songForm.reset();
        }
    });

    function addSong(title, lyrics) {
        const li = document.createElement('li');
        li.innerHTML = `
            <h3>${title}</h3>
            <p>${lyrics}</p>
            <button class="delete-btn">削除</button>
        `;

        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            li.remove();
        });

        songList.appendChild(li);
    }
});
