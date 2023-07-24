#!/bin/bash
aws lambda publish-layer-version --layer-name my-first-layer \
--description "My first layer for lambda with nodejs" \
--license-info "MIT" \
--zip-file fileb://nodejs-layer.zip \
--compatible-runtimes nodejs18.x \
--compatible-architectures x86_64 \
