"use strict";

// Permite detectar si es un mac para que funcione webaudio API
if ('webkitAudioContext' in window) {
	var audioContext = new webkitAudioContext();
	console.log("webkit");
}
else {
	var audioContext = new AudioContext();
	console.log("normal");
}
window.onload = function() {
	var onOff = document.getElementById("on-off");
	var pl = document.getElementById("play");
	var ch = document.getElementById("check");
	var ascdes = document.getElementById("asc-desc");
	var span = document.getElementById("legend");
	var value = document.getElementById("value");
	var punt = document.getElementById("puntos");
	var bota = document.getElementById("bot-a");	
	var botb = document.getElementById("bot-b");	
	var txtdeb1 = document.getElementById("son1");
	var txtdeb2 = document.getElementById("son2");
	var txtnotA = document.getElementById("notAtxt");
	var txtnotB = document.getElementById("notBtxt");	
	var res = document.getElementById("resultado");
	// var divDeb = document.getElementById("divDebug");
	var puntos = 0;
	var intentos = 0;
	var intSounds = []; // Array que contiene los nombres de los ficheros
	var notas = [];
	var inicio;
	var index; // Indice que contiene el valor random del intervalo a reproducir
	var audioBuffer1, audioBuffer2; // buffers para almacenar el sonido a reproducir
	var selectedWaveform = "sawtooth";
	var waveformTypes = document.getElementsByTagName("li");
	var osc = false;


	var VF = Vex.Flow;

// Create an SVG renderer and attach it to the DIV element named "boo".
	var div = document.getElementById("pentagrama");
	var renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);

// Configure the rendering context.
	renderer.resize(500, 200);
	var context = renderer.getContext();
	var stave;
	var group;
	var voice;

	// El arrNotas es un array formado por 12 arrays (uno por cada nota de origen)
	// cada uno de esto 12 array tiene 13 arrays (uno por cada nota posible en cada intervalo)
	// cada uno de estos últimos tiene dos valores, uno para el # y otro para el bemol
	// Se direcciona arrNotas[inicio, inicio + index + 1, {0, 1}] En función de si existe el {0, 1}, se cogerá el correspondiente a arrNotas[inicio, 0, {0,1}]

	var arrNotas = [
	[["a/3","a/3"],["bb/3","bb/3"],["b/3","b/3"],["c/4","c/4"],["c#/4","c#/4"],["d/4","d/4"],["eb/4","eb/4"],["e/4","e/4"],["f/4","f/4"],["f#/4","f#/4"],["g/4","g/4"],["g#/4","g#/4"],["a/4","a/4"]],
	[["a#/3","bb/3"],["b/3",""],["","c/4"],["","db/4"],["","d/4"],["","eb/4"],["e/4",""],["","f/4"],["","gb/4"],["","g/4"],["","ab/4"],["","a/4"],["a#/4",""]],
	[["b/3","b/3"],["c/4","c/4"],["c#/4","c#/4"],["d/4","d/4"],["d#/4","d#/4"],["e/4","e/4"],["f/4","f/4"],["f#/4","f#/4"],["g/4","g/4"],["g#/4","g#/4"],["a/4","a/4"],["a#/4","a#/4"],["b/4","b/4"]],
	[["c/4","c/4"],["db/4","db/4"],["d/4","d/4"],["eb/4","eb/4"],["e/4","e/4"],["f/4","f/4"],["gb/4","gb/4"],["g/4","g/4"],["ab/4","ab/4"],["a/4","a/4"],["bb/4","bb/4"],["b/4","b/4"],["c/5","c/5"]],
	[["c#/4","db/4"],["d/4",""],["d#/4",""],["e/4",""],["","f/4"],["","gb/4"],["g/4",""],["","ab/4"],["a/4",""],["a#/4",""],["b/4",""],["","c/5"],["c#/5",""]],
	[["d/4","d/4"],["eb/4","eb/4"],["e/4","e/4"],["f/4","f/4"],["f#/4","f#/4"],["g/4","g/4"],["ab/4","ab/4"],["a/4","a/4"],["bb/4","bb/4"],["b/4","b/4"],["c/5","c/5"],["c#/5","c#/5"],["d/5","d/5"]],
	[["d#/4","eb/4"],["e/4",""],["","f/4"],["","gb/4"],["","g/4"],["","ab/4"],["a/4",""],["","bb/4"],["b/4",""],["","c/5"],["","db/5"],["","d/5"],["d#/5",""]],
	[["e/4","e/4"],["f/4","f/4"],["f#/4","f#/4"],["g/4","g/4"],["g#/4","g#/4"],["a/4","a/4"],["bb/4","bb/4"],["b/4","b/4"],["c/5","c/5"],["c#/5","c#/5"],["d/5","d/5"],["d#/5","d#/5"],["e/5","e/5"]],
	[["f/4","f/4"],["gb/4","gb/4"],["g/4","g/4"],["ab/4","ab/4"],["a/4","a/4"],["bb/4","bb/4"],["cb/4","cb/4"],["c/5","c/5"],["db/5","db/5"],["d/5","d/5"],["eb/5","eb/5"],["e/5","e/5"],["f/5","f/5"]],
	[["f#/4","gb/4"],["g/4",""],["","ab/4"],["a/4",""],["a#/4",""],["b/4",""],["c/5",""],["","db/5"],["d/5",""],["","eb/5"],["e/5",""],["","f/5"],["f#/5",""]],
	[["g/4","g/4"],["ab/4","ab/4"],["a/4","a/4"],["bb/4","bb/4"],["b/4","b/4"],["c/5","c/5"],["db/5","db/5"],["d/5","d/5"],["eb/5","eb/5"],["e/5","e/5"],["f/5","f/5"],["f#/5","f#/5"],["g/5","g/5"]],
	[["g#/4","ab/4"],["a/4",""],["","bb/4"],["b/4",""],["","c/5"],["","db/5"],["d/5",""],["d#/5",""],["e/5",""],["","f/5"],["","gb/5"],["","g/5"],["g#/5",""]]
	]

	// Oculta div debug
	divDebug.classList.add('hideDeb');	




	for (var i = 0; i < waveformTypes.length; i++) {
		waveformTypes[i].addEventListener("click", select, false);
	}

	ch.disabled = true;
	pl.disabled = true;
	punt.innerHTML = "<b>" + puntos + " PUNTOS</b>";
	// console.log(arrNotas[4][0 + 1][1] == "");

	cargaSonidosNot();
	// cargaNotas();
	creaPentagrama();
	// drawScore();




	function cargaSonidosInt() {
		intSounds[0] = "intervalos/2m.mp3";
		intSounds[1] = "intervalos/2Ma.mp3";
		intSounds[2] = "intervalos/3m.mp3";
		intSounds[3] = "intervalos/3Ma.mp3";
		intSounds[4] = "intervalos/4Aum.mp3";
		intSounds[5] = "intervalos/4J.mp3";
		intSounds[6] = "intervalos/5J.mp3";
		intSounds[7] = "intervalos/6m.mp3";
		intSounds[8] = "intervalos/6Ma.mp3";
		intSounds[9] = "intervalos/7m.mp3";
		intSounds[10] = "intervalos/7Ma.mp3";
		intSounds[11] = "intervalos/8J.mp3";
	}

	function cargaSonidosNot() {
		intSounds[0] = "intervalos/Notas/00A2.mp3";
		intSounds[1] = "intervalos/Notas/01As2.mp3";
		intSounds[2] = "intervalos/Notas/02B2.mp3";
		intSounds[3] = "intervalos/Notas/03C3.mp3";
		intSounds[4] = "intervalos/Notas/04Cs3.mp3";
		intSounds[5] = "intervalos/Notas/05D3.mp3";
		intSounds[6] = "intervalos/Notas/06Ds3.mp3";
		intSounds[7] = "intervalos/Notas/07E3.mp3";
		intSounds[8] = "intervalos/Notas/08F3.mp3";
		intSounds[9] = "intervalos/Notas/09Fs3.mp3";
		intSounds[10] = "intervalos/Notas/10G3.mp3";
		intSounds[11] = "intervalos/Notas/11Gs3.mp3";
		intSounds[12] = "intervalos/Notas/12A3.mp3";
		intSounds[13] = "intervalos/Notas/13As3.mp3";
		intSounds[14] = "intervalos/Notas/14B3.mp3";
		intSounds[15] = "intervalos/Notas/15C4.mp3";
		intSounds[16] = "intervalos/Notas/16Cs4.mp3";
		intSounds[17] = "intervalos/Notas/17D4.mp3";
		intSounds[18] = "intervalos/Notas/18Ds4.mp3";
		intSounds[19] = "intervalos/Notas/19E4.mp3";
		intSounds[20] = "intervalos/Notas/20F4.mp3";
		intSounds[21] = "intervalos/Notas/21Fs4.mp3";
		intSounds[22] = "intervalos/Notas/22G4.mp3";
		intSounds[23] = "intervalos/Notas/23Gs4.mp3";

	}	
/*
	function cargaNotas() {
		notas[0] = "a/3";
		notas[1] = "a#/3";
		notas[2] = "b/3";
		notas[3] = "c/4";
		notas[4] = "c#/4";
		notas[5] = "d/4";
		notas[6] = "d#/4";
		notas[7] = "e/4";
		notas[8] = "f/4";
		notas[9] = "f#/4";
		notas[10] = "g/4";
		notas[11] = "g#/4";
		notas[12] = "a/4";
		notas[13] = "a#/4";
		notas[14] = "b/4";
		notas[15] = "c/5";
		notas[16] = "c#/5";
		notas[17] = "d/5";
		notas[18] = "d#/5";
		notas[19] = "e/5";
		notas[20] = "f/5";
		notas[21] = "f#/5";
		notas[22] = "g/5";
		notas[23] = "g#/5";

	}	
*/


/*	setInterval(function() {
		if (!osc) {
			console.log("oscillator stopped");
		} else {
			freqSliderVal = document.getElementsByTagName("input")[1].value;
			osc.frequency.value = freqSliderVal;
			osc.type = selectedWaveform;
			value.innerHTML = freqSliderVal + " Hz";			
		}
	}, 50);*/

	onOff.addEventListener("click", function() {
		// inicializa los valores random para la nota inicial de 0 - 11
		// y para la nota final de 0 - 12. Consideramos válido el unísono
		inicio = Math.floor(Math.random() * 12);
		index = Math.floor(Math.random() * 13);
		console.log("index: " + index);
		console.log("inicio: " + inicio);
		var getSound1 = new XMLHttpRequest();
		getSound1.open("get",intSounds[inicio],true);
		getSound1.responseType = "arraybuffer";
		getSound1.onload = function() {
			audioContext.decodeAudioData(getSound1.response, function(buffer) {
				audioBuffer1 = buffer;
			})
		};
		getSound1.send();
		var getSound2= new XMLHttpRequest();
		getSound2.open("get",intSounds[index + inicio],true);
		getSound2.responseType = "arraybuffer";
		getSound2.onload = function() {
			audioContext.decodeAudioData(getSound2.response, function(buffer) {
				audioBuffer2 = buffer;
			})
		};
		getSound2.send();
		pl.disabled = false;
		ascdes.disabled = true;
		intervalOptions.classList.remove('respuesta');			
		res.innerHTML = " ";
		context.closeGroup();
		if (group) context.svg.removeChild(group);		
//		context.svg.removeChild(group);
		creaPentagrama();	
	//	playback();
	});

	ascdes.addEventListener("click", function() {
		if (ascdes.value == "Descendente") {
			ascdes.value = "Ascendente"
		}
		else {
			ascdes.value = "Descendente"
		}
	});

	bota.addEventListener("click", function() {
		debplay(audioBuffer1, 0);
		txtdeb1.innerHTML = intSounds[inicio];
	});	

	botb.addEventListener("click", function() {
		debplay(audioBuffer2, 0);
		txtdeb2.innerHTML = intSounds[index + inicio];
	});		


	pl.addEventListener("click", function() {
		if (ascdes.value == "Descendente") {
			playback(audioBuffer2, audioBuffer1);
		}
		else {
			playback(audioBuffer1, audioBuffer2);			
		}
		ch.disabled = false;
		pl.disabled = false;		
		// playback();
	});


	ch.addEventListener("click", function() {

		var a = document.getElementById("intervalOptions");
		
		console.log(a.options[a.selectedIndex].index);
		console.log(a.options[a.selectedIndex].value == index);
		console.log(res);
		if (intentos == 2) {
			res.innerHTML = "FALLASTE!";
			ch.disabled = true;
			pl.disabled = true;
			ascdes.disabled = false;			
			drawScore();
			a.options[index].selected = true;
			intervalOptions.classList.add('respuesta');			
			// drawScore(inicio, inicio + index + 1);
			intentos = 0;
			return;
		}		
		if (a.options[a.selectedIndex].value == index) {
			res.innerHTML= "CORRECTO";
			if (puntos == 0) {
				punt.innerHTML = "<b>" + ++puntos + " PUNTO</b>";
			}
			else {
				punt.innerHTML = "<b>" + ++puntos + " PUNTOS</b>";
			}

			ch.disabled = true;
			pl.disabled = true;
			ascdes.disabled = false;			
			drawScore();
			// drawScore(inicio, inicio + index + 1);
			intentos = 0;			
		}
		else {
			res.innerHTML = "Intentalo de nuevo! Te quedan <b>" + (3 - intentos - 1) + "</b> intentos";
			intentos++;
			console.log(intentos);
		}


	});

	function playback(a, b) {
		var playSound = audioContext.createBufferSource();
		playSound.buffer = a;
		playSound.connect(audioContext.destination);
		playSound.start(audioContext.currentTime);
		var playSound = audioContext.createBufferSource();		
		playSound.buffer = b;
		playSound.connect(audioContext.destination);
		playSound.start(audioContext.currentTime + 0.7);		
	}

	function debplay(a, t) {
		var playSound = audioContext.createBufferSource();
		playSound.buffer = a;
		playSound.connect(audioContext.destination);
		playSound.start(audioContext.currentTime + t);
	}	
/*
	function select() {
		var selectedWaveformElement = document.getElementById(this.id);
		// selectedWaveform = document.getElementById(this.id).id;
		selectedWaveform = selectedWaveformElement.id;
		console.log(selectedWaveform);
		for (var i = 0; i < waveformTypes.length; i++) {
			waveformTypes[i].classList.remove("selected-waveform");
			console.log(waveformTypes[i]);
		}
		console.log(selectedWaveformElement);		
		selectedWaveformElement.classList.add("selected-waveform");
		console.log(selectedWaveformElement);
	}
*/
	function creaPentagrama() {
		group = context.openGroup();
		context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");
		// Create a stave of width 400 at position 10, 40 on the canvas.
		stave = new VF.Stave(10, 40, 400);
		// Add a clef and time signature.
		stave.addClef("treble").addTimeSignature("2/4");
		stave.setClef("treble", "default", "8vb");		
		// Connect it to the rendering context and draw!
		stave.setContext(context).draw();
	}

	function drawScore() {	
		var notAB = [];
		notAB = queNotas();
		console.log("notas en drawScore");
		console.log(notAB[0]);
		console.log(notAB[1]);
		//debplay(audioBuffer1, 0);
		if (ascdes.value == "Descendente") {
			playback(audioBuffer2, audioBuffer1);
			notAB[2] = notAB[0];
			notAB[0] = notAB[1];
			notAB[1] = notAB[2];
		}
		else {
			playback(audioBuffer1, audioBuffer2);			
		}		
		if (notAB[0].charAt(1) == "b") {
			console.log("not1b");
			var not1 = [
			new VF.StaveNote({clef: "treble", keys: [notAB[0]], duration: "q" }).
			addAccidental(0, new VF.Accidental("b"))];
		}
		else if (notAB[0].charAt(1) == "#") {
			console.log("not1#");
			var not1 = [
			new VF.StaveNote({clef: "treble", keys: [notAB[0]], duration: "q" }).
			addAccidental(0, new VF.Accidental("#"))];
		}
		else {
			console.log("not1");
			var not1 = [			
			new VF.StaveNote({clef: "treble", keys: [notAB[0]], duration: "q" })];
		}

		//debplay(audioBuffer2, 0.7);

		if (notAB[1].charAt(1) == "b") {
			console.log("not2b");
			var not2 = [
			new VF.StaveNote({clef: "treble", keys: [notAB[1]], duration: "q" }).
			addAccidental(0, new VF.Accidental("b"))];
		}
		else if (notAB[1].charAt(1) == "#") {
			console.log("not2#");
			var not2 = [
			new VF.StaveNote({clef: "treble", keys: [notAB[1]], duration: "q" }).
			addAccidental(0, new VF.Accidental("#"))];
		}
		else {
			console.log("not2");
			var not2 = [
			new VF.StaveNote({clef: "treble", keys: [notAB[1]], duration: "q" })];
		}
		
/*
		if (notas[a].length == 4) {
			var not1 = [
			new VF.StaveNote({clef: "treble", keys: [notas[a]], duration: "q" }).
			addAccidental(0, new VF.Accidental("#"))];
		}
		else {
			var not1 = [
			new VF.StaveNote({clef: "treble", keys: [notas[a]], duration: "q" })];
		}

		if (notas[b].length == 4) {
			var not2 = [
			new VF.StaveNote({clef: "treble", keys: [notas[b]], duration: "q" }).
			addAccidental(0, new VF.Accidental("#"))];
		}
		else {
			var not2 = [
			new VF.StaveNote({clef: "treble", keys: [notas[b]], duration: "q" })];
		}

		*/

		voice = new VF.Voice({num_beats: 2,  beat_value: 4});
		voice.addTickables(not1);
		voice.addTickables(not2);

		// Format and justify the notes to 400 pixels.
		var formatter = new VF.Formatter().joinVoices([voice]).format([voice], 400);
		// Render voice
		voice.draw(context, stave);
//		context.closeGroup();
		// Then close the group: 
		notAB = queNotas();
		console.log(notAB[0]);
		console.log(notAB[1]);
		txtnotA.innerHTML = notAB[0];
		txtnotB.innerHTML = notAB[1];
	}

	function queNotas() {
		var notaA, notaB;
		var notAB = [];
		notaB = arrNotas[inicio][index][0];
		console.log("notaB");
		console.log(notaB);
		if (notaB > "") {
			notaA = arrNotas[inicio][0][0];
		}
		else {
			notaB = arrNotas[inicio][index][1];
			notaA = arrNotas[inicio][0][1];
		}
		notAB[0] = notaA;
		notAB[1] = notaB;
		return notAB;
	}
};

