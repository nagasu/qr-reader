const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d', { willReadFrequently: true });
const output = document.getElementById('output');

let snd = null;
const PLAY_TIME = 1900; // 1単語の再生時間
const WAITING_PLAY_TIME = PLAY_TIME + 1000; // 再生後の待ち時間

window.onload = ()=>{
    console.log("onload");

	snd = new Howl({
		src: [
            "../assets/english1.ogg",
            "../assets/english1.m4a",
            "../assets/english1.mp3",
        ],
		loop: false,
		volume: 1.0,
        sprite: {
            play1: [0, PLAY_TIME],
            play2: [2000, PLAY_TIME],
            play3: [4000, PLAY_TIME],
        },
        onload: () => {
            console.log("サウンド準備完了");
            // start();
        },
		onplay: () => {
			console.log("サウンド再生");
		},
		onend: () => {
			console.log("サウンド終了");
		}
	});
}

// カメラのアクセス許可を要求
// function start() {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
            video.srcObject = stream;
            video.setAttribute('playsinline', true);  // iOS対応
            video.play();
            requestAnimationFrame(tick);
        });
// }

function tick() {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);
    if (code) {
      output.textContent = `QRコード内容: ${code.data}`;

      // 音声再生
      soundPlay(code.data);
    }
  }
  requestAnimationFrame(tick);
}

const playingList = [];

function soundPlay(data) {
    if (!data.startsWith('play')) {
        return
    }

    if (!playingList.includes(data)) {
        playingList.push(data);
        snd.play(data);

        // 5秒後に再度読み込めるようにする
        setTimeout(() => {
            playingList.splice(playingList.indexOf(data), 1);
        }, WAITING_PLAY_TIME)
    }
}
