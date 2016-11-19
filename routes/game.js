module.exports = [
	(req, res) => {
		let person = {};
		person.minAge = req.query.minAge;
		person.maxAge = req.query.maxAge;
		person.gender = req.query.gender;
		person = JSON.stringify(person);

		res.end(person);
	}
]
