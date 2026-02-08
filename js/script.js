const container = document.getElementById('button-container');
let currentAudio = null; // 再生中の音声を記録
 
// JSON読み込み
fetch("/saine/audio-list.json")
  .then(response => response.json())
  .then(list => {
    list.forEach((item, index) => {
      const btn = document.createElement('button');
      btn.textContent = item.label;

      const audio = document.createElement('audio');
      audio.id = "audio" + index;
      audio.src = "audio/" + item.file;

      btn.onclick = () => {
        // 前回の音声を停止
        if (currentAudio && !currentAudio.paused) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
        // 今回の音声を再生
        audio.play();
        currentAudio = audio;
      };

      container.appendChild(btn);
      container.appendChild(audio);
    });
  })
  .catch(err => console.error("JSON読み込みエラー:", err));
