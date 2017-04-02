#!/bin/bash

rm -rf ./ts/_proto
rm -rf ./go/_proto

mkdir -p ./ts/_proto
mkdir -p ./go/_proto

protoc \
  --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
  --plugin=protoc-gen-go=${GOPATH}/bin/protoc-gen-go \
  -I ./proto \
  --js_out=import_style=commonjs,binary:./ts/_proto \
  --go_out=plugins=grpc:./go/_proto \
  --ts_out=service=true:./ts/_proto \
  ./proto/examplecom/library/book_service.proto
