document.addEventListener('DOMContentLoaded', function() {
    // 最新の歌詞のサビ部分を表示する
    const latestChorus = "最新の歌詞のサビ部分です";  // ここに最新の歌詞のサビ部分を入力
    document.getElementById('latest-chorus').textContent = latestChorus;
});

// ホーム画面を表示する関数
function showHome() {
    document.getElementById('home').style.display = 'block';
    document.getElementById('lyrics').style.display = 'none';
}

// 歌詞一覧ページを表示する関数
function showLyricsList() {
    document.getElementById('home').style.display = 'none';
    document.getElementById('lyrics').style.display = 'block';
}
