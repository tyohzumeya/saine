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

/* --------------------
   モード定義
-------------------- */
const MODES = {
  default: {               // 初期
    title: "Hello Saine World!"
  },
  audio: {                // マイクラモード
    title: "Hello Minecraft Saine World!"
  },
  exaudio: {               // 隠しモード
    title: "Hello Hentai Saine World!"
  }
};

/* --------------------
   現在のモード管理
-------------------- */
let currentMode = "default";

/* --------------------
   モード切替関数
-------------------- */
function switchMode(modeKey) {
  const mode = MODES[modeKey];
  if (!mode) return;

  // 効果音（MODESに必要ならseプロパティ追加可能）
  if (mode.se) {
    mode.se.currentTime = 0;
    mode.se.play();
  }

  // 音源切替（modeKeyと同名のリストファイルをロード）
  if ("default" -eq modeKey) {
      loadAudioList(`/saine/${modeKey}-list.json`, modeKey);
  }

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
    action: () => switchMode("exaudio") // マインクラフトモード
  },
  DEBUG: {
    sequence: ["d","e","b","u","g"],
    action: () => switchMode("special") // debugキーで特殊モード
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
   初期読み込み
-------------------- */
loadAudioList("/saine/audio-list.json", "default");
