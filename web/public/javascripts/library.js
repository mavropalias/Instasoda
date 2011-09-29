var boxSize = 80;
var winWidth = $(window).width();
var winHeight = $(window).height();
var boxColumns = 0;
var boxRows = 0;
var rnd = 0;

function initBoxes() {
	winWidth = $(window).width();
	winHeight = $(window).height();

	boxColumns = (Math.round(winWidth / boxSize)) + 1;
	boxRows = (Math.round(winHeight / boxSize)) + 1;

	$('#boxes').width($(window).width());
	$('#boxes').height($(window).height());

	addBoxes(boxColumns, boxRows);
}

function addBoxes(cols, rows) {
	$('#boxes').empty();
	for (n = 0; n < rows; n++) {
		$('#boxes').append("<div id='row" + n + "' class='row'>");
		$('#row' + n).css("top", (n * boxSize) + "px");

		for (m = 0; m < cols; m++) {
			$('#row' + n).append(
					"<div id='box" + n + "-" + m + "' class='box box1'></div>");
			$('#box' + n + "-" + m).hide().css("left", (m * boxSize) + "px");

			// load random image
			rnd = Math.floor(Math.random() * (15 - 1) + 1);

			$('#box' + n + "-" + m).css("background-image",
					'url(images/faces/' + (rnd) + '.png)').delay(rnd * 200)
					.fadeTo(300, 0.8);

			// $('#box'+n+"-"+m).html(n+"-"+m);
		}

		$('#boxes').append("</div>")
	}

	// set row width
	$('.row').css('width', (boxSize * boxColumns) + 'px');

	// add mouseover event handler
	$('.box').mouseover(
			function() {
				var p = $(this).offset();
				$(this).fadeTo(0, 1);
				$('#tooltip').css('left', (p.left - 1) + 'px').css('top',
						p.top - 1 + 'px').show();
			});
	$('.box').mouseout(function() {
		$(this).fadeTo(300, 0.8);
	});
}