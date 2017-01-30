const game = require("./game.js");
const confetti = require("./confetti.js");
const references = require("./index.js");

module.exports = (direction) => {
	//show replay options
	if (direction == "right") {
		$(".replay-container").css("float","right");
		$(".replay").css("float","right");
	}
	$('.actor[data-direction="'+direction+'"').hide();
	$(".actor-divider").hide();
	$(".replay").fadeIn(1200);
	confetti();

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
				$(".actor-container").fadeOut(400);
				console.log(game);

				game(res);
			}
		});
	});
}
