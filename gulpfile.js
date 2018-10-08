//require - это команда для подключения
const gulp = require('gulp'); //загружаем, подключаем gulp
const uglify = require('gulp-uglify'); //подкл. пакет минифицирования .js файлов
const concat = require('gulp-concat'); //склеивает файлы, в один
const minifyCss = require('gulp-minify-css'); //сжимает css файлы
const imagemin = require('gulp-imagemin'); //оптимизация изображений
const clean = require('gulp-clean'); //удаляет файл или папку
const shell = require('gulp-shell'); //очередность запуска
const browserSync = require('browser-sync').create();
const reload = browserSync.reload; //перезегрузка сервера
const runSequence = require('run-sequence'); //запускает задачи по очереди


const path = {//архитектура путей, делают ее не всегда  ??? /представляе собой объект

	src: {
	//откуда взять ...(path.src.styles/js...)
		html: 'app/index.html',
		styles: [
		//нужно указать правильную последовательность подключения файлов как в 'index.html'
			'app/css/vendors/*.css',
			'app/css/fonts.css',
			'app/css/style.css'
		],
		js: [
		//массив для подключения JS файлов
			//этот gulpfile.js лежит на уровне папки 'app', дальше указываем адреса отталкиваясь от нее
			'app/js/libs/*.js', //для подключения всех файлов с расширением ".js"
			'app/js/bootstrap.js'
		],
		fonts: 'app/fonts/**/*',
		image: 'app/img/**/*'
	},

	build: {
	//объект для сборки /это конечный путь куда мы положим наши файлы собранные/склееные/сжатые -/куда положить(path.build.css/js)
		html: 'build/',
		js: 'build/js/', //на уровне папки 'app' будет создана папка 'build' в ней создана папка 'js' автоматом, а в нее положены JS файлы
		css: 'build/css/',
		fonts: 'build/fonts/',
		image: 'build/img/'
	}
};



gulp.task('js', function() { //произвольное название задачи
	return gulp.src(path.src.js)//записан путь который хранится в переменной path
		.pipe(uglify())//минификация файлов/ -вызов переменной uglify, и в тоже время функции
		.pipe(concat('main.js'))//склеивание файлов /в скобках concat указываем как бужет называться файл на выходе
		.pipe(gulp.dest(path.build.js))//указываем адрес к переменной 'path'(build: {js: [ ...])} куда мы хотим положить наш файл
		//.pipe(gulp.dest('build/js/')) можно и так писать
		.pipe(reload({stream:true})); //отслеживание файлов, reload({stream:true}) дает возможность при перезагрузке браузера оставить страницу на том же месте при вертикальном скролле
});

gulp.task('css', function() {
	return gulp.src(path.src.styles)
		.pipe(minifyCss())
		.pipe(concat('main.css'))
		.pipe(gulp.dest(path.build.css))
		.pipe(reload({stream:true})); //отслеживание файлов, reload({stream:true}) дает возможность при перезагрузке браузера оставить страницу на том же месте при вертикальном скролле
});

gulp.task('html', function() {
	return gulp.src(path.src.html)
		.pipe(gulp.dest(path.build.html))
		.pipe(reload({stream:true})); //отслеживание файлов, reload({stream:true}) дает возможность при перезагрузке браузера оставить страницу на том же месте при вертикальном скролле
});

gulp.task('fonts', function() {
	return gulp.src(path.src.fonts)
		.pipe(gulp.dest(path.build.fonts));
});

gulp.task('images', function() {
	return gulp.src(path.src.image)
		.pipe(imagemin([
		    imagemin.gifsicle({interlaced: true}),
		    imagemin.jpegtran({progressive: true}),
		    imagemin.optipng({optimizationLevel: 5}),
		    imagemin.svgo({
		        plugins: [
		            {removeViewBox: true},
		            {cleanupIDs: false}
		        ]
		    })
		], {
		    verbose: true
		}))
		.pipe(gulp.dest(path.build.image));
});

gulp.task('clean', function() {
	return gulp.src('build')
		.pipe(clean());
});//задача удаления файла или папки

gulp.task('build', shell.task([
	'gulp clean',
	'gulp images',
	'gulp html',
	'gulp fonts',
	'gulp css',
	'gulp js'
	]));

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./build" //прописываем адрес откуда открыть
        }
    });
});

gulp.task('watch', function() {
	gulp.watch('app/index.html', ['html']);//отслеживает файл и в случае изменения вызовется нужная задача для пересборки
	gulp.watch('app/css/**/*.css', ['css']);
	gulp.watch('app/js/**/*.js', ['js']);
});// Ctrl+C для остановки задачи

gulp.task('server', function() {
	runSequence('build', 'browser-sync', 'watch');
}); // Ctrl+C для остановки задачи

gulp.task('default', ['server']); //программа по умолчанию