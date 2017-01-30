const Greenman = require("@montyanderson/greenman");

const actor = module.exports = new Greenman(`
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
