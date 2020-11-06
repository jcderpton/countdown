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

var basevowels = "AAAAAAAAAAAAAAAEEEEEEEEEEEEEEEEEEEEEIIIIIIIIIIIIIOOOOOOOOOOOOOUUUUU";
var basecons = "BBCCCDDDDDDFFGGGHHJKLLLLLMMMMNNNNNNNNPPPPQRRRRRRRRRSSSSSSSSSTTTTTTTTTVWXYZ";
var vowels,cons;

var target;
var numbers;
var numbersteps;
var numbertimeout;

var is_conundrum;
var conundrum_result;
var letteridx;
var nvowels;
var ncons;
var letters;

var round = 0;

var started = false;
var ended = false;

var letter_results = [];
var display = 'display';
var current_answer;

var numbers_gened = false;

var game;

$(this).keydown(function(event) { gameControl(event) });

function display_word(input) {
	var a = input.toUpperCase().split('');
	
	for (var i = 0; i < 9; i++) {
        $('#panel' + (i+1)).html(a[i]);
	}
}

function gennumbers(large) {
	if (game !== 'numbers' || numbers_gened) return;
	
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
        $('#pnum' + numbers.length).html(numbers[numbers.length-1]);
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
        $('#numbers-target,#display-target').html(target);
    }
}

function randomtarget() {
    $('#numbers-target').html(Math.floor(Math.random() * (899)) + 101);
}

function switch_game(new_game) {
	game = new_game;
	if (game === 'numbers') {
		$('#letter_display').css('display', 'none');
		$('#number_display').css('display', 'block');
		$('#display-target-box').css('display', 'inline-block');
	} else {
		$('#letter_display').css('display', 'block');
		$('#number_display,#display-target-box').css('display', 'none');
	}
	clear_game();
}

function addletter(vowel) {	
	if (game != 'letters' || letteridx > 9) return;
		
	if (ncons == 6 && !vowel) return;
	if (nvowels == 5 && vowel) return;

    var letter = vowel ? getvowel() : getconsonant();

	$('#panel' + letteridx).html(letter);
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
            $('#panel' + (i+1)).html(a[i]);
            letters += a[i];
        }
        letteridx = 9;
        is_conundrum = true;
        clock_start();
    } else {
        conundrum();
    }
}

function conundrum_display() {
	var a = letters.split("")
	for (var i = 0; i < 9; i++) {
		$('#panel' + (i+1)).html(a[i]);
	}
}

function conundrum_correct() {
	if (clocksecs > 0)
        stopclock();
	
	var a = conundrum_result.toUpperCase().split("")
	for (var i = 0; i < 9; i++) {
		$('#panel' + (i+1)).html(a[i]);
	}
}

function conundrum_incorrect() {
	var a = "INCORRECT".split("")
	for (var i = 0; i < 9; i++) {
		$('#panel' + (i+1)).html(a[i]);
	}
}


function next_round() {
	if (round == 15) {
		round = 14;
	}
	
	if (round > 0 && round < 16)
		$('#round' + round).removeClass('current-tile').removeClass('critical-tile').addClass('over-tile');

	round++;

	$('#round' + round).removeClass('round-tile').addClass('current-tile');
	
	$('#round' + round).prop('disabled', false);
	
	var r = $('#round' + round).text();
	switch(r) {
		case 'L': switch_game('letters'); break;
		case 'N': switch_game('numbers'); break;
		case 'C': switch_game('conundrum'); break;
	}
		
	console.log('Round ' + round + '/15 : ' + game);
}

function clear_game() {
    clearTimeout(numbertimeout);
	
	console.clear();

	numbers_gened = false;

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
        $('#pnum' + i).html('');
        $('#number' + i).html('');
        $('#number' + i).html('').removeClass('filled-tile');
	}
	
    $('#numbers-target').html('000');
    for (var i = 0; i <= 4; i++)
        $('#' + i + 'large').prop('disabled', false);
	
	display_word('countdown');
	reset();
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

function startup(x) {
	$('#player1,#player2').prop('disabled', true);
	vowels = str_shuffle(basevowels);
	cons = str_shuffle(basecons);
	$('#vowelnum').text(vowels.length);
	$('#consonantnum').text(cons.length);
	started = true;
	next_round();
}

function gameControl(event) {	
	switch(event.key) {
		case '$': if (!started) startup(); break;
		case 'Enter':
			if (!started || needreset) break;
			
			if (game === 'conundrum') {
				conundrum();
				break;
			}
			
			if (game === 'numbers') {
				if (!numbers_gened) break;
				
				if (target === 0) {
					gentarget();
				} else {
					clock_start();
				}
				break;
			}

			if (!clockrunning) clock_start();
			
			break;
		case 'v': if (started && game === "letters") addletter(true); break;
		case 'c': if (started && game === "letters") addletter(false); break;
		case '0': if (started && game === "numbers") gennumbers(0); break;
		case '1': if (started && game === "numbers") gennumbers(1); break;
		case '2': if (started && game === "numbers") gennumbers(2); break;
		case '3': if (started && game === "numbers") gennumbers(3); break;
		case '4': if (started && game === "numbers") gennumbers(4); break;
		case 'e': if (started && game === "conundrum") conundrum_incorrect(); break;
		case 'E': if (started && game === "conundrum") conundrum_correct(); break;
		case 'End':
			if (game !== "conundrum") break;
			
			ended = true;
			display_word('countdown');
			break;
		case ' ':
			if (game !== "conundrum") break;
			
			if (!clockrunning) {
				conundrum_display();
			}
			
			clock_pauseresume();
			break;
		case 'n':
			if (!started || !needreset || clockrunning || ended) break;
			
			next_round();
			break;
	}
}