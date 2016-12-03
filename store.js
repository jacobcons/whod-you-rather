const got = require("got");
const Redis = require("ioredis");
const queryString = require('query-string');
const Promise = require('bluebird');
const redis = new Redis();

const apiKey = "95e41b5cdaed3bd656f8d298f92eac1b";
const msInYear = 1000*60*60*24*365.25;
const totalPages = 1;
let pages = [];

for (let pageN = 1; pageN <= totalPages; pageN++) {
	let page = got("https://api.themoviedb.org/3/person/popular?" + queryString.stringify({
		api_key: apiKey,
		page: pageN
	}));

	pages.push(page);
}

Promise.all(pages).then(res => {
	pages = res.map(page => {
		return JSON.parse(page.body).results; //results is an array of data for each actor on the corresponding page
	});

	// Map 2d array pages such that each actor has data from the person/{actorid} endpoint and not the person/popular endpoint
	let actorPages = pages.map(page => {
			return page.map(actor => {
				return got("https://api.themoviedb.org/3/person/" + actor.id + "?api_key=" + apiKey);
		});
	});

	// Pass each array inside of actorPages to Promise.all since promises are resolved here
	return Promise.all( actorPages.map(actorPage => Promise.all(actorPage)) );
}).then(actorPages => {
	// ActorPages is an array of arrays containing the actor data for actors on each page
	actorPages = actorPages.map(actorPage => {
		return actorPage.map(actor => {
			return JSON.parse(actor.body); // Map each actor to JSON
		});
	});

	actorPages.forEach((actorPage, pageN) => {
		actorPage.forEach((actor, actorN)  => {
			if (actor.birthday != "") {
				let currentDate = new Date();
				let birthDate = new Date(actor.birthday);
				actor.age = Math.floor((currentDate - birthDate) / msInYear);
				actor.known_for = pages[pageN][actorN]; // Store details from person/popular endpoint in actorPages array

				//redis
			}
		});
	});
}).catch(err => {
	console.log(err);
});
