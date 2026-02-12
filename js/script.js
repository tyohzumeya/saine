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

// ===== AudioContext 1つだけ作る =====
const audioCtx = new AudioContext();

function ensureAudioContext() {
  if (audioCtx.state === "suspended") {
    audioCtx.resume().then(() => {
      console.log("AudioContext resumed");
    });
  }
}

// ページ上で一度だけユーザー操作を検知
window.addEventListener("click", ensureAudioContext, { once: true });
window.addEventListener("keydown", ensureAudioContext, { once: true });

/* --------------------
   モード定義
-------------------- */
const MODES = {
  audio: {                // マイクラモード
    title: "Hello Minecraft Saine World!",
    se: "villiger.mp3",
    buffer: null // 後でロード
  },
  exaudio: {               // 隠しモード
    title: "Hello Hentai Saine World!",
    se: "unlock.mp3",
    buffer: null // 後でロード
  }
};

// ===== SE 事前ロード =====
async function loadSE(mode) {
  const res = await fetch(MODES[mode].se);
  const arrayBuffer = await res.arrayBuffer();
  MODES[mode].buffer = await audioCtx.decodeAudioData(arrayBuffer);
}

// ページロード時に全モードのSEをロード
Promise.all(Object.keys(MODES).map(loadSE));

// ===== SE再生 =====
function playSE(mode) {
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  
  const buffer = MODES[mode].buffer;
  if (!buffer) return; // まだロード中なら無視
  
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(audioCtx.destination);
  source.start();
}

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
      playSE(modeKey);
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
// ===== コマンド定義（ハッシュのみ） =====
const COMMANDS = [
  { length: 5,  hash: "b7f4ad296a6d46cf6b0f9c706beb0666e12b942a11d5c3a96a6cfcd662d898a0", action: () => displayModal()        }, //SAINE
  { length: 10, hash: "231972e16c02efaec6b7314d6048fae1348789e83f6b94f1b3e250104aa3e932", action: () => switchMode("exaudio") }, //KNM
  { length: 9,  hash: "718414d60ffc4ffc7cecb4e99a52e538f2cb36d44be5cf1d519e74998a46b757", action: () => switchMode("audio")   }  //MC
];

// 最大長は一度だけ計算
const MAX_LEN = Math.max(...COMMANDS.map(c => c.length));

let inputKeys = [];

// ===== SHA-256（軽量化済み） =====
async function sha256(str) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(str)
  );
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// ===== キー監視 =====
window.addEventListener("keydown", async (e) => {
  inputKeys.push(e.key.toLowerCase());

  if (inputKeys.length > MAX_LEN) {
    inputKeys.shift();
  }

  // 長い順にチェックすると早期終了しやすい
  for (let i = 0; i < COMMANDS.length; i++) {
    const cmd = COMMANDS[i];

    if (inputKeys.length < cmd.length) continue;

    const slice = inputKeys.slice(-cmd.length).join(",");
    const hash = await sha256(slice);

    if (hash === cmd.hash) {
      cmd.action();
      inputKeys.length = 0; // 配列再生成しない（微最適化）
      break;
    }
  }
});

/* --------------------
   初期状態はまっさら（何もロードしない）
-------------------- */
container.innerHTML = "";
document.getElementById("title").textContent = "Hello Saine World!";

// モーダル要素取得
const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImg");
const modalClose = document.getElementById("modalClose");

function displayModal() {
  modalImg.src = "HA3wUOYbkAIPeS1.jpg";
  modal.hidden = false;
}

// モーダルの外側クリックで閉じる
modal.addEventListener("click", (e) => {
  if (e.target === modal || e.target === modalClose) {
    modal.hidden = true;
  }
});