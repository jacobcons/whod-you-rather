const Greenman = require("@montyanderson/greenman");
const actorView = require("./views/actorView.js");
const actorContainer = require("./views/actorContainer.js");
const errorMsg = require("./error-message.js");
const references = require("./index.js");
const confetti = require("./confetti.js");
let actors = references.actors;

const initGame = exports.initGame = (res) => {
	//Render first two actors and display them
	actors = JSON.parse(res);

	getCountryFlags(actors)
		.then(actors => {
			actorContainer.render();
			return actors;
		})
		.then(actors => {
			renderActor(actors, "left");
			renderActor(actors, "right");
			$(".actor-container").fadeIn(400);
		});
}

const coreGame = exports.coreGame = () => {
	let direction = ""; //holds the direction of the actor not selected
	$(document).on("click", ".actor:not(.unclickable)", function() {
		$(this).addClass("unclickable");
		console.log(actors);

		if ($(this).data("direction") == "left") {
			direction = "right"
		} else {
			direction = "left";
		}

		slideOut(direction, () => {
			if (actors.length > 0) {
				renderActor(actors, direction);
				slideIn(direction, () => {
					$(this).removeClass("unclickable");
				});
			} else {
				gameComplete(direction);
			}
		});
	});
}

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
	if (direction == "right") {
		$(".replay-container").css("float","right");
		$(".replay").css("float","right");
	}
	$('.actor[data-direction="'+direction+'"').hide();
	$(".actor-divider").hide();
	$(".replay").fadeIn(1200);
	confetti();

	// replay options
	$(".different-options").click(() => {
		window.location.href = "/";
	});
	$(".same-options").click(() => {
		let minAge = references.minAge;
		let maxAge = references.maxAge;
		let gender = references.gender;

		$.ajax({
			url: "/game",
			data: {minAge: minAge, maxAge: maxAge, gender: gender},
			success: (res) => {
				$(".confetti-container").hide();
				$(".actor-container").fadeOut(1200, () => {
					initGame(res);
				});
			}
		});
	});
}
