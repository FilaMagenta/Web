#!/bin/bash

now=$(date +'%Y%m%d%H%m')

cd src || exit 1

mkdir -p config
rm -f config/info.js
touch config/info.js

echo 'const buildInfo = {' >> config/info.js
echo "  buildDate: '$now'," >> config/info.js
echo "  version: '$version'," >> config/info.js
echo "  isRelease: $release," >> config/info.js
echo '};' >> config/info.js
