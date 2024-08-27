document.addEventListener('DOMContentLoaded', function() {
    const lyricsList = document.getElementById('lyrics-list');
    const addLyricsForm = document.getElementById('add-lyrics-form');
    const lyricsTitleInput = document.getElementById('lyrics-title');
    const lyricsContentInput = document.getElementById('lyrics-content');

    // ローカルストレージから歌詞を読み込む
    const savedLyrics = JSON.parse(localStorage.getItem('lyrics')) || [];
    savedLyrics.forEach(lyrics => addLyricsToList(lyrics.title, lyrics.content));

    // 歌詞の追加フォームを表示する
    window.showAddLyricsForm = function() {
        addLyricsForm.style.display = 'block';
    };

    // 歌詞を追加する
    window.addLyrics = function() {
        const title = lyricsTitleInput.value.trim();
        const content = lyricsContentInput.value.trim();
        if (title && content) {
            addLyricsToList(title, content);
            saveLyricsToLocalStorage(title, content);
            lyricsTitleInput.value = '';
            lyricsContentInput.value = '';
            addLyricsForm.style.display = 'none';
        }
    };

    // 歌詞をリストに追加する関数
    function addLyricsToList(title, content) {
        const li = document.createElement('li');
        li.innerHTML = `<span class="lyrics-title">${title}</span><span class="lyrics-content">${content}</span>`;
        lyricsList.appendChild(li);
    }

    // 歌詞をローカルストレージに保存する関数
    function saveLyricsToLocalStorage(title, content) {
        const lyrics = { title, content };
        savedLyrics.push(lyrics);
        localStorage.setItem('lyrics', JSON.stringify(savedLyrics));
    }
});
