#!/bin/bash
npm i --omit=dev
mkdir nodejs/
mv node_modules/ nodejs/
zip -r nodejs-layer.zip nodejs/
rm -rf nodejs/
