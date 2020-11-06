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

var tracker1 = 0;
var tracker2 = 0;

var coinsteps;
var coin = ["Heads", "Tails"];

$(this).keydown(function(event) { keyControl(event) });

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

function scoreChange(id, amount) {
	var x = 'tracker' + id
	window[x] += amount;
	$('#score' + id).html(window[x]);
}

function keyControl(event) {	
	switch(event.key) {
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