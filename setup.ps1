$nl = [Environment]::NewLine

If (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(`
    [Security.Principal.WindowsBuiltInRole] "Administrator"))
{
    Write-Host "You do not have Administrator rights to run this script!`nPlease re-run this script as an Administrator!"
    Write-Host $nl"Press any key to continue ..."
    $x = $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Break
}

# Set black background
$Host.UI.RawUI.BackgroundColor = "Black"
Clear-Host

# define some variables
$temp="c:\TempLatch\LatchAuthSetup-yFH4gu"
$npm="npm-1.4.9.zip"
$config="c:\Program Files\Qlik\Sense\ServiceDispatcher"
$target="$config\Node\Latch-Auth"
$moduleName="latch-qlik-sense"


# check if module is installed
# if(!(Test-Path -Path "$target\node_modules")) {

    $confirm = Read-Host "This script will install the Latch Auth module for Qlik Sense, do you want to proceed? [Y/n]"
    if ($confirm -eq 'n') {
      Break
    }

    # check if npm has been downloaded already
    if(!(Test-Path -Path "$temp\$npm")) {
        New-Item -Path "$temp" -Type directory -force | Out-Null
        Invoke-WebRequest "http://nodejs.org/dist/npm/$npm" -OutFile "$temp\$npm"
    }

    New-Item -Path "$target" -Type directory -force | Out-Null
    New-Item -Path "$temp" -Type directory -force | Out-Null

    # Installing Qlik-CLI
    Write-Host "Downloading Qlik-Cli from Github and importing the Module"
    Invoke-WebRequest "https://raw.githubusercontent.com/ahaydon/Qlik-Cli/master/Qlik-Cli.psm1" -OutFile $temp\Qlik-Cli.psm1
    New-Item -ItemType directory -Path C:\Windows\System32\WindowsPowerShell\v1.0\Modules\Qlik-Cli -force
    Move-Item $temp\Qlik-Cli.psm1 C:\Windows\System32\WindowsPowerShell\v1.0\Modules\Qlik-Cli\ -force
    Import-Module Qlik-Cli.psm1

    # check if module has been downloaded
    # if(!(Test-Path -Path "$target")) {
        Write-Host "Extracting Latch modules..."
        Invoke-WebRequest "https://github.com/mjromper/$moduleName/archive/master.zip" -OutFile "$temp\$moduleName-master.zip"
        Expand-Archive -LiteralPath $temp\$moduleName-master.zip -DestinationPath $temp -Force
        Copy-Item $temp\$moduleName-master\* $target -Force -Recurse
    # }

    # check if npm has been unzipped already
    if(!(Test-Path -Path "$temp\node_modules")) {
        Write-Host "Extracting files..."
        Add-Type -assembly "system.io.compression.filesystem"
        [io.compression.zipfile]::ExtractToDirectory("$temp\$npm", "$temp")
    }

    # install module with dependencies
    Write-Host "Installing modules..."
    Push-Location "$target"
    $env:Path=$env:Path + ";$config\Node"
    &$temp\npm.cmd config set spin=false
    &$temp\npm.cmd --prefix "$target" install
    Pop-Location

    # cleanup temporary data
    Write-Host $nl"Removing temporary files..."
    Remove-Item $temp -recurse
#}


function Read-Default($text, $defaultValue) { $prompt = Read-Host "$($text) [$($defaultValue)]"; return ($defaultValue,$prompt)[[bool]$prompt]; }

# check if config has been added already
if (!(Select-String -path "$config\services.conf" -pattern "Identity=aor-latch-auth" -quiet)) {

    $settings = @"


[latch-auth]
Identity=aor-latch-auth
Enabled=true
DisplayName=Latch Auth
ExecType=nodejs
ExePath=Node\node.exe
Script=Node\latch-auth\server\service.js

[latch-auth.parameters]
user_directory=
qlik_sense_hostname=
auth_port=
is_secure=
client_id=
client_secret=
"@
    Add-Content "$config\services.conf" $settings
}

# configure module
Write-Host $nl"CONFIGURE MODULE"
Write-Host $nl"To make changes to the configuration in the future just re-run this script."

$user_directory=Read-Default $nl"Enter name of user directory" "latch"
$qlik_sense_hostname=Read-Default $nl"Enter QS hostname" $qlik_sense_hostname
$auth_port=Read-Default $nl"Enter port" "4000"
$is_secure=Read-Default $nl"Use secure connection? [Y/n]" "n"
$client_id=Read-Default $nl"Latch application ID" $client_id
$client_secret=Read-Default $nl"Latch client Secret" $client_secret

function Set-Config( $file, $key, $value )
{
    $regreplace = $("(?<=$key).*?=.*")
    $regvalue = $("=" + $value)
    if (([regex]::Match((Get-Content $file),$regreplace)).success) {
        (Get-Content $file) `
            |Foreach-Object { [regex]::Replace($_,$regreplace,$regvalue)
         } | Set-Content $file
    }
}

# write changes to configuration file
Write-Host $nl"Updating configuration..."
Set-Config -file "$config\services.conf" -key "user_directory" -value $user_directory
Set-Config -file "$config\services.conf" -key "qlik_sense_hostname" -value $qlik_sense_hostname
Set-Config -file "$config\services.conf" -key "auth_port" -value $auth_port
Set-Config -file "$config\services.conf" -key "is_secure" -value $is_secure
Set-Config -file "$config\services.conf" -key "client_id" -value $client_id
Set-Config -file "$config\services.conf" -key "client_secret" -value $client_secret

# Adding/updating virtual proxy
$VPId=$(Get-QlikVirtualProxy -filter "description eq '$user_directory'")
if ( !$VPId) {
    Write-Host "Creating Virtual Proxy"
    New-QlikVirtualProxy -prefix $($user_directory) -description $($user_directory) -authUri http://$($qlik_sense_hostname):$($auth_port)/authenticate -sessionCookieHeaderName X-Qlik-Session-$($user_directory) -loadBalancingServerNodes $(Get-QlikNode).id -websocketCrossOriginWhiteList $($qlik_sense_hostname)
    $VPId=$(Get-QlikVirtualProxy -filter "description eq '$user_directory'")
}else{
    Write-Host "Updating Virtual proxy"
    Update-QlikVirtualProxy -id $VPId.id -description $($user_directory) -authUri http://$($qlik_sense_hostname):$($auth_port)/authenticate -sessionCookieHeaderName X-Qlik-Session-$($user_directory) -loadBalancingServerNodes $(Get-QlikNode).id -websocketCrossOriginWhiteList $($qlik_sense_hostname)
}
Add-QlikProxy -ProxyId $(Get-QlikProxy).id -VirtualProxyId $VPId.id



# Restart ServiceDipatcher
Write-Host $nl"Restarting ServiceDispatcher.."
net stop QlikSenseServiceDispatcher
start-sleep 5
net start QlikSenseServiceDispatcher
Write-Host $nl"Done! 'Qlik Sense Service Dispatcher' restarted."$nl
Write-Host $nl"Done! Latch Auth module installed."$nl