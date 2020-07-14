'use strict';
const FS = require('fs');
const PATH = require('path');
const sass = require('sass');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano')({
    preset: [
        'default', {
            // 删除所有注释
            discardComments: {removeAll: true},
            normalizeUnicode: false
        }
    ]
});

FS.copyFileSync(PATH.join(__dirname, '../src/index.scss'), PATH.join(__dirname, '../dist/index.scss'));

const encoding = 'utf8';
const inPath = PATH.join(__dirname, '../dist/index.scss');
const outPath = PATH.join(__dirname, '../dist/index.css');
const minPath = PATH.join(__dirname, '../dist/index.min.css');
const sassOption = {
    file: inPath,
    outFile: outPath,
    sourceMap: true,
    outputStyle: 'expanded',
    indentType: 'space',
    indentWidth: 2,
    // 取消生成sourceMappingURL
    omitSourceMapUrl: true,
    // 生成contents
    sourceMapContents: true,
    // 生成单独sourceMap文件
    sourceMapEmbed: false
};

let content;
try {
    content = sass.renderSync(sassOption);
} catch (e) {
    throw e;
}

FS.existsSync(outPath) && FS.unlinkSync(outPath);
FS.writeFileSync(outPath, content.css, encoding);

const postcssOption = {
    from: inPath,
    to: minPath,
    map: {
        // 使用scss生成的sourcemap文件
        inline: false,
        prev: content.map.toString(),
        // sourcemap sourcesContent设置scss源文件
        sourcesContent: true,
        // 生成sourcemap url
        annotation: true
    }
};

postcss([autoprefixer, cssnano])
    .process(content.css, postcssOption)
    .then(value => {
        FS.existsSync(minPath) && FS.unlinkSync(minPath);
        FS.writeFileSync(minPath, value.css, encoding);

        const sm = PATH.join(__dirname, '../dist/index.min.css.map');
        FS.existsSync(sm) && FS.unlinkSync(sm);
        FS.writeFileSync(sm, value.map.toString(), encoding);
    });
