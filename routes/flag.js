module.exports = [
	(req, res) => {
		const Promise = require("bluebird");
		const fs = Promise.promisifyAll(require("fs"));
		const path = req.query.path;

		let fileInfo = {
			names: [],
			extension: ""
		};

		//read files where flag images are stored
		fs.readdirAsync(path)
			.then(files => {
				//store file names
				files.forEach(file => {
					fileInfo.names.push(file);
				});
				return Promise.all(fileInfo.names);
			})
			.then(fileNames => {
				//store file extension
				const firstFile = fileNames[0]; //only need extension of first file since all will be the same
				fileInfo.extension = firstFile.substr(firstFile.indexOf("."));
				return fileNames;
			})
			.then(fileNames => {
				//remove extension from filename
				fileInfo.names = fileNames.map(fileName => {
					return fileName.substr(0, fileName.indexOf("."));
				});
				return fileInfo;
			})
			.then(fileInfo => {
				//return JSON string of fileInfo
				return res.end(JSON.stringify(fileInfo));
			})
			.catch(err => {
				console.log(err);
				return res.end("[]");
			});
	}
]
