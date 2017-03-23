const Hogan = require("hogan.js");
const actorView = require("./views/actorView.js");
const actorContainer = require("./views/actorContainer.js");
const errorMsg = require("./error-message.js");
const references = require("./index.js");
const confetti = require("./confetti.js");
let actors = references.actors;

const initGame = exports.initGame = (res) => {
	actors = JSON.parse(res);

	getCountryFlags(actors)
		.then(actors => {
			actorContainer.render();
			return actors;
		})
		.then(actors => {
			renderActor(actors, "left", {left: 0, top: 0}).then(d => {
				$(".actor[data-direction='left']").show();
			});
			renderActor(actors, "right", {left: 0, top: 0}).then(d => {
				$(".actor[data-direction='right']").show();
			})
			$(".actor-container").fadeIn(100);
			//scroll to the top and hide form
			$('html, body').animate({
				scrollTop: $(".actor-container").offset().top - 20
			}, 500);
		});
}

const coreGame = exports.coreGame = () => {
	let direction = ""; //holds the direction of the actor not selected
	$(document).on("click", ".actor:not(.unclickable)", function() {
		$(this).addClass("unclickable");

		if ($(this).data("direction") == "left") {
			direction = "right"
		} else {
			direction = "left";
		}
		// read in position of actor before it's slid out
		const position = $('.actor[data-direction="' + direction + '"]').find(".profile-image").offset();


		slideOut(direction, () => {
			if (actors.length > 0) {
				renderActor(actors, direction, position).then(direction => {
					slideIn(direction, () => {
						$(this).removeClass("unclickable");
					});
				})
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
	let index = 0;
	let flagPath = "";
	let placeOfBirth = actor.place_of_birth.toLowerCase();
	//united states, u.s, u.s.a, usa, us, u.s., u.s.a.
	placeOfBirth = placeOfBirth.replace("united states", "usa"); //hacky temporay fix for other ways to say the usa
	placeOfBirth = placeOfBirth.replace("u.s", "usa");
	placeOfBirth = placeOfBirth.replace("united kingdom", "uk");

	for (let i = 0; i < countryNames.length; i++) {
		let countryName = countryNames[i];

		// if country found in place of birth description => relative flagPath returned
		// place of birth description can have multiple country names so it
		if (placeOfBirth.indexOf(countryName) !== -1 && placeOfBirth.indexOf(countryName) > index) {
			flagPath = relativeFlagDirectory + countryName + extension;
			index = placeOfBirth.indexOf(countryName);
		}
	}

	return flagPath;
}

function renderActor(actors, direction, position) {
	return new Promise((resolve, reject) => {
		let renderedActor = actorView.render({actor: actors[0]});
		let selectedActor = '.actor[data-direction="' + direction + '"]';
		let actorWidth = $(selectedActor).find(".profile-image").width();
		let loadWidth = $(".loading").width();
		let actorHeight = $(selectedActor).find(".profile-image").height();
		let loadHeight = $(".loading").height();

		$(".loading").css({
			left: position.left + (actorWidth / 2) - (loadWidth / 2),
			top: position.top + (actorHeight / 2) - (loadHeight / 2),
			display: "block"
		});

		$(selectedActor).html(renderedActor).promise().done(() => {
			$(".loading").hide();
			actors.shift();
			return resolve(direction);
		});
	});
}

function slideOut(direction, cb) {
		$('.actor[data-direction="'+direction+'"').stop().animate({
			[direction]: '-150%'
	}, 300, cb).delay(1000);
}

function slideIn(direction, cb) {
	$('.actor[data-direction="'+direction+'"').stop().animate({
		[direction]: '0%'
	}, 300, cb);
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
