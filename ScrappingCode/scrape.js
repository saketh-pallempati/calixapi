const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());

// This procedure is only necessary for scraping. Once the data is retrieved, it is stored in the database to reduce the overhead of Puppeteer, which is resource-intensive.const puppeteer = require('puppeteer');
const { spawn } = require("child_process");
//Puppeter library is not part of dependencies it has to be installed manually
const puppeteer = require('puppeteer');
async function gotoPython(index) {
  return new Promise((resolve, reject) => {
    console.log(`Index = ${index}`);
    const pythonProcess = spawn('py', ["C:/Users/saket/Code/Web/Captcha/sai.py", index]);
    let cnt = 0;
    pythonProcess.stdout.on('data', (data) => {
      let solvedcaptcha = data.toString();
      ++cnt;
      if (cnt > 2) {
        let myarray = solvedcaptcha.split('($')
        resolve(myarray[1]);
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Error from Python: ${data}`);
      reject(data);
    });
  });
}


app.get("/initialData", async (req, res) => {
  let output = await initialFetch().catch(console.dir);
  res.json(output);
});

app.get("/sort", async (req, res) => {
  let sem = req.query.sem;
  let output = await sortedOrder(sem).catch(console.dir);
  res.json(output);
});

app.get("/:id", async (req, res) => {
  let sno = req.params.id;
  console.log(sno);
  let output = await run(sno).catch(console.dir);
  res.json(output);
});

const { MongoClient } = require("mongodb");
const { log } = require("console");
const uri = "mongodb+srv://test:1236@crud.zwn20xh.mongodb.net/test";
const client = new MongoClient(uri);

// async function run(sno) {
//   const filter = { SNo: parseInt(sno) };
//   const update = { $inc: { views: 1 } };
//   const options = { returnNewDocument: true };
//   return await students.findOneAndUpdate(filter, update, options);
// }
async function run(sno) {
  try {
    const database = client.db("Project");
    const students = database.collection("students");
    const ans = await students.findOne({ "SNo": Number(sno) });
    if (!ans) {
      console.log(`No student found with SNo: ${sno}`);
      return;
    }
    let datetemp = ans.DOB;
    let month = datetemp.slice(0, 2);
    let date = datetemp.slice(3, 5);
    let year = datetemp.slice(6);
    let DOB = date + month + year;

    if (ans.gpa["4"]) {
      console.log("Before");
      console.log(sno);
      return ans;
    }
    const [gpaobj, subjectarr] = await scrape(ans.RegNo.toString(), DOB);
    console.log("After");
    console.log(sno);
    await students.updateOne({ _id: ans._id }, { $set: { gpa: gpaobj, subject: subjectarr } });
    console.log("Done " + sno);
    return ans;
  } catch (err) {
    console.log(err);
  }
}


async function scrape(RegNo, DOB) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("https://webstream.sastra.edu/sastraparentweb/");
  // await page.goto("https://webstream.sastra.edu/sastrapwi/");

  // Set screen size
  // await page.setViewport({ width: 1024, height: 1600 });
  await page.setDefaultTimeout(60000);
  const regno = await page.waitForSelector('#txtRegNumber');
  await regno.focus();
  await regno.type(RegNo);
  const date = await page.waitForSelector('#txtPwd');
  await date.focus();
  await date.type(DOB);
  // const captcha = await page.waitForSelector('#imgCaptcha');
  // await captcha.screenshot({ path: `C:/Users/saket/Code/Web/Backend/public/${sno}.png`, type: 'png' });

  const captcha = await page.waitForSelector('#imgCaptcha');
  let images = await page.$$eval('#imgCaptcha', imgs => imgs.map(img => img.naturalWidth));
  async function check(images) {
    if (images[0] !== 200) {
      await captcha.evaluate(b => b.click());
      images = await page.$$eval('#imgCaptcha', imgs => imgs.map(img => img.naturalWidth));
      check(images);
    } else {
      await captcha.screenshot({ path: `C:/Users/saket/Code/Web/Backend/CaptchaImg/${RegNo.slice(-5, 9)}.png`, type: 'png' });
    }
  }
  await check(images);
  const finalcaptchaans = await gotoPython(RegNo.slice(-5, 9));
  console.log(finalcaptchaans);
  const captchans = await page.waitForSelector('#answer')
  await captchans.click();
  await captchans.type(finalcaptchaans);
  const submitButton = await page.waitForSelector('.clsSubmit')
  await submitButton.click();
  // async function waitForElement() {
  //   if (finalcaptchaans !== '0') {
  //     await captchans.type(finalcaptchaans);
  //     const submitButton = await page.waitForSelector('.clsSubmit')
  //     // await submitButton.click();
  //     finalcaptchaans = '0';
  //   }
  //   else {
  //     setTimeout(waitForElement, 250);
  //   }
  // }
  // await waitForElement();

  await page.waitForNavigation();

  const [link] = await page.$x("//a[contains(., 'Credits/Marks')]");
  if (link) {
    await link.click();
  }

  const allmarks = await page.waitForSelector("table[style='width: 15%']");
  const subjectmarks = await page.waitForSelector("table[style='width: 98%']");
  let final = await allmarks.evaluate((node) => node.innerText);
  let subject = await subjectmarks.evaluate((subjectmarks) => subjectmarks.innerText);

  let lines = subject.split('\n');
  lines.splice(0, 2);
  let cgpa = lines[lines.length - 1]
  lines.pop();
  let newarr;
  const fields = ['Sem', 'Mon / Year', 'Code', 'Description', 'CIA', 'Credit', 'Grade']
  let subjectarr = [];

  lines.forEach((ele) => {
    newarr = ele.split('\t');
    let subjectobj = {};
    let i = 0;
    newarr.forEach((ele) => {
      subjectobj[fields[i]] = ele
      i++;
    })
    subjectarr.push(subjectobj);
  })
  final = final.replace(/\s/g, "").slice(12);
  let stringArray = final.match(/.{1,7}/g);
  let result = {};
  for (let i = 0; i < stringArray.length; i++) {
    let key = stringArray[i].substring(0, 1);
    let value = stringArray[i].substring(1);
    result[key] = value;
  }
  let gpaobj = result;

  gpaobj['cgpa'] = cgpa.slice(7);
  await browser.close();

  setTimeout(async () => {
    if (!browser.isConnected()) {
      console.log('Browser is already closed');
      return;
    }
    await browser.close();
  }, 80000);

  return [gpaobj, subjectarr];
};


async function sortedOrder(sem) {
  if (sem == 0) {
    return students
      .find()
      .project({ _id: 0, RegNo: 1, Name: 1, Branch: 1, gpa: 1, rank: 1, SNo: 1 })
      .sort({ "rank": 1 })
      .limit(10)
      .toArray();
  }

  const query = `{"gpa.${sem}" : -1}`;
  return students
    .find()
    .project({ _id: 0, RegNo: 1, Name: 1, Branch: 1, gpa: 1, rank: 1 })
    .sort(JSON.parse(query))
    .limit(10)
    .toArray();
}
async function initialFetch() {
  return await students
    .find()
    .project({ _id: 0, RegNo: 1, Name: 1, SNo: 1 })
    .toArray();
}
app.listen(3010, () => console.log("Server started at " + 3010));