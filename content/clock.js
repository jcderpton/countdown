var clocktotal = 30;
var clockstep = 100;

var clockinterval;
var clockrunning;
var clockpaused;
var clocksecs = clocktotal;
var needreset;

reset();

function clock_start() {
    clearInterval(clockinterval);
    $('#music')[0].load();
	$('#music')[0].volume = 0.4;
    startclock();
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

function startclock() {	
    $('#music')[0].play();

    clockpaused = false;
    clockinterval = setInterval(tickclock, clockstep);
    clocksecs = clocktotal;
    clockrunning = true;
    needreset = true;
    renderclock();
	printanswer();
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
            mid + (mid - insideClock/2) * Math.sin(Math.PI * 2 * a / 60),
            mid + (mid - insideClock/2) * Math.cos(Math.PI * 2 * a / 60),
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
	ctx.lineWidth = 4;
    ctx.lineTo(
        mid + (mid - insideClock - 5) * Math.sin((Math.PI * 2 * secs) / 60),
        mid + (mid - insideClock - 5) * Math.cos((Math.PI * 2 * secs) / 60)
    );
	ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function reset() {	
    needreset = false;

    stopclock();
    clearInterval(clockinterval);
    clocksecs = clocktotal;
    renderclock();
}