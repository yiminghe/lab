#!/usr/bin/env bash
rm -rf dist
mkdir dist
cp -r lite-ext dist/lite-ext
cp -r playground dist/playground
./node_modules/.bin/gh-pages -d dist