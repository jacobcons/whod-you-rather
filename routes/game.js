const db = require("../lib/db.js");

function filterByAge(minAge, maxAge) {
	return db.zrangebyscore("actors", minAge, maxAge)
		.then(ids => {
			actors = ids.map(id => db.get(id));
			return Promise.all(actors);
		});
}

function filterByGender(gender, actors) {
	return actors.filter(actor => actor.gender == gender);
}

function shuffleArray(a) {
	let n = a.length;

	for (let i = n-1; i > 0; i--) {
		j = Math.floor(Math.random() * (i+1));

		let temp = a[j];
		a[j] = a[i];
		a[i] = temp;
	}

	return a;
}

module.exports = [
	(req, res) => {
		minAge = req.query.minAge;
		maxAge = req.query.maxAge;
		gender = req.query.gender;

		if (maxAge == 100) {
			maxAge = "+inf"; //Include actors 100 or older
		}

		filterByAge(minAge, maxAge).then(actors => {
			actors = actors.map(actor => JSON.parse(actor));

			if (gender == 1 || gender == 2) {
				// filters only if the genders selected were male or female
				actors = filterByGender(gender, actors);
			}
			if (actors.length < 5) {
				res.end("[]");
			}
			if (actors.length > 20) {
				actors = actors.slice(0,20); // a maximum of 20 actors is stored
			}
			actors = shuffleArray(actors);

			res.end(JSON.stringify(actors));
		});
	}
]
