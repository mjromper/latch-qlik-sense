latch-qlik-sense
===

This is a NodeJS authentication module which can be used as a Demo or base code to implement a 2-Steps authentication in Qlik Sense with Latch.

# Create a Latch Application at ElevenPaths website

https://latch.elevenpaths.com/www/index.html

Create an account and then access 'Mis Aplicaciones'. Create a Latch application and then take note of the Application Id and Secret Id for later.

# Installation of this module for Qlik Sense Server (ServiceDispatcher)

* Launch PowerShell in Administrator mode (right-click and select Run As Administrator)
* Create and change directory to an empty directory, i.e. C:\TempLatch

```powershell
    mkdir \TempLatch; cd \TempLatch
```

* Download powershell install script. Enter command exactly as it is (including parentheses):

```powershell
    (Invoke-WebRequest "https://raw.githubusercontent.com/mjromper/latch-qlik-sense/master/setup.ps1" -OutFile setup.ps1)
```

* Execute install script:
```powershell
    ./setup.ps1
```

This will download and execute the setup script.

When the downloading and installation of the modules including their dependencies are finished you will be prompted for some configuration options. Some of them have predefault values that will be taken if you just press enter.

```
Enter name of user directory [latch]:
Enter QS hostname []: <enter your Qlik Sense hostname, just the hostname not the entire URL>
Enter port [4000]: <port authentication module runs on, default 4000>
Use secure connection? [Y/n] [n]:
Latch application ID []: <enter your Latch **latch app Id** value>
Latch client Secret []: <enter your Latch **latch client_secret** value>
```

This script will also setup a Virtual Proxy in Qlik Sense for this authentication. The virtual proxy is the one corresponding to the 'user directory'.

When the script had finished just open Qlik Sense through the newly configured Virtual Proxy.
http://(Qlik Sense Hostname)/(user_directory)/hub

