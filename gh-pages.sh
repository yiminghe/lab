#!/usr/bin/env bash
rm -rf dist
mkdir dist
cp -r lite-ext dist/lite-ext
cp -r playground dist/playground
cp -r docs dist/docs
./node_modules/.bin/replace '/node_modules/reveal.js/' '//cdnjs.cloudflare.com/ajax/libs/reveal.js/3.1.0/' dist/docs -r --include="*.html"
./node_modules/.bin/gh-pages -d dist