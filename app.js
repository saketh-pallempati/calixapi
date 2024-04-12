const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
app.use(express.json());
app.use(cors());
const axios = require("axios");

const { MongoClient } = require("mongodb");
const uri = process.env.MONGO;
const client = new MongoClient(uri);
const database = client.db("calicxData");
const students = database.collection("students");

app.get("/initialData", async (req, res) => {
  let output = await initialFetch().catch(console.dir);
  res.json(output);
});

app.get("/sort", async (req, res) => {
  let semno = req.query.sem;
  if (semno === "0") {
    semno = "cgpa";
  }
  let output = await sortedOrder(semno).catch(console.dir);
  res.json(output);
});
app.get("/branch", async (req, res) => {
  let branch = req.query.branch;
  branch = "B.Tech. " + branch;
  let ans = await sortBranch(branch);
  res.json(ans);
});
app.get("/:id", async (req, res) => {
  let sno = req.params.id;
  let output = await findDetails(sno).catch(console.dir);
  res.json(output);
});

app.get("/api/getViews/:test_id", async (req, res) => {
  let test_id = req.params.test_id;
  try {
    const response = await axios.get(
      `https://api.api-ninjas.com/v1/counter?id=id${test_id}&hit=true`,
      {
        headers: {
          "X-Api-Key": process.env.API,
        },
      }
    );
    const ans = response.data;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(ans.value.toString());
  } catch (error) {
    console.error("Request failed:", error);
  }
});

async function findDetails(sno) {
  const filter = { SNo: parseInt(sno) };
  return await students.findOne(filter);
}
async function sortBranch(branch) {
  try {
    return await students
      .find({ Branch: branch.toString() })
      .project({
        _id: 0,
        RegNo: 1,
        Name: 1,
        Branch: 1,
        gpa: 1,
        rank: 1,
        SNo: 1,
      })
      .sort({ rank: 1 })
      .toArray();
  } catch (error) {
    console.error(error);
  }
}
function sortedOrder(semno) {
  const query = `{"gpa.${semno}" : -1}`;
  return students
    .find()
    .project({ _id: 0, RegNo: 1, Name: 1, Branch: 1, gpa: 1, rank: 1, SNo: 1 })
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

app.listen(process.env.PORT, () =>
  console.log("Server started at " + process.env.PORT)
);
