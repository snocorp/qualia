#!/bin/bash

#ensure couchdb is installed
if brew list | grep --quiet -i -e 'couchdb'
  then
    echo 'couchdb already installed'
else
  brew install couchdb
fi

#ensure node is installed
if brew list | grep --quiet -i -e 'node'
  then
    echo 'node already installed'
else
  brew install node
fi

#ensure grunt-cli is installed
if npm list -global true grunt-cli | grep --quiet -i -e 'grunt-cli'
  then
    echo 'grunt-cli already installed globally'
else
  sudo npm install -g grunt-cli
fi

#ensure compass is installed
if gem list compass | grep --quiet -i -e 'compass'
  then
    echo 'compass gem already installed'
else
  sudo gem install compass
fi
