$('#start-one-button').click(function() { startup(1); });
$('#start-two-button').click(function() { startup(2); });
$('#coin').click(coin_toss);

$('#letters-switch').click(letters_switch);
$('#numbers-switch').click(numbers_switch);
$('#conundrum-switch').click(conundrum_switch);

$('#next-round').click(next_round);

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

var started = false;
var tossed = false;
var coinsteps;
var coin = ["Heads", "Tails"];

var game;

$(this).keydown(function(event) { keyControl(event) });

$('#vowel-button').click(function() {
    addletter(true);
});
$('#consonant-button').click(function() {
    addletter(false);
});
$('#letters-reset-button').click(reset);
$('#halt-clock').click(stopclock);

$('#conundrum-button').click(conundrum);
$('#conundrum-correct').click(conundrum_correct);
$('#conundrum-incorrect').click(conundrum_incorrect);
$('#conundrum-reset-button').click(reset);

$('#0large').click(function() { gennumbers(0); });
$('#1large').click(function() { gennumbers(1); });
$('#2large').click(function() { gennumbers(2); });
$('#3large').click(function() { gennumbers(3); });
$('#4large').click(function() { gennumbers(4); });
$('#target-generator-btn').click(gentarget);
$('#numbers-reset-button').click(reset);

$('#clock-start').click(function() {
    clearInterval(clockinterval);
    $('#music')[0].load();
	$('#music')[0].volume = 0.2;
    startclock();
});
$('#clock-pauseresume').click(function() {
    if (clockpaused) {
		if (is_conundrum)
			conundrum_display();
		
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
});

letters_switch();
display_cntdwn();
$('#selectionbox').css('display', 'none');
$('#letter-buttons').css('display', 'none');
$('#start-one-button').prop('disabled', true);
$('#start-two-button').prop('disabled', true);

function display_cntdwn() {
	var a = "COUNTDOWN".split("")
	for (var i = 0; i < 9; i++) {
		$('#letter' + (i+1)).html(a[i]);
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
	$('#switches,#game_tracker').css('display', 'block');
	$('#startup').css('display', 'none');
	$('#input1').prop('disabled', true);
	$('#input2').prop('disabled', true);
	$('#player1').prop('disabled', true);
	$('#player2').prop('disabled', true);
	$('#player2').prop('disabled', true);
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
    if (needreset)
        reset();
	
	if (game != 'numbers') return;

    var largenums = [25, 50, 75, 100];
    var smallnums = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10];

    shuffle(largenums);
    shuffle(smallnums);

    numbers = [];

    for (var i = 1; i <= large; i++)
        numbers.push(largenums[i-1]);

    for (var i = large+1; i <= 6; i++)
        numbers.push(smallnums[i-(large+1)]);

    displaynumbers();
}

function displaynumbers() {
	if (numbers.length > 0) {
        $('#number' + numbers.length).html(numbers[numbers.length-1]);
        numbers = numbers.slice(0, numbers.length-1);
        numbertimeout = setTimeout(displaynumbers, 800);
	} else {
		$('#target-generator-btn').prop('disabled', false);
	}
}

function gentarget() {
	$('#target-generator-btn').prop('disabled', true);
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
		$('#clock-start').prop('disabled', false);
    }
}

function randomtarget() {
    $('#numbers-target').html(Math.floor(Math.random() * (899)) + 101);
}

function letters_switch() {
    $('#letters-switch').removeClass('btn-light').addClass('btn-primary');
    $('#numbers-switch').removeClass('btn-primary').addClass('btn-light');
    $('#conundrum-switch').removeClass('btn-light').addClass('btn-light');
    $('#letters-game,#letter-buttons').css('display', 'block');
    $('#numbers-game,#number-buttons,#conundrum-buttons').css('display', 'none');
	$('#selectionbox').css('display', 'inline-block');
    clocksecs = clocktotal;
    stopclock();
	game = "letters";
    reset();
}

function conundrum_switch() {
    $('#conundrum-switch').removeClass('btn-light').addClass('btn-primary');
    $('#numbers-switch').removeClass('btn-primary').addClass('btn-light');
    $('#letters-switch').removeClass('btn-primary').addClass('btn-light');
    $('#letters-game,#conundrum-buttons').css('display', 'block');
    $('#numbers-game,#number-buttons,#letter-buttons,#selectionbox').css('display', 'none');
    clocksecs = clocktotal;
    stopclock();
	game = "conundrum";
    reset();
}

function numbers_switch() {
    $('#numbers-switch').removeClass('btn-light').addClass('btn-primary');
    $('#letters-switch').removeClass('btn-primary').addClass('btn-light');
    $('#conundrum-switch').removeClass('btn-light').addClass('btn-light');
    $('#numbers-game,#number-buttons').css('display', 'block');
    $('#letters-game,#letter-buttons,#conundrum-buttons').css('display', 'none');
    clocksecs = clocktotal;
    stopclock();
	game = "numbers";
    reset();
}

function addletter(vowel) {
    if (needreset)
        reset();
	
	if (game != 'letters' || letteridx > 9) return;

    var letter = vowel ? getvowel() : getconsonant();

    $('#letter' + letteridx).html(letter);
	
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
            $('#letter' + (i+1)).html(a[i]);
            letters += a[i];
        }
        letteridx = 9;
        is_conundrum = true;
		$('#conundrum-display').prop('disabled', false);
		$('#conundrum-correct').prop('disabled', false);
		$('#conundrum-incorrect').prop('disabled', false);
        startclock();
    } else {
        conundrum();
    }
}

function conundrum_display() {
	var a = letters.split("")
	for (var i = 0; i < 9; i++) {
		$('#letter' + (i+1)).html(a[i]);
	}
}

function conundrum_correct() {
	if (clocksecs > 0)
        stopclock();
	
	var a = conundrum_result.toUpperCase().split("")
	for (var i = 0; i < 9; i++) {
		$('#letter' + (i+1)).html(a[i]);
	}
}

function conundrum_incorrect() {
	var a = "INCORRECT".split("")
	for (var i = 0; i < 9; i++) {
		$('#letter' + (i+1)).html(a[i]);
	}
}

function startclock() {
	if (!(letteridx > 9 || target > 0 || is_conundrum)) return;
	
    $('#vowel-button').prop('disabled', true);
    $('#consonant-button').prop('disabled', true);
    $('#conundrum-button').prop('disabled', true);
    for (var i = 0; i <= 4; i++)
        $('#' + i + 'large').prop('disabled', true);
	$('#next-round').prop('disabled', false);
    $('#halt-clock').prop('disabled', false);

    $('#music')[0].play();

    clockpaused = false;
	$('#clock-pauseresume').prop('disabled', false);
    $('#clock-pauseresume').text('Pause clock');
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
    $('#vowel-button').prop('disabled', false);
    $('#consonant-button').prop('disabled', false);
    $('#conundrum-button').prop('disabled', false);
    for (var i = 0; i <= 4; i++)
        $('#' + i + 'large').prop('disabled', false);
    clearInterval(clockinterval);

    $('#halt-clock').prop('disabled', true);

    clockrunning = false;
}

function tickclock() {
    clocksecs -= clockstep / 1000;
    renderclock();

    if (clocksecs <= 0) {
        stop_action();
    }
}

function renderclock() {
    var canvas = $('#clock-canvas');
    var c = canvas.get()[0];
    var ctx = c.getContext("2d");

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
    ctx.arc(mid, mid, mid-5, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgb(127, 127, 127)'; // grey
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(mid, mid, mid-7, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgb(34, 81, 103)'; // dark blue
    ctx.fillStyle = 'rgb(255, 255, 218)'; // light yellow
    ctx.lineWidth = 7;
    ctx.fill();
    ctx.stroke();

    /* lit-up area */
    var insideClock = 11;

    ctx.strokeStyle = 'rgb(251, 245, 88)'; // bright yellow
    ctx.lineWidth = 7;
    for (var a = 0; a <= (30 - secs); a++) {
        if (a % 15 == 0)
            continue;
        ctx.beginPath();
        ctx.moveTo(
            mid + (mid - insideClock - 2) * Math.sin(Math.PI * 2 * a / 60),
            mid - (mid - insideClock - 2) * Math.cos(Math.PI * 2 * a / 60));
        ctx.lineTo(
            mid + (mid - insideClock - 40) * Math.sin(Math.PI * 2 * a / 60),
            mid - (mid - insideClock - 40) * Math.cos(Math.PI * 2 * a / 60));
        ctx.stroke();
    }

    /* pips */
    ctx.strokeStyle = 'rgb(59, 56, 56)'; // grey
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgb(255, 255, 255, 0.7)'; // white
    for (var a = 0; a < 60; a += 5) {
        // grey line
        ctx.beginPath();
        ctx.moveTo(
            mid + (mid - insideClock - 1) * Math.sin(Math.PI * 2 * a / 60),
            mid + (mid - insideClock - 1) * Math.cos(Math.PI * 2 * a / 60));
        ctx.lineTo(
            mid + (mid - insideClock - 40) * Math.sin(Math.PI * 2 * a / 60),
            mid + (mid - insideClock - 40) * Math.cos(Math.PI * 2 * a / 60));
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
    ctx.lineWidth = 3;
    ctx.moveTo(mid, insideClock);
    ctx.lineTo(mid, dim - insideClock);
    ctx.moveTo(insideClock, mid);
    ctx.lineTo(dim - insideClock, mid);
    ctx.stroke();

    /* hand */
    ctx.fillStyle = 'rgb(31, 71, 132)'; // blue
    ctx.strokeStyle = 'rgb(127, 121, 109)'; // grey
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(
      mid,
      mid,
      8,
      Math.PI * 2 * (-secs + 10) / 60,
        Math.PI * 2 * (-secs + 20) / 60,
      true
    );
    ctx.lineTo(
        mid + (mid - insideClock - 5) * Math.sin((Math.PI * 2 * secs) / 60),
        mid + (mid - insideClock - 5) * Math.cos((Math.PI * 2 * secs) / 60)
    );
    ctx.fill();
    ctx.stroke();
}

function next_round() {
	//if (started && !needreset) return;
	
	var scoreDiff = Math.abs(tracker1 - tracker2);
	
	if (round > 0 && round < 16) {
		$('#round' + round).prop('disabled', true);
		$('#round' + round).removeClass('btn-info').addClass('btn-secondary');
	}

	round++;
	
	if (round > 15) {
		display_cntdwn();
		if (tracker1 > tracker2) {
			console.log('Result: ' + $('#player1') + ' wins!');
			$('#image2').css('border-color', 'white');
			$('#image1').css('border-color', '#33cc33');
		} else if (tracker2 > tracker1) {
			console.log('Result: ' + $('#player2') + ' wins!');
			$('#image1').css('border-color', 'white');
			$('#image2').css('border-color', '#33cc33');
		} else {
			console.log('Result is a draw!?');
			$('#image2').css('border-color', '#ff9933');
			$('#image1').css('border-color', '#ff9933');
		}
		return;
	} else if (round == 15 && scoreDiff < 10) {
		$('#round' + round).removeClass('btn-light').addClass('btn-danger');
	} else {
		$('#round' + round).removeClass('btn-light').addClass('btn-info');
	}
	
	$('#round' + round).prop('disabled', false);
	
	var r = $('#round' + round).text();
	switch(r) {
		case 'L': $('#letters-switch').click(); break;
		case 'N': $('#numbers-switch').click(); break;
		case 'C': $('#conundrum-switch').click(); break;
	}
	
	$('#image1').css('border-color', 'white');
	$('#image2').css('border-color', 'white');
	
	if (round == 15) return;
	
	var player = $('#player' + turn).val();
	console.log(player + ' - ' + game);
	$('#image' + turn).css('border-color', '#3399ff');

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

    stopclock();
    clearInterval(clockinterval);
    clocksecs = clocktotal;
    renderclock();

    letters = '';
    nvowels = 0;
    ncons = 0;
	target = 0;

	$('#clock-start').prop('disabled', true);
	$('#clock-pauseresume').prop('disabled', true);
    $('#vowel-button').prop('disabled', false);
    $('#consonant-button').prop('disabled', false);
    $('#conundrum-button').prop('disabled', false);
    $('#conundrum-display').prop('disabled', true);
    $('#conundrum-correct').prop('disabled', true);
    $('#conundrum-incorrect').prop('disabled', true);
	$('#target-generator-btn').prop('disabled', true);
	$('#next-round').prop('disabled', true);

    for (var i = 1; i <= 9; i++)
        $('#letter' + i).html('');
    letteridx = 1;

    for (var i = 1; i <= 6; i++)
        $('#number' + i).html('');
    $('#numbers-target').html('000');
    for (var i = 0; i <= 4; i++)
        $('#' + i + 'large').prop('disabled', false);
}

function keyControl(event) {
	if (!started) return;
	
	switch(event.key) {
		case 'Escape': reset(); break;
		case 'E':
			if (game === "conundrum")
				$('#conundrum-correct').click();
			
			break;
		case 'e':
			if (game === "conundrum")
				$('#conundrum-incorrect').click();
			
			break;
		case ' ':
			if (started)
				if (!clockrunning) {
					$('#clock-start').click();
				} else {
					$('#clock-pauseresume').click();
				}
			
			break;
		case 'Tab':
			$('#next-round').click();
			
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