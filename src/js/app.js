window.SQR = window.SQR || {}

let snd = null;
const playingList = [];
const PLAY_TIME = 1900; // 1単語の再生時間
const WAITING_PLAY_TIME = PLAY_TIME + 1000; // 再生後の待ち時間

window.onload = ()=>{
    console.log("onload @@@");

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
        },
		onplay: () => {
			console.log("サウンド再生");
		},
		onend: () => {
			console.log("サウンド終了");
		}
	});
}

SQR.reader = (() => {
    const video = document.querySelector('#js-video')

    /**
     * videoの出力をCanvasに描画して画像化 jsQRを使用してQR解析
     */
    const checkQRUseLibrary = () => {
        const canvas = document.querySelector('#js-canvas')
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, canvas.width, canvas.height)

        if (code) {
            soundPlay(code.data);
        }

        setTimeout(checkQRUseLibrary, 200)
    }

    /**
     * videoの出力をBarcodeDetectorを使用してQR解析
     */
    const checkQRUseBarcodeDetector = () => {
        const barcodeDetector = new BarcodeDetector()
        barcodeDetector
            .detect(video)
            .then((barcodes) => {
                if (barcodes.length > 0) {
                    for (let barcode of barcodes) {
                        soundPlay(barcode.rawValue);
                    }
                }
                setTimeout(checkQRUseBarcodeDetector, 200)
            })
            .catch(() => {
                console.error('Barcode Detection failed, boo.')
            })
    }

    const soundPlay = (data) => {
        console.log("soundPlay", data);

        if (!data.startsWith('play')) {
            return
        }

        if (!playingList.includes(data)) {
            playingList.push(data);
            console.log("soundPlay snd", snd);
            snd.play(data);

            // 5秒後に再度読み込めるようにする
            setTimeout(() => {
                playingList.splice(playingList.indexOf(data), 1);
            }, WAITING_PLAY_TIME)
        }
    }

    /**
     * BarcodeDetector APIを使えるかどうかで処理を分岐
     */
    const findQR = () => {
        checkQRUseLibrary()
        // window.BarcodeDetector
        //     ? checkQRUseBarcodeDetector()
        //     : checkQRUseLibrary()
    }

    /**
     * デバイスのカメラを起動
     */
    const initCamera = () => {
        // navigator.mediaDevices
        //     .getUserMedia({ video: { facingMode: 'environment' } })
        // .then(stream => {
        //     console.log('stream@@', stream)
        //     video.srcObject = stream;
        //     video.setAttribute('playsinline', true);  // iOS対応
        //     video.play();
        //     requestAnimationFrame(tick);
        // });

        navigator.mediaDevices
            .getUserMedia({
                audio: false,
                video: {
                    facingMode: 'environment'
                }
            })
            .then((stream) => {
                console.log('stream', stream)
                video.srcObject = stream
                video.setAttribute('playsinline', true);  // iOS対応
                video.onloadedmetadata = () => {
                    video.play()
                    findQR()
                }
            })
            .catch(() => {
                showUnsuportedScreen()
            })
    }

    return {
        initCamera,
        findQR,
    }
})()

if (SQR.reader) SQR.reader.initCamera()
