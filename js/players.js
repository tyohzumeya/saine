const panel = document.getElementById("audio-panel");

fetch("/saine/animal-voice-list.json")
  .then(res => res.json())
  .then(voiceUrls => {
    voiceUrls.forEach((file, label, volume, gap) => {
    });
      const ctrl = document.createElement("div");
      ctrl.className = "audio-controls";

      // 名前
      const nameSpan = document.createElement("span");
      nameSpan.className = "track-name";
      nameSpan.title = label;
      nameSpan.textContent = label;
      ctrl.appendChild(nameSpan);

      // 再生ボタン
      const playBtn = document.createElement("button");
      playBtn.className = "btn play";
      playBtn.textContent = "▶";
      ctrl.appendChild(playBtn);

      // ミュートボタン
      const muteBtn = document.createElement("button");
      muteBtn.className = "btn mute";
      muteBtn.textContent = "🔊";
      ctrl.appendChild(muteBtn);

      // 音量スライダー
      const vol = document.createElement("input");
      vol.type = "range";
      vol.min = 0;
      vol.max = 1;
      vol.step = 0.01;
      vol.value = volume;
      ctrl.appendChild(vol);

      // audioタグ
      const audio = document.createElement("audio");
      audio.src = file;
      audio.loop = false;
      audio.volume = volume;
      ctrl.appendChild(audio);

      panel.appendChild(ctrl);

      // 動作制御
      let lastVolume = volume;
      let isPlaying = false;
      const gap = gap || 0;

      playBtn.addEventListener("click", () => {
        if (!isPlaying) {
          isPlaying = true;
          playBtn.textContent = "⏸";
          audio.play();
        } else {
          isPlaying = false;
          playBtn.textContent = "▶";
          audio.pause();
          audio.currentTime = 0;
        }
      });

      audio.addEventListener("ended", () => {
        if (!isPlaying) return;
        setTimeout(() => {
          audio.currentTime = 0;
          audio.play();
        }, gap);
      });

      vol.addEventListener("input", () => {
        audio.volume = vol.value;
        if (audio.volume == 0) muteBtn.textContent = "🔇";
        else { muteBtn.textContent = "🔊"; lastVolume = audio.volume; }
      });

      muteBtn.addEventListener("click", () => {
        if (audio.volume > 0) {
          lastVolume = audio.volume;
          audio.volume = 0;
          vol.value = 0;
          muteBtn.textContent = "🔇";
        } else {
          audio.volume = lastVolume || 0.3;
          vol.value = audio.volume;
          muteBtn.textContent = "🔊";
        }
      });
});

const faceContainer = document.getElementById("fade-container");

// ランダム切替関数
function nextImage() {
  const images = faceContainer.querySelectorAll("img"); // 親から子を取得
  const activeIndex = images.findIndex(img => img.classList.contains("active"));

  // 現在と同じ画像を避けてランダム選択
  let nextIndex;
  do {
    nextIndex = Math.floor(Math.random() * images.length);
  } while (nextIndex === activeIndex);

  images[activeIndex].classList.remove("active");
  images[nextIndex].classList.add("active");
}

// 画像タグを生成
fetch("/saine/face-list.json")
  .then(res => res.json())
  .then(imageUrls => {
    imageUrls.forEach((url, index) => {
      const img = document.createElement("img");
      img.src = url;
      if (index === 0) img.classList.add("active");
      faceContainer.appendChild(img);
    });
    // 3秒ごとに切り替え
    setInterval(nextImage, 3000);
});
