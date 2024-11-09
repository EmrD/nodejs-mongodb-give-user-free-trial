//login.js
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
  res.sendFile(__dirname + "/login.html");
});

app.get("/check_date", async (req, res) => {
  const url = new URLSearchParams(req.url.split('?')[1]);
  const username = url.get("user");

  if (!username) {
    return res.status(400).send("Username can not be empty.");
  }

  const check_expired = (date) => 
  {
    const edited_data = moment(date, "DD.MM.YYYY");
    const now = moment();

    const duration = moment.duration(edited_data.diff(now.format("YYYY-MM-DD")));
    const seconds = duration.seconds();
    const minutes = duration.minutes();
    const hours = duration.hours();
    const days = duration.days();
    const weeks = duration.weeks();
    const years = duration.years();

    if (seconds == 0 && minutes == 0 && hours == 0 && days == 0 && weeks == 0 && years ==0)
      res.send({error: "user expired"});

    else 
    {
      const kalanDate = {
        "years": years,
        "weeks": weeks,
        "days": days,
        "hours": hours,
        "minutes": minutes,
        "seconds": seconds
      };
      res.send(kalanDate)
    }
  }

  try {
    const userExists = await db.collection(username).findOne({ username });

    if (!userExists) {
      return res.status(404).send({error: "user not found"});
    }

    const expireDate = userExists.expireDate
    check_expired(expireDate);

  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).send("Internal server error.");
  }
});

app.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
  init_db();
});
