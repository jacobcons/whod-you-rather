const got = require("got");
const queryString = require('query-string');
const Promise = require('bluebird');
const pThrottle = require('p-throttle');
const db = require("./lib/db.js");

const apiKey = "95e41b5cdaed3bd656f8d298f92eac1b";
const msInYear = 1000*60*60*24*365.25;
let pages = [];

db.flushdb();

got("https://api.themoviedb.org/3/person/popular?api_key=" + apiKey).then(res => {
	//Total number of pages is stored at person/popular endpoint
	const totalPages = JSON.parse(res.body).total_pages;

	const page = pThrottle((pageN) => {
		return got("https://api.themoviedb.org/3/person/popular?" + queryString.stringify({ api_key: apiKey, page: pageN}));
	}, 1, 300);

	for (let pageN = 1; pageN <= 20; pageN++) {
			pages.push( page(pageN) );
	}

	return Promise.all(pages);
}).then(res => {
	pages = res.map(page => {
		return JSON.parse(page.body).results; //results is an array of data for each actor on the corresponding page
	});

	// Map 2d array pages such that each actor has data from the person/{actorid} endpoint and not the person/popular endpoint

	const fetchActor = pThrottle((actorId) => {
		return got("https://api.themoviedb.org/3/person/" + actorId + "?api_key=" + apiKey);
	}, 1, 300);

	const actorPages = pages.map(page => {
				return page.map(actor => {
					return fetchActor(actor.id);
			});
	});

	// Pass each array inside of actorPages to Promise.all since promises are resolved here
	return Promise.all( actorPages.map(actorPage => Promise.all(actorPage)) );
}).then(actorPages => {
	// ActorPages is an array of arrays containing the actor data for actors on each page
	const multi = db.multi();

	actorPages = actorPages.map(actorPage => {
		return actorPage.map(actor => {
			return JSON.parse(actor.body); // Map each actor to JSON
		});
	});

	actorPages.forEach((actorPage, pageN) => {
		actorPage.forEach((actor, actorN)  => {
			if (actor.birthday != "" && actor.profile_path != "" && actor.gender != 0) {
				let currentDate = new Date();
				let birthDate = new Date(actor.birthday);
				actor.age = Math.floor((currentDate - birthDate) / msInYear);
				actor.known_for = pages[pageN][actorN].known_for; // Store details from person/popular endpoint in actorPages array
				multi.set(actor.id, JSON.stringify(actor));
				multi.zadd("actors", actor.age, actor.id);
				//redis
			}
		});
	});

	return multi.exec();
}).then(() => {
	console.log("fin");
}).catch(err => {
	console.log(err);
});
