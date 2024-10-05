window.SQR = window.SQR || {};

let snd = null;
let cameraFacing = true;
const playingList = [];
const PLAY_TIME = 1900; // 1単語の再生時間(2秒だと雑音が入るため1.9秒としている)
const WAITING_PLAY_TIME = PLAY_TIME + 1000; // 再生後の待ち時間

const spriteKeys = {};
for (let i = 0; i < 150; i++) {
  spriteKeys[`play${i + 1}`] = [i * 2000, PLAY_TIME];
}

window.onload = () => {
  snd = new Howl({
    src: [
      "./assets/english1.ogg",
      "./assets/english1.m4a",
      "./assets/english1.mp3",
    ],
    loop: false,
    volume: 1.0,
    sprite: spriteKeys,
    onload: () => {
      console.log("サウンド準備完了");
      document.querySelector(".loading").remove();
      SQR.reader.initCamera();
    },
  });

  document
    .querySelector("#buttonReverse")
    .addEventListener("click", function (e) {
      e.preventDefault();

      cameraFacing = !cameraFacing;
      SQR.reader.stopCamera();
      SQR.reader.initCamera();
    });
};

SQR.reader = (() => {
  const video = document.querySelector("#js-video");

  const findQR = () => {
    const canvas = document.querySelector("#js-canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);

    if (code) {
      soundPlay(code.data);
    }

    setTimeout(findQR, 200);
  };

  const soundPlay = (data) => {
    console.log("soundPlay", data);

    if (!data.startsWith("play")) {
      console.warn("対象外の値が読み込まれたためスキップします。", data);
      return;
    }

    if (!playingList.includes(data)) {
      playingList.push(data);
      console.log("soundPlay snd", snd);
      snd.play(data);

      // 同一の単語を連続で再生しないようにする
      setTimeout(() => {
        playingList.splice(playingList.indexOf(data), 1);
      }, WAITING_PLAY_TIME);
    }
  };

  /**
   * デバイスのカメラを起動
   */
  const initCamera = () => {
    console.log("initCamera navigator.mediaDevices", navigator.mediaDevices);

    const mode = cameraFacing ? "environment" : "user";

    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          facingMode: mode,
        },
      })
      .then((stream) => {
        video.srcObject = stream;
        video.setAttribute("playsinline", true); // iOS対応
        video.onloadedmetadata = () => {
          video.play();
          findQR();
        };
      })
      .catch(() => {
        console.error("カラメラを起動できません。");
      });
  };

  // videoセッション一時停止
  const stopCamera = () => {
    video.srcObject.getTracks().forEach(function (track) {
      track.stop();
    });

    video.srcObject = null;
  };

  return {
    initCamera,
    stopCamera,
    findQR,
  };
})();
