const fetch = require('node-fetch');

const endpoint = "http://127.0.0.1:3010/";

async function makeRequest(index) {
    if (index > 778) {
        // Base case: all requests have been made
        return;
    }

    const urls = [];
    for (let i = index; i < index + 5; i++) {
        urls.push(endpoint + i);
    }

    // Add a timeout of 30 seconds to each request
    const timeout = new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new Error('Request timed out'));
        }, 80000);
    });

    // Make the requests and race them against the timeout promise
    const promises = urls.map(url => Promise.race([
        fetch(url).then(response => response.json()),
        timeout
    ]));

    const results = await Promise.allSettled(promises);

    results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
            console.log(`Response received for ${urls[i]}: ${result.value.SNo.toString()}`);
        } else {
            console.error(`Error occurred for ${urls[i]}: ${result.reason}`);
            console.log(index + i);
        }
    });

    makeRequest(index + 5);
}

makeRequest(300);
