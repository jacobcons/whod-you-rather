const game = require("./game.js");
const Greenman = require("@montyanderson/greenman");
const actorView = require("./views/actorView.js");

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

	$(".blue-btn").tooltip({
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
					//hide form
					$('html, body').animate({
						scrollTop: '100px'
					}, 2000);
					$(".handle-label-container").hide();
					$(".form-container").fadeOut(1200, () => {
						$(".actor-container").fadeIn(400);
					});


					let actors = JSON.parse(res);
					getCountryFlags(actors)
						.then(actors => {
							console.log(actors);
							renderActor(actors, "left");
							renderActor(actors, "right");
						});

					let direction = "";
					$(document).on("click", ".actor:not(.unclickable)", function() {
						var $this = $(this).addClass("unclickable");

						if ($(this).data("direction") == "left") {
							direction = "right"
						} else {
							direction = "left";
						}

						slideOut(direction, () => {
							if (actors.length > 0) {
								renderActor(actors, direction);
								slideIn(direction, () => {
									$this.removeClass("unclickable");
								});
							} else {
								gameComplete($(this).data("direction"));
							}
						});
					});
				}
			});
		} else {
			console.log("Invalid input");
		}
	});
});

function getCountryFlags(actors) {
	return new Promise((resolve, reject) => {
		let flagSrc = "";
		const absoluteFlagDirectory = "static/images/flags";
		const relativeFlagDirectory = "images/flags/"; // images are referenced in index.html which is in static folder

		// returns object with array of country names and image file extension
		$.ajax({
			url: "/flag",
			data: {path: absoluteFlagDirectory},
			success: (fileInfo) => {
				fileInfo = JSON.parse(fileInfo);
				const countryNames = fileInfo.names;
				const extension = fileInfo.extension;

				actors.forEach(actor => {
						actor.country_flag = false; // actor's without a place_of_birth property will simply not have a flag displayed
						if (actor.place_of_birth != null) {
							actor.country_flag = flagImagePath(actor, countryNames, relativeFlagDirectory, extension);
						}
				});

				return resolve(actors);
			}
		});
	});
}

function flagImagePath(actor, countryNames, relativeFlagDirectory, extension) {
	let flagPath = "";
	let placeOfBirth = actor.place_of_birth.toLowerCase();
	//united states, u.s, u.s.a, usa, us, u.s., u.s.a.
	placeOfBirth = placeOfBirth.replace("united states", "usa"); //hacky temporay fix for other ways to say the usa
	placeOfBirth = placeOfBirth.replace("u.s", "usa");
	placeOfBirth = placeOfBirth.replace("united kingdom", "uk");

	for (let i = 0; i < countryNames.length; i++) {
		let countryName = countryNames[i];

		// if country found in place of birth description => relative flagPath returned
		if (placeOfBirth.indexOf(countryName) !== -1) {

			flagPath = relativeFlagDirectory + countryName + extension;
		}
	}

	return flagPath;
}

function renderActor(actors, direction) {
	//render first actor in array and then remove that actor from array
	actorView.render({actor: actors[0], direction: direction});
	actors.shift();
}

function slideOut(direction, cb) {
		$('.actor[data-direction="'+direction+'"').stop().animate({
			[direction]: '-150%'
	}, 400, cb).delay(1000);
}

function slideIn(direction, cb) {
	$('.actor[data-direction="'+direction+'"').stop().animate({
		[direction]: '0%'
	}, 400, cb);
}

function gameComplete(direction) {
	$(".actor-divider").hide();
	//show replay options
}
