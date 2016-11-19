const gulp = require("gulp");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const browserify = require("browserify");
const babelify = require("babelify");
const uglify = require("gulp-uglify");
const less = require("gulp-less");

gulp.task("scripts", function() {
	browserify("./scripts/index.js")
		.transform("babelify", {presets: ["es2015"]})
		.bundle()
		.pipe(source("index.js"))
		.pipe(buffer())
		.pipe(uglify())
		.pipe(gulp.dest("./static"));
});

gulp.task("styles", function() {
	return gulp.src("./styles/styles.less")
			.pipe(less({
				paths: __dirname + "/styles"
			}))
			.pipe(gulp.dest("./static"));
})

gulp.task("watch", function() {
	gulp.watch("./scripts/*.js", ["scripts"]);
	gulp.watch("./styles/*.less", ["styles"]);
})

gulp.task("default", ["watch", "scripts", "styles"]);
