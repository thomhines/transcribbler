

if (!('webkitSpeechRecognition' in window)) {
	alert('Web Speech API is not supported by this browser. Upgrade to Chrome v.25 or later.')
}

// $('.transcript').html('')

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var recognition = new SpeechRecognition();
var recording = false;
var intentional_stop = false;



// let is_new_phrase = 1
let is_finished_phrase = 0
let speech_heard = 0
let last_timestamp = 0
let last_phrase_timestamp = 0
// let ignore_onend = 0

function runSpeechRecognition() {
	// get output div reference
	// var output = document.getElementById("output");
	// // get action element reference
	// var action = document.getElementById("action");
	// new speech recognition object
	// recognition.continuous = true;
	recognition.interimResults = true;
	
	last_timestamp = new Date()
	last_phrase_timestamp = new Date()

	recognition.onerror = function(e) {
		// console.log(e);

		if (e.error == 'no-speech') {
		//   start_img.src = 'mic.gif';
		//   showInfo('info_no_speech');
			// ignore_onend = true;
		}
		if (e.error == 'audio-capture') {
		//   start_img.src = 'mic.gif';
		//   showInfo('info_no_microphone');
		//   ignore_onend = true;
			console.log('no mic')
			alert('Check your browser to make sure that this site is allowed to use the mic.')
		}
		if (e.error == 'not-allowed') {
			console.log('not allowed');
			alert('Check your browser to make sure that this site is allowed to use the mic.')
/*
		  if (event.timeStamp - start_timestamp < 100) {
			showInfo('info_blocked');
		  } else {
			showInfo('info_denied');
		  }
		  ignore_onend = true;
*/
		}
	  };

	// This runs when the speech recognition service starts
	recognition.onstart = function() {
		console.log('onstart')
		recording = true
		$('.toggle_recording').html('Recording...').addClass('recording')
	// 	action.innerHTML = "<small>listening, please speak...</small>";
		// is_new_phrase = 1
		
		if(speech_heard && is_finished_phrase) post_text(last_phrase)
		is_finished_phrase = 0
		speech_heard = 0
	
	};

	recognition.onspeechend = function() {
		console.log('phrase end')
		// action.innerHTML = "<small>stopped listening, hope you are done...</small>";
		// 	recognition.stop();
		// console.log(ignore_onend)
		// if(is_new_phrase && !ignore_onend) post_text(last_phrase)
		// last_phrase = ""
		// is_new_phrase = 0
		is_finished_phrase = 1
		// ignore_onend = 1
		
		// Don't post if there was no onresult since last finished phrase

	}


	// This runs when the speech recognition service returns result
	recognition.onresult = function(e) {
		
		console.log('on result')
		// if(last_phrase) console.log(last_phrase)
		
		speech_heard = 1
		// ignore_onend = 0

		for(x = 0; x < e.results.length; x++) {
			last_phrase = e.results[x][0].transcript
			// console.log(x, e.results[x][0].transcript)
		}

		// capitalize first letter
		last_phrase = last_phrase.replace(/\S/, function(m) { return m.toUpperCase(); });

		// if()
		// $('.current_text').fadeOut().promise().then(function() {
		// 	$('.current_text').html(last_phrase).show()
		// })
		
		$('.current_text').html(last_phrase).show()

		

		


		// var transcript = event.results[0][0].transcript;
		// var confidence = event.results[0][0].confidence;
		// output.innerHTML = "<b>Text:</b> " + transcript + "<br/> <b>Confidence:</b> " + confidence*100+"%";
		// output.classList.remove("hide");
	};

	recognition.onend = function() {
		console.log('onend')

		if(!intentional_stop) {
			recognition.start();
			return
		}
		



		console.log('recording end')
		recording = false
		$('<div class="timestamp">'+ time() + ' - Recording ended</div>').appendTo('.transcript').hide().slideDown()
		$('.toggle_recording').html('Start recording').removeClass('recording')
	}

	 // start recognition
	 recognition.start();
}



function post_text(last_phrase) {
	
	if($('.current_text').text().trim() != "") {
		// Show a timestamp if there hasn't been a timestamp for 10 minutes or if there is a 2 minute pause between phrases
		if((new Date()) - last_timestamp > 600000 || (new Date()) - last_phrase_timestamp > 120000) {
			$('.transcript').append('<div class="timestamp">' + time() + '</div>')
			last_timestamp = new Date()
		}
		last_phrase_timestamp = new Date()
		
		$('.transcript').append('<div class="record" time="' + time() + '"></div>')
		$('.record').last().hide().html('<span class="timestamp">' + time() + '&nbsp;&nbsp;</span> ' + $('.current_text').text())
		$('.record').last().slideDown()
		$('.transcript_container').animate({scrollTop: $('.transcript').height() - $('.transcript_container').height() + 200}, 600);
	}
	

	// $('.current_text').fadeOut().promise().then(function() {
	// 	$('.current_text').html(last_phrase).show()
	// })
}

function time() {
	let time = new Date();
	let hours = time.getHours()
	
	let ampm = 'am'
	if(hours >= 12) {
		ampm = 'pm'
	}
	if(hours > 12) {
		hours = hours - 12
	}
	if(hours == 0) hours = 12
	return hours + ":" + ("0" + time.getMinutes()).slice(-2) + ampm

}


$('.toggle_recording').click(function() {

	// Stop recording
	if (recording) {
		post_text("")
		intentional_stop = true
		recognition.stop();
		return;
	}

	// Start recording
	intentional_stop = false
	$('<div class="timestamp">'+ time() + ' - Recording started</div>').appendTo('.transcript').hide().slideDown()
	$('.message').html('Begin speaking and your words will added to the transcript with each pause.')
	setTimeout(function() {
		$('.message').html('')
	}, 3000)
	runSpeechRecognition()
})


$('body').on('click', '.record', function() {
	$(this).attr('contenteditable', true).focus()
})

$('body').on('click', '.blur', function() {
	$(this).removeAttr('contenteditable')
})

$('body').on('keydown', '.record', function(e) {
	if(e.key == 'Enter') {
		e.preventDefault()
		e.stopPropagation()
		$(this).removeAttr('contenteditable')
	}
})




function post_typed_text() {
	$('.current_text').hide()
	post_text("")
	setTimeout(function() {
		$('.current_text').focus()
	}, 40)
}

$('.post_text').click(function() {
	post_typed_text()
})

$('.current_text').on('keydown', function(e) {
	if(e.key == 'Enter') {
		e.preventDefault()
		e.stopPropagation()
		post_typed_text()
	}
})


$('.copy_transcript').click(function() {
	$('.message').html('Transcript has been copied.')
	$('.copy_transcript').html('Copied!')

	// navigator.clipboard.writeText(cleaned_transcript);
	window.getSelection().removeAllRanges();
	// let
	range = document.createRange();
	// range.selectNode(typeof element === 'string' ? document.getElementById(element) : element);
	range.selectNode(document.getElementsByClassName('transcript')[0])
	window.getSelection().addRange(range);
	document.execCommand('copy');
	window.getSelection().removeAllRanges();

	setTimeout(function() {
		$('.copy_transcript').html('Copy Transcript')
		$('.message').html('')
	}, 3000)
})

$('.show_about').click(function() {
	$('.modal_mask').fadeIn(300)
	$('.about').delay(200).fadeIn(300)
})


$('.show_settings').click(function() {
	$('.modal_mask').fadeIn(300)
	$('.settings').delay(200).fadeIn(300)
})

$('.modal_mask, .modal .close').click(function() {
	$('.modal_mask, .modal').fadeOut(300)
})

$('.show_timestamps').click(function() {
	$('body').toggleClass('show_timestamps')
})

$('.show_realtime').click(function() {
	recognition.interimResults = !recognition.interimResults;
})


$('body').on('keydown', function(e) {
	console.log(e)
	if(e.key == 'R' && e.shiftKey) $('.toggle_recording').click()
	if(e.key == 'c' && e.metaKey) $('.copy_transcript').click()
})

