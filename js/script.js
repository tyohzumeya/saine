const container = document.getElementById("button-container");
let currentAudio = null;
let isSecretMode = false;

// 効果音
const SE = {
  unlock: new Audio("unlock.mp3"),
  rollback: new Audio("rollback.mp3")
};

/* --------------------
   ボタン生成処理
-------------------- */
function loadAudioList(jsonPath, audioDir) {
  container.innerHTML = "";
  currentAudio = null;

  fetch(jsonPath)
    .then(response => response.json())
    .then(list => {
      list.forEach((item, index) => {
        const btn = document.createElement("button");
        btn.textContent = item.label;

        const audio = document.createElement("audio");
        audio.src = `${audioDir}/${item.file}`;

        btn.onclick = () => {
          if (currentAudio && !currentAudio.paused) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
          }
          audio.play();
          currentAudio = audio;
        };

        container.appendChild(btn);
        container.appendChild(audio);
      });
    })
    .catch(err => console.error("JSON読み込みエラー:", err));
}

// 初期読み込み（通常）
loadAudioList("/saine/audio-list.json", "audio");

/* --------------------
   コナミコマンド
-------------------- */
const KONAMI = [
  "arrowup",
  "arrowup",
  "arrowdown",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "arrowleft",
  "arrowright",
  "b",
  "a"
];

let inputKeys = [];

window.addEventListener("keydown", (e) => {
  inputKeys.push(e.key.toLowerCase());

  if (inputKeys.length > KONAMI.length) {
    inputKeys.shift();
  }

  if ( inputKeys.join(",") === KONAMI.join(",")) {
    toggleSecretMode();
  }
});

function toggleSecretMode() {
  if (isSecretMode) {
    deactivateSecretMode();
  } else {
    activateSecretMode();
  }
}

/* --------------------
   シークレット解禁
-------------------- */
function activateSecretMode() {
  isSecretMode = true;

  // 効果音
  SE.unlock.currentTime = 0;
  SE.unlock.play();

  // 演出
  container.classList.add("secret");

  // 隠し音源に切り替え
  loadAudioList("/saine/exaudio-list.json", "exaudio");
  
  // タイトルを変更
  document.getElementById("title").textContent = "Hello Hentai Saine World!";
}

function deactivateSecretMode() {
  isSecretMode = false;

  // 効果音
  SE.rollback.currentTime = 0;
  SE.rollback.play();

  // ボタン戻す
  loadAudioList("/saine/audio-list.json", "audio");

  // 見た目戻す
  container.classList.remove("secret");
  
  // タイトルを変更
  document.getElementById("title").textContent = "Hello Saine World!";
}
