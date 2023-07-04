const express = require("express");
const app = express();
const cors = require("cors");
require('dotenv').config();
const request = require('request');
const { MongoClient } = require("mongodb");

app.use(express.json());
app.use(cors());

app.get('/api/getViews/:test_id', async (req, res) => {
  let test_id = req.params.test_id;
  request.get({
    url: `https://api.api-ninjas.com/v1/counter?id=id${test_id}&hit=true`,
    headers: {
      'X-Api-Key': process.env.API
    },
  }, function (error, response, body) {
    if (error) return console.error('Request failed:', error);
    else if (response.statusCode != 200) return console.error('Error:', response.statusCode, body.toString('utf8'));
    else {
      const ans = JSON.parse(body);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send(ans.value.toString())
    }
  });
});

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
  let output = await run(sno).catch(console.dir);
  res.json(output);
});

const uri = process.env.MONGO;
const client = new MongoClient(uri);
const database = client.db("Project");
const students = database.collection("students");

async function run(sno) {
  const filter = { SNo: parseInt(sno) };
  return await students.findOne(filter);
}

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

app.listen(process.env.PORT, () => console.log("Server started at " + process.env.PORT));