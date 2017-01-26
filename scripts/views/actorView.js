const Greenman = require("@montyanderson/greenman");

const actor = module.exports = new Greenman(`
		{{#actor}}
			<div class="one-liner">
				<h2>{{name}}, {{age}}</h2> <img class="country-flag" src="{{#country_flag}}{{country_flag}}{{/country_flag}}">
			</div>

			<img class="profile-image" src="https://image.tmdb.org/t/p/original/{{profile_path}}">

			<div class="known-for">
				<h2>Known for:</h2>
				{{#known_for}}
					<img class="poster-image" src="https://image.tmdb.org/t/p/original/{{poster_path}}">
				{{/known_for}}
			</div>
		{{/actor}}
	`,
	(renderedActor, locals) => {
	$('.actor[data-direction="'+locals.direction+'"').html(renderedActor);
});
