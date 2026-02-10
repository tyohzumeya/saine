const panel = document.getElementById("audio-panel");

fetch("/saine/animal-voice-list.json")
  .then(res => res.json())
  .then(voiceUrls => {
    voiceUrls.forEach(item => {

      const ctrl = document.createElement("div");
      ctrl.className = "audio-controls";

      // 名前
      const nameSpan = document.createElement("span");
      nameSpan.className = "track-name";
      nameSpan.title = item.label;
      nameSpan.textContent = item.label;
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
      vol.value = item.volume;
      ctrl.appendChild(vol);

      // audio
      const audio = document.createElement("audio");
      audio.src = `animalSE/${item.file}`;
      audio.volume = item.volume;
      ctrl.appendChild(audio);

      panel.appendChild(ctrl);

      let lastVolume = item.volume;
      let isPlaying = false;
      const gap = (item.gap || 0) * 1000;

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
        if (audio.volume == 0) {
          muteBtn.textContent = "🔇";
        } else {
          muteBtn.textContent = "🔊";
          lastVolume = audio.volume;
        }
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
  });


const faceContainer = document.getElementById("fade-container");

function nextImage() {
  const images = Array.from(faceContainer.querySelectorAll("img"));
  if (images.length === 0) return;

  const activeIndex = images.findIndex(img =>
    img.classList.contains("active")
  );

  let nextIndex;
  do {
    nextIndex = Math.floor(Math.random() * images.length);
  } while (nextIndex === activeIndex);

  images[activeIndex].classList.remove("active");
  images[nextIndex].classList.add("active");
}

fetch("/saine/face-list.json")
  .then(res => res.json())
  .then(imageUrls => {
    imageUrls.forEach((url, index) => {
      const img = document.createElement("img");
      img.src = `saineFace/${url}`;
      if (index === 0) img.classList.add("active");
      faceContainer.appendChild(img);
    });
    setInterval(nextImage, 3000);
  });