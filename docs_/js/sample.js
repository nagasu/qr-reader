window.onload = ()=>{
	console.log("onload!!");

	let snd = new Howl({
		src: ["../assets/sample1.wav"],
		loop: false,
		volume: 1.0,
        sprite: {
            play1: [0, 10000], // 開始から3秒間を再生
            play2: [20000, 30000], // 開始3秒から1秒間再生
            play3: [40000, 50000], // 開始1分から5秒間再生
        },
		onplay: ()=>{
			console.log("サウンド再生!!");
		},
		onstop: ()=>{
			console.log("サウンド停止!!");
		},
		onpause: ()=>{
			console.log("サウンド一時停止!!");
		},
		onend: ()=>{
			console.log("サウンド終了!!");
		}
	});

	// Button
	$("#btn_play").click(()=>{
		snd.play();// サウンドの再生
	});

	$("#btn_stop").click(()=>{
		snd.stop();// サウンドの停止
	});

	$("#btn_pause").click(()=>{
		snd.pause();// サウンドの一時停止
	});

	$("#btn_play1").click(()=>{
        console.log("play1");
		snd.play('play1');
	});

	$("#btn_play2").click(()=>{
		snd.play('play2');
	});

	$("#btn_play3").click(()=>{
		snd.play('play3');
	});

	// Slider
	$("#ui_slider").slider({
		value: 0, min: 0, max: 100, step: 1,
		start: (e, ui)=>{
			snd.stop();// サウンドの停止
		},
		stop: (e, ui)=>{
			snd.seek(snd.duration() * (ui.value/100));// 再生時間を指定
			snd.play();// サウンドの再生
		}
	});

	// Time
	setInterval(()=>{
		if(!snd.playing()) return;

		const str = "再生時間:" + snd.seek() + "/" + snd.duration();
		$("#dsp_time").text(str);// 再生時間の表示

		const percent = Math.floor(snd.seek() / snd.duration() * 100);
		$("#ui_slider").slider("value", percent);// スライドバーの位置を指定
	}, 100);
}
