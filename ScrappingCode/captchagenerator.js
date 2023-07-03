const puppeteer = require('puppeteer');

function sai(i, j) {
    for (let index = i; index < j; index++) {
        (async () => {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.setDefaultNavigationTimeout(0);
            await page.goto("https://webstream.sastra.edu/sastraparentweb/");
            const captcha = await page.waitForSelector('#imgCaptcha');
            let images = await page.$$eval('#imgCaptcha', imgs => imgs.map(img => img.naturalWidth));
            async function check(images) {
                if (images[0] !== 200) {
                    console.log('not', index);
                } else {
                    await captcha.screenshot({ path: `C:/Users/saket/Code/Web/Backend/ML/${index}.png`, type: 'png' });
                    await browser.close();
                    console.log('done', index);
                }
            }
            check(images);
        })();
    }
}
let i = 30;
setInterval(() => {
    sai(i, i + 10);
    i = i + 10;
}, 30000);
