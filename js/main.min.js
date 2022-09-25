if (!('webkitSpeechRecognition' in window)) {
	alert('Web Speech API is not supported by this browser. Upgrade to Chrome v.25 or later.')
}

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var recognition = new SpeechRecognition();
var recording = false;
var intentional_stop = false;
var is_finished_phrase = 0
var speech_heard = 0
var last_timestamp = 0
var last_phrase_timestamp = 0

// recognition.interimResults = true;


function runSpeechRecognition() {
	
	
	last_timestamp = new Date()
	last_phrase_timestamp = new Date()

	recognition.onerror = function(e) {
		if (e.error == 'no-speech') {
		}
		if (e.error == 'audio-capture') {
			alert('Check your browser to make sure that this site is allowed to use the mic.')
		}
		if (e.error == 'not-allowed') {
			alert('Check your browser to make sure that this site is allowed to use the mic.')
		}
	  };

	// This runs when the speech recognition service starts
	recognition.onstart = function() {
		console.log('onstart')
		recording = true
		$('.toggle_recording').html('Recording...').addClass('recording')
		
		if(speech_heard && is_finished_phrase) post_text(last_phrase)
		is_finished_phrase = 0
		speech_heard = 0
	
	};

	recognition.onspeechend = function() {
		console.log('phrase end')
		is_finished_phrase = 1
	}


	// This runs when the speech recognition service returns result
	recognition.onresult = function(e) {
		
		console.log('on result')
		
		speech_heard = 1

		for(x = 0; x < e.results.length; x++) {
			last_phrase = e.results[x][0].transcript
		}

		// Capitalize first letter
		last_phrase = last_phrase.replace(/\S/, function(m) { return m.toUpperCase(); });
		
		$('.current_text').html(last_phrase).show()

	};

	recognition.onend = function() {
		console.log('onend')

		if(!intentional_stop) {
			recognition.start();
			return
		}
		recording = false
		$('<div><span class="timestamp">'+ time() + '&nbsp;&nbsp; </span><span class="timestamp">Recording ended</span></div>').appendTo('.transcript').hide().slideDown()
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
		$('.record').last().hide().html('<span class="timestamp">' + time() + '&nbsp;&nbsp; </span><span class="text">' + $('.current_text').text() + '</span>')
		$('.record').last().slideDown()
		$('.transcript_container').animate({scrollTop: $('.transcript').height() - $('.transcript_container').height() + 200}, 600);
	}
}


// Convert current time to tidy format (eg. 12:34pm)
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

// Handle 'Record' button
$('.toggle_recording').click(function() {

	// Stop recording
	if (recording) {
		recording = 0
		intentional_stop = true
		recognition.stop();
		return;
	}

	// Start recording
	recording = 1
	intentional_stop = false
	$('.current_text').text("")
	$('<div><span class="timestamp">'+ time() + '&nbsp;&nbsp; </span><span class="timestamp">Recording started</span></div>').appendTo('.transcript').hide().slideDown()
	$('.message').html('Begin speaking and your words will added to the transcript with each pause.')
	setTimeout(function() {
		$('.message').html('')
	}, 3000)
	runSpeechRecognition()
})

// Allow 
$('body').on('click', '.record', function() {
	$(this).find('.text').attr('contenteditable', true).focus()
})

$('body').on('click', '.blur', function() {
	$(this).find('.text').removeAttr('contenteditable')
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

	window.getSelection().removeAllRanges();
	range = document.createRange();
	range.selectNode(document.getElementsByClassName('transcript')[0])
	window.getSelection().addRange(range);
	document.execCommand('copy');
	window.getSelection().removeAllRanges();

	setTimeout(function() {
		$('.copy_transcript').html('Copy Transcript')
		$('.message').html('')
	}, 3000)
})


$('.clear_transcript').click(function() {
	if(confirm("Are you sure you want to clear all transcript records?")) {
		$('.transcript').html("")
	}
})

$('.show_about').click(function() {
	$('.modal_mask').fadeIn(300)
	$('.about').delay(200).fadeIn(300)
})


$('.show_settings').click(function() {
	
	if($('body').hasClass('show_timestamps')) $('.show_timestamps').prop('checked', true)
	else $('.show_timestamps').prop('checked', false)
	
	if(recognition.interimResults) $('.show_realtime').prop('checked', true)
	else $('.show_realtime').prop('checked', false)
	
	$('.modal_mask').fadeIn(300)
	$('.settings').delay(200).fadeIn(300)
})

$('.modal_mask, .modal .close').click(function() {
	$('.modal_mask, .modal').fadeOut(300)
})

$('.show_timestamps').click(function() {
	$('body').toggleClass('show_timestamps')
	localStorage.setItem('transcribbler_show_timestamps', $('body').hasClass('show_timestamps'));
})

$('.show_realtime').click(function() {
	recognition.interimResults = !recognition.interimResults;
	localStorage.setItem('transcribbler_show_realtime', recognition.interimResults);
})



// Load settings from localStorage
if(localStorage.getItem('transcribbler_show_timestamps') && localStorage.getItem('transcribbler_show_timestamps') != "false") {
	$('body').addClass('show_timestamps')
}
if(localStorage.getItem('transcribbler_show_realtime') && localStorage.getItem('transcribbler_show_realtime') != "false") {
	recognition.interimResults = true
}
else {
	recognition.interimResults = false
}


$('body').on('keydown', function(e) {
	console.log(e)
	if(e.key == 'R' && e.shiftKey) $('.toggle_recording').click()
	if(e.key == 'c' && e.metaKey) $('.copy_transcript').click()
})

