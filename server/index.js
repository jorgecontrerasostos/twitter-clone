const express = require("express");
const cors = require("cors");
const monk = require("monk");
const app = express();
const Filter = require("bad-words");
const rateLimit = require("express-rate-limit");

app.use(cors());
app.use(express.json());

const db = monk("localhost/twitter");
const tweets = db.get("tweets");
const filter = new Filter();

app.get("/", (req, res) => {
  res.json({
    message: "Hello"
  });
});
app.get("/tweets", (req, res) => {
  tweets.find().then(tweets => {
    res.json(tweets);
  });
});
function isValidTweet(tweet) {
  return (
    tweet.name &&
    tweet.name.toString().trim() !== "" &&
    tweet.content &&
    tweet.content.toString().trim() !== ""
  );
}
app.use(
  rateLimit({
    windowMS: 30 * 1000,
    max: 1
  })
);
app.post("/tweets", (req, res) => {
  if (isValidTweet(req.body)) {
    //insert into db
    const tweet = {
      name: filter.clean(req.body.name.toString()),
      content: filter.clean(req.body.content.toString()),
      created: new Date()
    };
    tweets.insert(tweet).then(createdTweet => {
      res.json(createdTweet);
    });
  } else {
    res.status(422);
    res.json({
      message: "Name and content required"
    });
  }
});
app.listen(5000, () => {
  console.log("Server running");
});
