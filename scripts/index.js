let gender = 0;
let defaultStyles = {
	'backgroundColor': '#ccc'
};
let selectStyles = {
	'backgroundColor': '#949494'
};

// change value of gender based on which icon is selected
$(".male").click(function() {
	gender = 1;
})
$('.female').click(function() {
	gender = 2;
})
$('.mixed').click(function() {
	gender = 3;
})

$(".genderIcons").on("click", "div", function() {
	$('.genderIcons').children("div").each(function() {
		$(this).css(defaultStyles);
	});

	$(this).css(selectStyles);
	console.log(gender)
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
		minAge < 0 ||
		maxAge > 65 ||
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

$(".playBtn").click(function() {
	let minAge = parseInt($(".minAge").val(), 10);
	let maxAge = parseInt($(".maxAge").val(), 10);

	if (validate(gender, minAge, maxAge)) {
		$.ajax({
			url: "/game",
			data: {minAge: minAge, maxAge: maxAge, gender: gender},
			success: (res) => {

			}
		});
	} else {
		console.log("Invalid input");
	}
});
