#!/bin/bash

#ensure couchdb is installed
if dpkg -l couchdb | grep --quiet -i -e 'couchdb'
  then
    echo 'couchdb already installed'
else
  sudo apt-get install couchdb
fi

#ensure node is installed
if dpkg -l nodejs | grep --quiet -i -e 'nodejs'
  then
    echo 'node already installed'
else
  sudo apt-get install nodejs
fi

#ensure grunt-cli is installed
if npm list -global true grunt-cli | grep --quiet -i -e 'grunt-cli'
  then
    echo 'grunt-cli already installed globally'
else
  sudo npm install -g grunt-cli
fi

#ensure ruby is installed
if dpkg -l ruby1.9.1 | grep --quiet -i -e 'ruby1.9.1'
  then
    echo 'ruby1.9.1 already installed'
else
  sudo apt-get install ruby1.9.1
fi

#ensure compass is installed
if gem list compass | grep --quiet -i -e 'compass'
  then
    echo 'compass gem already installed'
else
  sudo gem install compass
fi
