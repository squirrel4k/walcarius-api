# Walcarius | Administration backend webservice

## Used technologies
- Node 10.x LTS
- NestJS 5.x (exact version used in `package.json`)
- Mysql 5.7
- MongoDb 4.0.4
- Redis 5.0

## Installation
### Webservice basic install
```sh
# Get repository from Git
git clone https://itdm-group@bitbucket.org/itdmapps/webservice-devis.git

# Get into the newly created directory
cd ./webservice-devis

# Install project dependencies
npm i

# Build the project
npm run build

# Create a .env file. An example can be found in .example_env
cp .example_env .env

# Edit the .env file to configure the webservice. Each line is explained in the .example_env file
vim .env
```

### Database
See [Database documentation](./sql/README.md)

### Usage
```sh
# Run compiled version
npm run start
```

## Troubleshooting
### Puppeteer issues
```
UnhandledPromiseRejectionWarning: Error: Failed to launch chrome!
[...]/node_modules/puppeteer/.local-chromium/linux-706915/chrome-linux/chrome: error while loading shared libraries: libX11-xcb.so.1: cannot open shared object file: No such file or directory
```

Some dependencies of Chrome aren't installed on the system. A troubleshooting guide is available at [Puppeteer's Github](https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md).

You can try to run the following command : 
```sh
# The versions in the path in the node_modules can change depending on your system. Use the same as the one given in the error
ldd node_modules/puppeteer/.local-chromium/linux-706915/chrome-linux/chrome | grep not
```
This will show you what dependencies are not installed. This should look like this :
```
libX11-xcb.so.1 => not found
libXcomposite.so.1 => not found
libXcursor.so.1 => not found
libXdamage.so.1 => not found
libXfixes.so.3 => not found
libXi.so.6 => not found
libXrender.so.1 => not found
libXtst.so.6 => not found
libnss3.so => not found
libnssutil3.so => not found
libsmime3.so => not found
libnspr4.so => not found
libcups.so.2 => not found
libXss.so.1 => not found
libXrandr.so.2 => not found
libasound.so.2 => not found
libatk-1.0.so.0 => not found
libatk-bridge-2.0.so.0 => not found
libpangocairo-1.0.so.0 => not found
libpango-1.0.so.0 => not found
libcairo.so.2 => not found
libatspi.so.0 => not found
libgtk-3.so.0 => not found
libgdk-3.so.0 => not found
libgdk_pixbuf-2.0.so.0 => not found
```
Try to find the corresponding packages for those dependencies and install them. You can search [here](https://packages.debian.org/search?mode=filename&suite=buster&section=all&arch=i386&searchon=contents&keywords=search).  
As one package can resolve multiple dependencies, check the abose command each time you install a package.  
Once the command returns nothing, all dependencies have been met.

Known packages :
- `libgtk-3-0`
- `libnss3`
- `libxss1`
- `libasound2`