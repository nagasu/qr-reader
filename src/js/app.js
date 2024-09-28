window.SQR = window.SQR || {}

let snd = null;
const playingList = [];
const PLAY_TIME = 5000; // 5秒

window.onload = ()=>{
    console.log("onload!!");

	snd = new Howl({
		src: ["../assets/sample1.wav"],
		loop: false,
		volume: 1.0,
        sprite: {
            play1: [0, PLAY_TIME],
            play2: [10000, PLAY_TIME],
            play3: [20000, PLAY_TIME],
        },
		onplay: ()=>{
			console.log("サウンド再生");
		},
		onend: ()=>{
			console.log("サウンド終了");
		}
	});
}

SQR.reader = (() => {
    /**
     * getUserMedia()に非対応の場合は非対応の表示をする
     */
    const showUnsuportedScreen = () => {
        document.querySelector('#js-unsupported').classList.add('is-show')
    }
    if (!navigator.mediaDevices) {
        showUnsuportedScreen()
        return
    }

    const video = document.querySelector('#js-video')

    /**
     * videoの出力をCanvasに描画して画像化 jsQRを使用してQR解析
     */
    const checkQRUseLibrary = () => {
        const canvas = document.querySelector('#js-canvas')
        const ctx = canvas.getContext('2d')
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
                        soundPlay(barcode.data);
                    }
                }
                setTimeout(checkQRUseBarcodeDetector, 200)
            })
            .catch(() => {
                console.error('Barcode Detection failed, boo.')
            })
    }

    const soundPlay = (data) => {
        if (!data.startsWith('play')) {
            return
        }

        if (!playingList.includes(data)) {
            playingList.push(data);
            snd.play(data);

            // 5秒後に再度読み込めるようにする
            setTimeout(() => {
                playingList.splice(playingList.indexOf(data), 1);
            }, PLAY_TIME)
        }
    }

    /**
     * BarcodeDetector APIを使えるかどうかで処理を分岐
     */
    const findQR = () => {
        window.BarcodeDetector
            ? checkQRUseBarcodeDetector()
            : checkQRUseLibrary()
    }

    /**
     * デバイスのカメラを起動
     */
    const initCamera = () => {
        navigator.mediaDevices
            .getUserMedia({
                audio: false,
                video: {
                    facingMode: {
                        exact: 'environment',
                    },
                },
            })
            .then((stream) => {
                video.srcObject = stream
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

SQR.modal = (() => {
    const result = document.querySelector('#js-result')
    const link = document.querySelector('#js-link')
    const copyBtn = document.querySelector('#js-copy')
    const modal = document.querySelector('#js-modal')
    const modalClose = document.querySelector('#js-modal-close')

    /**
     * 取得した文字列を入れ込んでモーダルを開く
     */
    const open = (url) => {
        result.value = url
        link.setAttribute('href', url)
        modal.classList.add('is-show')
    }

    /**
     * モーダルを閉じてQR読み込みを再開
     */
    const close = () => {
        modal.classList.remove('is-show')
        SQR.reader.findQR()
    }

    const copyResultText = () => {
        result.select()
        document.execCommand('copy')
    }

    copyBtn.addEventListener('click', copyResultText)

    modalClose.addEventListener('click', () => close())

    return {
        open,
    }
})()

if (SQR.reader) SQR.reader.initCamera()
