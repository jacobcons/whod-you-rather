const Greenman = require("@montyanderson/greenman");

const actor = module.exports = new Greenman(`
	<div class="loading showbox">
	  <div class="loader">
	    <svg class="circular" viewBox="25 25 50 50">
	      <circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/>
	    </svg>
	  </div>
	</div>
	<div class="wrapper clearfix">
		<div class="actor" data-direction="left"></div>
		<div class="actor-divider">
			<div class="question-mark-container circular-btn blue-btn"><span class="question-mark">?</span></div>
		</div>
		<div class="actor" data-direction="right"></div>
		<div class="replay-container">
			<div class="replay">
				<h2>Replay:</h2>
				<div class="replay-btn different-options">Different options</div>
				<div class="replay-btn same-options">Same options</div>
			</div>
		</div>

	</div>
	`,
	(render) => {
	$(".actor-container").html(render);
});
