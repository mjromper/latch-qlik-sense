latch-qlik-sense
===

# Requirements
* Nodejs (https://nodejs.org/en/)
* Bower
Install bower by typing "npm install -g bower"

# Quick start

## Install dependencies

Server dependencies
```shell
npm install
```

Client packages
```shell
cd public && bower install && cd ..
```

## Configuration

Edit **config.js** setting Sense Server hostname, virtual proxy and **Latch** credencials

## Run the server
```shell
npm start
```

## Certificates

Export certificates using QMC and copy **client.pem** and **client_key.pem** into **/certs** folder

## Setup a virtual proxy

* Prefix: latch
* Method: Ticket
* Access mode: No anonymous user
* Redirect uri: http://hostname_node_server:3000/authenticate

