//Request package is not part of dependencies
const request = require('request');
const data = [
    //Contains all the Regno of the students to intialize the counter using external api
]

data.forEach((ele) => {
    request.get({
        url: `https://api.api-ninjas.com/v1/counter?id=id${ele}&value=1`,
        headers: {
            'X-Api-Key': 'Api key here'
        },
    }, function (error, response, body) {
        if (error) return console.log(ele.RegNo);
        else if (response.statusCode != 200) return console.log(ele);
        else console.log(body)
    });
})

