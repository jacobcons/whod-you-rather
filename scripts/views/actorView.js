const Hogan = require("hogan.js");

const template =
`
	{{#actor}}
		<div class="one-liner">
			<h2>{{name}}, {{age}}</h2> {{#country_flag}}<img class="country-flag" src="{{country_flag}}">{{/country_flag}}
		</div>

		<img class="profile-image" src="https://image.tmdb.org/t/p/w500/{{profile_path}}">

		<div class="known-for">
			<h2>Known for:</h2>

			{{#known_for}}
				<img class="poster-image" src="https://image.tmdb.org/t/p/w154/{{poster_path}}">
			{{/known_for}}
		</div>
	{{/actor}}
`;
let compiledTemplate = Hogan.compile(template)

module.exports = compiledTemplate;
