const fs = require('fs');

function writeToFile(data, filename) {
    fs.writeFile(filename, JSON.stringify(data), (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });
}


const sem0 = require("./ServerStaticData/sem4.json")
function removeFields(arr) {
    arr.forEach(function (obj) {
        for (let key in obj.gpa) {
            if (key !== '4') {
                delete obj.gpa[key];
            }
        }
    });
    return arr;
}
const data = removeFields(sem0);
writeToFile(data, 'output.json');
