//register.js
const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
const dotenv = require("dotenv");
const moment = require("moment");
dotenv.config();
const dburl = process.env.DB_URL;
const client = new MongoClient(dburl);
const dbname = "users_db";

let db;

const init_db = async () => {
  try {
    await client.connect();
    console.log("Database connected.");
    db = client.db(dbname);
  } catch (error) {
    console.error("Database connection error:", error);
  }
};

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/register.html");
});

app.get("/register", async (req, res) => {
  const url = new URLSearchParams(req.url.split('?')[1]);
  const username = url.get("user");
  const expire_date = moment().add(1, 'year');
  const expire_date_formatted = expire_date.format("DD.MM.YYYY");

  if (!username) {
    return res.status(400).send("Username can not be empty.");
  };

  if (db.collection(username)) {
    if (await db.collection(username).findOne({ username })) {
      return res.status(400).send("User already exists.");
    }
    else 
    {
      db.collection(username).insertOne({ username: username , expireDate: expire_date_formatted });
      res.send("User created.");
    }
  } else {
    db.createCollection(username);
    db.collection(username).insertOne({ username: username , expireDate: expire_date_formatted });
  };
});

app.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
  init_db();
});
