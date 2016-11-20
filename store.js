const got = require("got");
const Redis = require("ioredis");
const queryString = require('query-string');
const Promise = require('bluebird');
const redis = new Redis();

const apiKey = "95e41b5cdaed3bd656f8d298f92eac1b";

function assimilate(pageN) {
	/*
		The person/popular endpoint provides data on the most popular actors including their info on films known for. The id gathered from this endpoint is then used to make a request to the person/id endpoint to gather additional data such as the actor's birthday, gender and place_of_birth.
	*/
	let popular = got("https://api.themoviedb.org/3/person/popular?" + queryString.stringify({
		api_key: apiKey,
		page: pageN
	})).then(res => {
		return res;
	});

	let person = popular.then(res => {
		const popularActors = JSON.parse(res.body).results;

		// Map each actor to the data at the person/id endpoint in order to gather additional information
		const mappedActors = popularActors.map(a => {
			return got("https://api.themoviedb.org/3/person/" + a.id + "?" + queryString.stringify({
				api_key: apiKey
			}))
		});

		return Promise.all(mappedActors);
	});

	return Promise.join(popular, person, (popularActors, mappedActors) => {
		// Join promises to have access to all actor data in scope
		popularActors = JSON.parse(popularActors.body).results;
		mappedActors = mappedActors.map(a => {
			return JSON.parse(a.body);
		})

		for (i = 0; i < popularActors.length; i++) {
			mappedActors[i].birthYear = mappedActors[i].birthday.substring(0,4); //birthday stored in yyyy-mm-dd format
			mappedActors[i].known_for = popularActors[i].known_for.map(knownFor => knownFor.poster_path); //app only requires the movie posters
		}
		console.log(mappedActors);

	});
}


assimilate(2);



/*got("https://api.themoviedb.org/3/person/popular?" + queryString.stringify({
	api_key: apiKey
}))
	.then(res => {
		const popularActors = JSON.parse(res.body).results;
		const x = 2;

		const mappedActors = popularActors.map(a => {
			return got("https://api.themoviedb.org/3/person/" + a.id + "?" + queryString.stringify({
				api_key: apiKey
			}))
		});

		return Promise.all(mappedActors);
	})
	.then(mappedActors => {
		let actors = mappedActors.map(a => {
			return JSON.parse(a.body);
		});
		console.log(x);
	})
	.catch(err => {
		console.log(err.res.body);
	})*/
