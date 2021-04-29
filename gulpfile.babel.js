import gulp from 'gulp';
import inlineCss from 'gulp-inline-css';
import htmlmin from 'gulp-htmlmin';
import replace from 'gulp-replace';
import inject from 'gulp-inject';
import rename from 'gulp-rename';

import FILES from './variables';
import path from 'path';
import fs from 'fs';

/**
 * Gulp tasks.
 * See https://gulpjs.com/
 */
gulp.task('build:varaamo:finnish', generateVaraamoFI);
gulp.task('build:varaamo:swedish', generateVaraamoSV);
gulp.task('build:varaamo:english', generateVaraamoEN);
gulp.task('build:varaamo:all', gulp.series('build:varaamo:finnish', 'build:varaamo:swedish', 'build:varaamo:english'));
gulp.task('build:monitori:finnish', generateMonitoriFI);
gulp.task('build:monitori:swedish', generateMonitoriSV);
gulp.task('build:monitori:english', generateMonitoriEN);
gulp.task('build:monitori:all', gulp.series('build:monitori:finnish', 'build:monitori:swedish', 'build:monitori:english'));
gulp.task('default', gulp.series('build:varaamo:all', 'build:monitori:all'));

/**
 * Returns an array with the name.extension of each .html file found at rootPath
 * @param {string} rootPath
 * @returns {string[]}
 * @example
 * return fileNames = ['fi-reservation_created.html','fi-reservation_denied.html', etc]
 */
function getFileNames(rootPath) {
    const fileNames = [];
    const dirPath = path.join(__dirname, rootPath);
    fs.readdirSync(dirPath).forEach((file, index) => {
        if (file.endsWith('.html')) {
            fileNames.push(file);
        }
    });
    return fileNames;
}

/**
 * Generate Finnish Varaamo templates
 */
function generateVaraamoFI(cb) {
    const fileNames = [];
    const dirPath = path.join(__dirname, FILES.FILE_PATH.VARAAMO.FI.ROOT);
    fs.readdirSync(dirPath).forEach((file, index) => {

        fileNames.push(file);
    });
    console.log(fileNames);
    generateTemplates(cb, 'FI', fileNames, 'varaamo');
    cb();
}

/**
 * Generate Swedish Varaamo templates
 */
function generateVaraamoSV(cb) {
    const fileNames = [];
    const dirPath = path.join(__dirname, FILES.FILE_PATH.VARAAMO.SV.ROOT);
    fs.readdirSync(dirPath).forEach((file, index) => {
        fileNames.push(file);
    });
    console.log(fileNames);
    generateTemplates(cb, 'SV', fileNames, 'varaamo');
    cb();
}

/**
 * Generate English Varaamo templates
 */
function generateVaraamoEN(cb) {

    const fileNames = getFileNames(FILES.FILE_PATH.VARAAMO.EN.ROOT);
    console.log(fileNames);
    generateTemplates(cb, 'EN', fileNames, 'varaamo');
    cb();
}

/**
 * Generate Finnish Monitori templates
 */
function generateMonitoriFI(cb) {

    const fileNames = getFileNames(FILES.FILE_PATH.MONITORI.FI.ROOT);
    console.log(fileNames);
    generateTemplates(cb, 'FI', fileNames, 'monitori');
    cb();
}

/**
 * Generate Swedish Monitori templates
 */
function generateMonitoriSV(cb) {

    const fileNames = getFileNames(FILES.FILE_PATH.MONITORI.SV.ROOT);
    console.log(fileNames);
    generateTemplates(cb, 'SV', fileNames, 'monitori');
    cb();
}

/**
 * Generate English Monitori templates
 */
function generateMonitoriEN(cb) {
    /**
     * String array consisting of filename.extension of files found
     * @type {string[]}
     */
    const fileNames = getFileNames(FILES.FILE_PATH.MONITORI.EN.ROOT);
    console.log(fileNames);
    generateTemplates(cb, 'EN', fileNames, 'monitori');
    cb();
}

/**
 * Generate templates according to parameters
 * @param cb - callback that lets gulp know when the task is finished.
 * @param {string} lang - language of the templates, used to construct path to values/files.
 * @param {string[]} files - array with the names of the files that were found, final templates will be named according to these.
 * @param {string} service - name of the service/site, used to construct path to files ie. /pages/service/foo.
 */
function generateTemplates(cb, lang = 'FI', files = [], service = 'varaamo') {
    const {LOGO_URLS, LOGO_ALTS, FEEDBACK_URLS, MAP_URLS, FILE_PATH} = FILES;

    files.forEach((fileName) => {
        const lowerCaseLang = lang.toLowerCase();
        const upperCaseService = service.toUpperCase();
        // found in pages/template/footer/
        const footerName = `${lowerCaseLang}-varaamo.html`;
        return gulp.src('./pages/template/index.html')
            .pipe(inject(gulp.src(`./pages/${service}/${lowerCaseLang}/${fileName}`), { // inject primary html content into index.html
                starttag:  '<!-- inject:main:html -->',
                transform: function (filePath, file) {
                    return file.contents.toString('utf8')
                },
                removeTags: true,
                quiet: true,
            }))
            .pipe(replace(LOGO_URLS.TURKU.SRC,LOGO_URLS.TURKU[lang])) // replace logo url placeholder
            .pipe(replace(LOGO_ALTS.TURKU.SRC,LOGO_ALTS.TURKU[lang])) // replace logo alt text placeholder
            .pipe(inject(gulp.src(`./pages/template/footer/${footerName}`), { // inject footer html content into index.html
                starttag:  '<!-- inject:footer:html -->',
                transform: function (filePath, file) {
                    return file.contents.toString('utf8')
                },
                removeTags: true,
                quiet: true,
            }))
            .pipe(replace(FEEDBACK_URLS.SRC,FEEDBACK_URLS[lang])) // replace feedback url placeholder
            .pipe(replace(MAP_URLS.SERVICE_MAP.SRC, MAP_URLS.SERVICE_MAP[lang])) // replace map url placeholder
            .pipe(inlineCss({
                url: 'file://' + __dirname + '/pages/template/', // specifies the base path for the stylesheet links
                applyStyleTags: true,
                applyLinkTags: true,
                removeStyleTags: true,
                removeLinkTags: true
            }))
            .pipe(htmlmin({ // minify html
                collapseWhitespace: true
            }))
            .pipe(rename(fileName)) // rename index.html according to fileName
            .pipe(gulp.dest(FILE_PATH[upperCaseService][lang].DEST)) // write to destination
    })
    cb();
}




