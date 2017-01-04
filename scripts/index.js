const game = require("./game.js");

$(window).on('load', function() {
	$('img.svg').each(function(){
		var $img = $(this);
		var imgID = $img.attr('id');
		var imgClass = $img.attr('class');
		var imgURL = $img.attr('src');

		$.get(imgURL, function(data) {
			// Get the SVG tag, ignore the rest
			var $svg = $(data).find('svg');

			// Add replaced image's ID to the new SVG
			if(typeof imgID !== 'undefined') {
				$svg = $svg.attr('id', imgID);
			}
			// Add replaced image's classes to the new SVG
			if(typeof imgClass !== 'undefined') {
				$svg = $svg.attr('class', imgClass+' replaced-svg');
			}

			// Remove any invalid XML tags as per http://validator.w3.org
			$svg = $svg.removeAttr('xmlns:a');

			// Check if the viewport is set, if the viewport is not set the SVG wont't scale.
			if(!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
				$svg.attr('viewBox', '0 0 ' + $svg.attr('height') + ' ' + $svg.attr('width'))
			}

			// Replace image with new SVG
			$img.replaceWith($svg);

		}, 'xml');
	});

	$(".info-btn").tooltip({
		track: true
	});


	let gender = 0;
	let defaultColor = "#000";
	let maleColor = "#bec0ff";
	let femaleColor = "pink";
	let mixedColor = "#e8e000";

	$(".male").hover(function() {
		$(this).find("path").css("fill", maleColor);
	}, function() {
		if (gender != 2) {
			$(this).find("path").css("fill", defaultColor);
		}
	});
	$(".female").hover(function() {
		$(this).find("path").css("fill", femaleColor);
	}, function() {
		if (gender != 1) {
			$(this).find("path").css("fill", defaultColor);
		}
	});
	$(".mixed").hover(function() {
		$(this).find("path").css("fill", mixedColor);
	}, function() {
		if (gender != 3) {
			$(this).find("path").css("fill", defaultColor);
		}
	});

	// change value of gender based on which icon is selected
	$(".male").click(function() {
		gender = 2;
		$(this).find("path").css("fill", maleColor);
		$(".female > .gender-icon path").css("fill", defaultColor);
		$(".mixed > .gender-icon path").css("fill", defaultColor);

	});
	$('.female').click(function() {
		gender = 1;
		$(this).find("path").css("fill", femaleColor);
		$(".male > .gender-icon path").css("fill", defaultColor);
		$(".mixed > .gender-icon path").css("fill", defaultColor);
	});
	$('.mixed').click(function() {
		gender = 3;
		$(this).find("path").css("fill", mixedColor);
		$(".male > .gender-icon path").css("fill", defaultColor);
		$(".female > .gender-icon path").css("fill", defaultColor);
	});

	function initaliseLabels() {
		initaliseLabelValues();
		initaliseLabelPositions();
	}

	function initaliseLabelValues() {
		writeToLabel("#min-handle-label", $(".age-slider").slider("values", 0));
		writeToLabel("#max-handle-label", $(".age-slider").slider("values", 1));
	}

	function initaliseLabelPositions() {
		positionLabel(".ui-slider-handle:first","#min-handle-label");
		positionLabel(".ui-slider-handle:last","#max-handle-label");
	}

	function writeToLabel(label, str) {
		if (str != "100") {
			$(label).html(str);
		} else {
			$(label).html("100+");
		}
	}

	function positionLabel(handle, label) {
		let handlePosition = $(handle).offset();
		let centreAdjustment = ($(handle).width() - $(label).width()) / 2;


		$(label).css({
			"left": handlePosition.left + centreAdjustment,
			"top": handlePosition.top + 30
		});
	}

	$(".age-slider").slider({
		range: true,
		min: 18,
		max: 100,
		values: [18, 100],
		slide: function(event, ui) {
			let delay = function() {
				let handleIndex = ui.handleIndex;
				let label = handleIndex == 0 ? "#min-handle-label" : "#max-handle-label";

				writeToLabel(label, ui.value);
				positionLabel(ui.handle, label);
			}

			setTimeout(delay, 5);
		}
	});


	initaliseLabels();
	$(window).resize(function() {
		initaliseLabelPositions();
	});

	function validate(gender, minAge, maxAge) {
		// boolean used so multiple error messages can be dispalyed before the function returns false
		let isValid = 1;

		// validate gender
		switch (gender) {
			case 1:
			case 2:
			case 3:
				break;
			default:
				console.log("Please select a gender");
				isValid = 0;
		}

		// validate age slider
		if (minAge > maxAge ||
			minAge < 18 ||
			maxAge > 100 ||
			minAge !== parseInt(minAge, 10) ||
			maxAge !== parseInt(maxAge, 10))
		{
			console.log("Please enter a valid range");
			isValid = 0;
		}

		switch(isValid) {
			case 0:
				return false;
			case 1:
				return true;
		}
	}

	$(".play-btn").click(function() {
		let minAge = $(".age-slider").slider("values", 0);
		let maxAge = $(".age-slider").slider("values", 1);

		if (validate(gender, minAge, maxAge)) {
			$(this).off("click");
			$.ajax({
				url: "/game",
				data: {minAge: minAge, maxAge: maxAge, gender: gender},
				success: (res) => {
					console.log(JSON.parse(res));
					$(".form-container").fadeOut(2200);
					$("body").append("<pre>" + JSON.stringify(JSON.parse(res), null, 2) + "</pre>");
				}
			});
		} else {
			console.log("Invalid input");
		}
	});
});
