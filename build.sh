#!/bin/bash
BRANCH_NAME=`git branch | grep '*' | awk '{print $2}'`
VERSION=`git describe --always`-$BRANCH_NAME
sed s/exports\.version.*$/exports.version=\"$VERSION\"/ ./version.js > version.js.tmp
mv -f version.js.tmp version.js
#apt-get install -y python
#apt-get install -y squashfs-tools
DST_DIR=tmp/babel-built/
npm i
babel --ignore node_modules,public,tmp --loose es6.modules -d $DST_DIR . ./bin/www
cp ./package.json $DST_DIR/
cp -r ./public $DST_DIR/
cd $DST_DIR
echo '1,1024,512,512' >  /sys/module/lowmemorykiller/parameters/minfree
nodec -d ../tmp/ --root=. bin/www.js -o ../IPTV-$VERSION
# --clean-tmpdir 
