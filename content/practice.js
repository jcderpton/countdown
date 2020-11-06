$('#coin').click(coin_toss);

function shuffle(a) {
    var n = a.length;

    for(var i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
}

function str_shuffle(s) {
    var a = s.split("");
    shuffle(a);
    return a.join("");
}

var clocktotal = 30;
var clockstep = 100;
var basevowels = "AAAAAAAAAAAAAAAEEEEEEEEEEEEEEEEEEEEEIIIIIIIIIIIIIOOOOOOOOOOOOOUUUUU";
var basecons = "BBCCCDDDDDDFFGGGHHJKLLLLLMMMMNNNNNNNNPPPPQRRRRRRRRRSSSSSSSSSTTTTTTTTTVWXYZ";

var target;
var numbers;
var numbersteps;
var numbertimeout;

var is_conundrum;
var conundrum_result;
var letteridx;
var clockinterval;
var clockrunning;
var clockpaused;
var clocksecs = clocktotal;
var nvowels;
var ncons;
var vowels, cons;
var letters;
var needreset;

var tracker1 = 0;
var tracker2 = 0;
var round = 0;
var turn;

var letter_results = [];
var display = 'display';
var current_answer;

var started = false;
var tossed = false;
var numbers_gened = false;
var coinsteps;
var coin = ["Heads", "Tails"];

var game;

$(this).keydown(function(event) { keyControl(event) });

reset();

function clock_start() {
    clearInterval(clockinterval);
    $('#music')[0].load();
	$('#music')[0].volume = 0.4;
    startclock();
}

function display_countdown() {
	var a = "COUNTDOWN".split('');
	for (i = 0; i < 9; i++)
		$('#conundrum' + (i+1)).html(a[i]);
}
	
function clock_pauseresume() {
    if (clockpaused) {
		if (is_conundrum) conundrum_display();
		
        $('#clock-pauseresume').text('Pause clock');
        clearInterval(clockinterval);
        clockinterval = setInterval(tickclock, clockstep);
        $('#music')[0].play();
        clockpaused = false;
    } else {
        $('#clock-pauseresume').text('Resume clock');
        clearInterval(clockinterval);
        $('#music')[0].pause();
        clockpaused = true;
    }
}

function coin_toss() {
	coinsteps = 30;
	
	toss_action();
}

function toss_action() {
    coinsteps--;

    if (coinsteps > 0) {
		coin.reverse();
		$('#coin').html(coin[0]);
        numbertimeout = setTimeout(toss_action, 100);
	} else {
		shuffle(coin);
		$('#coin').html(coin[0]);
		$('#start-one-button').prop('disabled', false);
		$('#start-two-button').prop('disabled', false);
	}
}

function startup(x) {
	$('#startup').css('display', 'none');
	$('#player1,#player2').prop('disabled', true);
	$('#score1,#score2').prop('disabled', false);
	vowels = str_shuffle(basevowels);
	cons = str_shuffle(basecons);
	$('#vowelnum').text(vowels.length);
	$('#consonantnum').text(cons.length);
	turn = x;
	next_round();
	started = true;
}

function scoreChange(id, amount) {
	if (!started)
		return;
		
	var x = 'tracker' + id
	window[x] += amount;
	$('#score' + id).html(window[x]);
}

function gennumbers(large) {
	if (game !== 'numbers' || numbers_gened) return;
	
    if (needreset)
        reset();

    var largenums = [25, 50, 75, 100];
    var smallnums = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10];

    shuffle(largenums);
    shuffle(smallnums);

    numbers = [];

    for (var i = 1; i <= large; i++)
        numbers.push(largenums[i-1]);

    for (var i = large+1; i <= 6; i++)
        numbers.push(smallnums[i-(large+1)]);
	
	numbers_gened = true;

    displaynumbers();
}

function displaynumbers() {
	if (numbers.length > 0) {
        $('#number' + numbers.length).html(numbers[numbers.length-1]);
        $('#number' + numbers.length).addClass('filled-tile');
        numbers = numbers.slice(0, numbers.length-1);
        numbertimeout = setTimeout(displaynumbers, 800);
	}
}

function gentarget() {
	if (target > 0) return;
	
	target = Math.floor(Math.random() * (899)) + 101;
	numbersteps = 30;
	
	addnumber();
}

function addnumber() {
    numbersteps--;

    if (numbersteps > 0) {
        randomtarget();
        numbertimeout = setTimeout(addnumber, 50);
    } else {
        $('#numbers-target').html(target);
    }
}

function randomtarget() {
    $('#numbers-target').html(Math.floor(Math.random() * (899)) + 101);
}

function switch_game(new_game) {
	game = new_game;
	$('#letters-game,#numbers-game,#conundrum-game').css('display', 'none');
	$('#' + game + '-game').css('display', 'inline-block');
	//renderbutton();
	clocksecs = clocktotal;
	stopclock();
	reset();
}

function addletter(vowel) {	
	if (game != 'letters' || letteridx > 9) return;
	
    if (needreset) reset();
	
	if (ncons == 6 && !vowel) return;
	if (nvowels == 5 && vowel) return;

    var letter = vowel ? getvowel() : getconsonant();

    $('#letter' + letteridx).html(letter);
	$('#letter' + letteridx).addClass('filled-tile');
	
	if (letteridx == 9)
		$('#clock-start').prop('disabled', false);
	
    letters += letter;
    letteridx++;

    /* at most 6 consonants; at most 5 vowels */
    if (vowel)
        nvowels++;
    else
        ncons++;
    if (ncons == 6)
        $('#consonant-button').prop('disabled', true);
    if (nvowels == 5)
        $('#vowel-button').prop('disabled', true);
}

function getvowel() {
    var c = vowels.substring(0, 1);
    vowels = vowels.substring(1);
    $('#vowelnum').text(vowels.length);
    return c;
}

function getconsonant() {
    var c = cons.substring(0, 1);
    cons = cons.substring(1);
    $('#consonantnum').text(cons.length);
    return c;
}

function conundrum() {
    var data = generate_conundrum();
    reset();
    result = [];
    solve_letters(data.toLowerCase(), function(word) { if (word.length == 9) result.push(word); });
    if (result.length == 1) {
		conundrum_string = data.toUpperCase()
        conundrum_result = result[0];
        a = data.toUpperCase().split("");
        letters = '';
        for (var i = 0; i < 9; i++) {
            $('#conundrum' + (i+1)).html(a[i]);
            letters += a[i];
        }
        letteridx = 9;
        is_conundrum = true;
		$('#conundrum-display').prop('disabled', false);
		$('#conundrum-correct').prop('disabled', false);
		$('#conundrum-incorrect').prop('disabled', false);
        clock_start();
    } else {
        conundrum();
    }
}

function conundrum_display() {
	var a = letters.split("")
	for (var i = 0; i < 9; i++) {
		$('#conundrum' + (i+1)).html(a[i]);
	}
}

function conundrum_correct() {
	if (clocksecs > 0)
        stopclock();
	
	var a = conundrum_result.toUpperCase().split("")
	for (var i = 0; i < 9; i++) {
		$('#conundrum' + (i+1)).html(a[i]);
	}
}

function conundrum_incorrect() {
	var a = "INCORRECT".split("")
	for (var i = 0; i < 9; i++) {
		$('#conundrum' + (i+1)).html(a[i]);
	}
}

function startclock() {
	if (!(letteridx > 9 || target > 0 || is_conundrum)) return;
	
    for (var i = 0; i <= 4; i++)
        $('#' + i + 'large').prop('disabled', true);

    $('#music')[0].play();

    clockpaused = false;
    clockinterval = setInterval(tickclock, clockstep);
    clocksecs = clocktotal;
    clockrunning = true;
    needreset = true;
    renderclock();
	printanswer();
}

function printanswer() {
	var answer;
	switch(game) {
		case "conundrum": answer = "Conundrum answer: " + conundrum_result; break;
		case "letters":	answer = lettersanswer(); break;
		case "numbers": answer = numbersanswer(); break;
	}
	var sep = "\n================================================\n"
	console.log(sep + answer + sep)
}

function lettersanswer() {
	var result = [];
	
	solve_letters(letters.toLowerCase(), function(word, c) { result.push([word, c]); });
	
	result.sort(function(a, b) {
		if (b[0].length != a[0].length)
			return b[0].length - a[0].length;
		else
			return b[1] - a[1];
	});
	
	var extralines = '';
	for (var i = result.length; i < 10; i++)
		extralines += "\n";
	
	letter_results = result.map(function(a) { return a[0] });
	
	return result.map(function(a) { return a[0].length + " - " + a[0]; }).join("\n");
}

function numbersanswer() {
	var numbers = [];
	
	for (var i = 1; i <= 6; i++)
		numbers.push(parseInt($('#number' + i).html()));
	
	return solve_numbers(numbers, target, false);
}

function stopclock() {
    $('#music')[0].load();
    $('#music')[0].pause();
	stop_action();
}

function stop_action() {
    for (var i = 0; i <= 4; i++)
        $('#' + i + 'large').prop('disabled', false);
    clearInterval(clockinterval);

    clockrunning = false;
}

function tickclock() {
    clocksecs -= clockstep / 1000;
    renderclock();

    if (clocksecs <= 0) {
        stop_action();
    }
}

function renderbutton() {
    var canvas = $('#target-button');
	var c = canvas.get()[0];
	var ctx = c.getContext('2d');
	var dim = canvas.width();
	var rad = dim/2;
	ctx.strokeStyle = '#000000';
	ctx.beginPath();
	ctx.arc(rad, rad, rad, 0, 2 * Math.PI);
	ctx.stroke();
}

function renderclock() {
    var canvas = $('#clock-canvas');
    var c = canvas.get()[0];
    var ctx = c.getContext("2d");
	
	var blue = 'rgb(52, 91, 159)';
	var clock_grey = 'rgb(220, 220, 220)';
	var clock_yellow = 'rgb(255, 255, 240)';

    // only count down the analogue clock when < 30 secs remain
    let secs = clocksecs;
    //if (secs > 30)
    //    secs = 30;

    $('#digitalclock').text(Math.round(clocksecs));

    /* parameters */
    var dim = canvas.width();
    var mid = dim/2;

    ctx.clearRect(0, 0, dim, dim);

    /* outer rings */
    ctx.beginPath();
    ctx.arc(mid, mid, mid-(dim/50), 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgb(127, 127, 127)'; // grey
    ctx.lineWidth = dim/50;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(mid, mid, mid-(mid * 5.6/100), 0, 2 * Math.PI);
    ctx.strokeStyle = blue;
    ctx.fillStyle = clock_grey;
    ctx.lineWidth = mid * 5.6/100;
    ctx.fill();
    ctx.stroke();

    /* lit-up area */
    var insideClock = mid * 8.8/100;

    //ctx.lineWidth = 7;
	var gradient = ctx.createRadialGradient(mid, mid, mid/2.5, mid, mid, mid);
	gradient.addColorStop(0, clock_grey);
	gradient.addColorStop(1, clock_yellow);
	
	ctx.strokeStyle = clock_grey;
    ctx.lineWidth = 1;
	ctx.fillStyle = gradient;
	
	var inc = Math.PI / 30;
	var start = 1.5 * Math.PI;
	
	ctx.beginPath();
	
    for (var a = 0; a <= (30 - secs); a++) {
		if (a == 0) continue;
		if (a == 16) start = 0;
		ctx.moveTo(mid, mid);
		ctx.arc(mid, mid, mid - insideClock - 1, start, start += inc);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
    }

    /* pips */
    ctx.strokeStyle = 'rgb(59, 56, 56)'; // grey
    ctx.lineWidth = mid * 1.6/100;
    ctx.fillStyle = 'rgb(255, 255, 255, 0.7)'; // white
    for (var a = 0; a < 60; a += 5) {
        // grey line
        ctx.beginPath();
        ctx.moveTo(
            mid + (mid - insideClock - (dim/25)) * Math.sin(Math.PI * 2 * a / 60),
            mid + (mid - insideClock - (dim/25)) * Math.cos(Math.PI * 2 * a / 60));
        ctx.lineTo(
            mid + (mid - insideClock - (dim/6)) * Math.sin(Math.PI * 2 * a / 60),
            mid + (mid - insideClock - (dim/6)) * Math.cos(Math.PI * 2 * a / 60));
        ctx.stroke();
        // white dot
        ctx.beginPath();
        ctx.arc(
            mid + (mid - 7) * Math.sin(Math.PI * 2 * a / 60),
            mid + (mid - 7) * Math.cos(Math.PI * 2 * a / 60),
            2,
            0,
            2 * Math.PI
        );
        ctx.fill();
    }

    /* weird cross thing */
    ctx.beginPath();
    ctx.lineWidth = mid/40;
    ctx.moveTo(mid, insideClock);
    ctx.lineTo(mid, dim - insideClock);
    ctx.moveTo(insideClock, mid);
    ctx.lineTo(dim - insideClock, mid);
    ctx.stroke();

    /* hand */
    ctx.fillStyle = blue;
    ctx.strokeStyle = 'rgb(127, 121, 109)'; // grey
    ctx.lineWidth = mid/20;
    ctx.beginPath();
    ctx.arc(
      mid,
      mid,
      mid/10,
      Math.PI * 2 * (-secs + 10) / 60,
      Math.PI * 2 * (-secs + 20) / 60,
      true
    );
	ctx.stroke();
	ctx.lineWidth = 2;
    ctx.lineTo(
        mid + (mid - insideClock - 5) * Math.sin((Math.PI * 2 * secs) / 60),
        mid + (mid - insideClock - 5) * Math.cos((Math.PI * 2 * secs) / 60)
    );
	ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function next_round() {	
	var scoreDiff = Math.abs(tracker1 - tracker2);
	
	if (round == 15 && scoreDiff == 0)
		round = 14;
	
	if (round > 0 && round < 16)
		$('#round' + round).removeClass('current-tile').removeClass('critical-tile').addClass('over-tile');

	round++;
	
	if (round > 15) {
		display_countdown();
		if (tracker1 > tracker2) {
			console.log('Result: ' + $('#player1').val() + ' wins!');
			$('#image2').css('border-color', 'white');
			$('#image1').css('border-color', '#33cc33');
		} else if (tracker2 > tracker1) {
			console.log('Result: ' + $('#player2').val() + ' wins!');
			$('#image1').css('border-color', 'white');
			$('#image2').css('border-color', '#33cc33');
		}
		return;
	} else if (round == 15 && scoreDiff < 10) {
		$('#round' + round).removeClass('round-tile').addClass('critical-tile');
	} else {
		$('#round' + round).removeClass('round-tile').addClass('current-tile');
	}
	
	$('#round' + round).prop('disabled', false);
	
	var r = $('#round' + round).text();
	switch(r) {
		case 'L': switch_game('letters'); break;
		case 'N': switch_game('numbers'); break;
		case 'C': switch_game('conundrum'); break;
	}
	
	$('#image1').css('border-color', 'white');
	$('#image2').css('border-color', 'white');
	
	if (round == 15) {
		console.log('Round 15/15 : Conundrum');
		return;
	}
	
	var player = $('#player' + turn).val();
	console.log('Round ' + round + '/15 : ' + player + ' - ' + game);
	$('#image' + turn).css('border-color', '#345b9f');

	if (turn == 1) {
		turn++;
	} else {
		turn--;
	}
}

function reset() {
    clearTimeout(numbertimeout);
	
	console.clear();

    needreset = false;
    is_conundrum = false;
	numbers_gened = false;

    stopclock();
    clearInterval(clockinterval);
    clocksecs = clocktotal;
    renderclock();

    letters = '';
    nvowels = 0;
    ncons = 0;
	target = 0;
	current_answer = '';
	letter_results = [];

    for (var i = 1; i <= 9; i++) {
        $('#letter' + i).html('');
		$('#letter' + i).removeClass('filled-tile');
	}
	
	for (var i = 1; i <= 9; i++) {
        $('#display' + i).html('');
		$('#display' + i).removeClass('filled-tile');
	}
	
    letteridx = 1;

    for (var i = 1; i <= 6; i++) {
        $('#number' + i).html('');
        $('#number' + i).html('').removeClass('filled-tile');
	}
	
    $('#numbers-target').html('000');
    for (var i = 0; i <= 4; i++)
        $('#' + i + 'large').prop('disabled', false);
}

function answer(word) {
	if (letter_results.length === 0 || clockrunning || word === current_answer) return;
	
	if(jQuery.inArray(word, letter_results) == -1) {
		console.log('Not present');
		return;
	}
	
	current_answer = word;
	
	var letters_arr = letters.split('');
	var word_arr = word.toUpperCase().split('').reverse();
	var length = word_arr.length;
		
	for (var i = 0; i < 9; i++) {
		$('#' + display + (i+1)).html('');
		$('#' + display + (i+1)).removeClass('filled-tile');
		
		if ((i + length) >= 9) {
			var a = word_arr.pop();
			var test = jQuery.inArray(a, letters_arr);
			if (test !== -1) letters_arr.splice(test, 1);
			
			$('#' + display + (i+1)).html(a);
			$('#' + display + (i+1)).addClass('filled-tile');
		}
	}
	
	if (display === 'letter') {
		display = 'display';
	} else {
		display = 'letter';
	}
	
	for (var i = 0; i < 9; i++){
		var check = $('#' + display + (i+1)).text();
		
		var test = jQuery.inArray(check, letters_arr);
		if (test === -1) {
			$('#' + display + (i+1)).html('');
			$('#' + display + (i+1)).removeClass('filled-tile');
		} else {
			letters_arr.splice(test, 1);
		}
	}
	
	if (letters_arr.length > 0) {
		for (var i = 0; i < 9; i++) {
			if (letters_arr.length === 0) break;
			
			var check = $('#' + display + (i+1)).text();
		
			if (check === '') {
				$('#' + display + (i+1)).html(letters_arr.pop());
				$('#' + display + (i+1)).addClass('filled-tile');
			}
		}
	}
}

function keyControl(event) {	
	switch(event.key) {
		case 'v': if (started && game === "letters") addletter(true); break;
		case 'c': if (started && game === "letters") addletter(false); break;
		case '0': if (started && game === "numbers") gennumbers(0); break;
		case '1':
			if (!started) {
				startup(1);
				break;
			}
			if (game === "numbers") gennumbers(1); break;
		case '2':
			if (!started) {
				startup(2);
				break;
			}
			if (game === "numbers") gennumbers(2); break;
		case '3': if (game === "numbers") gennumbers(3); break;
		case '4': if (game === "numbers") gennumbers(4); break;
		case 'E': if (game === "conundrum") conundrum_correct(); break;
		case 'e': if (game === "conundrum") conundrum_incorrect(); break;
		case ' ': if (clockrunning && game === "conundrum") clock_pauseresume(); break;
		case 'Enter':
			if (!started || needreset) break;
			
			if (game === 'conundrum') {
				conundrum();
				break;
			}
			
			if (game === 'numbers' && numbers_gened && target == 0) {
				gentarget();
				break;
			}
			
			if (!clockrunning) clock_start(); break;
		case 'n':
			if (!started || !needreset || clockrunning) break;
			
			next_round();
			break;
		case "{": scoreChange('1', -10); break;
		case "}": scoreChange('1', 10); break;
		case "[": scoreChange('1', -1); break;
		case "]": scoreChange('1', 1); break;
		case "@": scoreChange('2', -10); break;
		case "~": scoreChange('2', 10); break;
		case "'": scoreChange('2', -1); break;
		case "#": scoreChange('2', 1); break;
	}
}