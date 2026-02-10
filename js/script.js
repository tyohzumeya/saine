const container = document.getElementById("button-container");
let currentAudio = null;

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
      list.forEach((item) => {
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

/* --------------------
   モード定義
-------------------- */
const MODES = {
  audio: {                // マイクラモード
    title: "Hello Minecraft Saine World!",
    se: villiger.mp3
  },
  exaudio: {               // 隠しモード
    title: "Hello Hentai Saine World!",
    se: unlock.mp3
  }
};

/* --------------------
   現在のモード管理
-------------------- */
let currentMode = null;

/* --------------------
   モード切替関数
-------------------- */
function switchMode(modeKey) {
  const mode = MODES[modeKey];
  if (!mode) return;

  // 効果音（必要ならMODESにseを追加して再生可能）
  if (mode.se) {
    mode.se.currentTime = 0;
    mode.se.play();
  }

  // 音源リストをロード
  loadAudioList(`/saine/${modeKey}-list.json`, modeKey);

  // タイトル変更
  document.getElementById("title").textContent = mode.title;

  // 現在モード更新
  currentMode = modeKey;
}

/* --------------------
   コマンド定義
-------------------- */
const COMMANDS = {
  KONAMI: {
    sequence: [
      "arrowup","arrowup","arrowdown","arrowdown",
      "arrowleft","arrowright","arrowleft","arrowright",
      "b","a"
    ],
    action: () => switchMode("exaudio") // コナミコマンドで裏モード
  },
  MINECRAFT: {
    sequence: ["m","i","n","e","c","r","a","f","t"],
    action: () => switchMode("audio") // マイクラモード
  }
};

let inputKeys = [];

/* --------------------
   キー入力監視
-------------------- */
window.addEventListener("keydown", (e) => {
  inputKeys.push(e.key.toLowerCase());

  // 入力履歴は100で制限
  if (inputKeys.length > 100) inputKeys.shift();

  // 全コマンドチェック
  for (const cmd of Object.values(COMMANDS)) {
    if (inputKeys.slice(-cmd.sequence.length).join(",") === cmd.sequence.join(",")) {
      cmd.action();
    }
  }
});

/* --------------------
   初期状態はまっさら（何もロードしない）
-------------------- */
container.innerHTML = "";
document.getElementById("title").textContent = "Hello Saine World!";
