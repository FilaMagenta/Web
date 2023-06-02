#!/bin/sh

now=$(date +'%Y%m%d%H%m')

mkdir -p build
rm -f build/info.js
touch build/info.js

echo 'const buildInfo = {' >> build/info.js
echo "  buildDate: '$now'," >> build/info.js
echo "  version: '$version'," >> build/info.js
echo "  isRelease: $release," >> build/info.js
echo '};' >> build/info.js
