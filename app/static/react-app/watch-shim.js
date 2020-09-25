var fs = require('fs');

if (!fs.existsSync('./dist')) {
    fs.mkdir('./dist');
    fs.writeFileSync('./dist/bundle.js', '');
}