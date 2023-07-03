const fetch = require('node-fetch');

const endpoint = "http://127.0.0.1:3010/";

function makeRequest(index) {
  if (index > 778) {
    // Base case: all requests have been made
    return;
  }

  const url = endpoint + index;
  // console.log(`Making request to ${url}`);
  // Add a timeout of 30 seconds to each request
  const timeout = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Request timed out'));
    }, 80000);
  });

  // Make the request and race it against the timeout promise
  Promise.race([
    fetch(url).then(response => response.json()),
    timeout
  ])
    .then(data => {
      // console.log(`Response received for ${url}: ${data.toString()}`);
      makeRequest(index + 1);
    })
    .catch(error => {
      // console.error(`Error occurred for ${url}: ${error}`);
      console.log(index);
      makeRequest(index + 1);
    });
}
makeRequest(1);