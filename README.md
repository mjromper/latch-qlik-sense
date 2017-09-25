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

### Installation of this module within Qlik Sense ServiceDispatcher

* Launch PowerShell in Administrator mode (right-click and select Run As Administrator)
* Create and change directory to an empty directory, i.e. C:\TempLatch

```powershell
    mkdir \TempLatch; cd \TempLatch
```

* Enter the below command exactly as it is (including parentheses):

```powershell
    (Invoke-WebRequest "https://raw.githubusercontent.com/mjromper/latch-qlik-sense/master/setup.ps1" -OutFile setup.ps1) | .\setup.ps1
```

This will download and execute the setup script.

When the downloading and installation of the modules including their dependencies are finished you will be prompted for some configuration options.

```
Enter name of user directory [LATCH]:
Enter port [4000]:
Use secure connection? [Y/N]:
Application ID []: enter your Latch **client_id** value
Client Secret []: enter your Latch **client_secret** value
```


## Setup a virtual proxy

* Prefix: latch
* Method: Ticket
* Access mode: No anonymous user
* Redirect uri: http://hostname_node_server:3000/authenticate

