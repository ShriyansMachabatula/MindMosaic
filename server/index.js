const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

//tester api
app.get("/api", (req, res) => {
  res.json({message: "Hello from the server!"});
});

//link generation api
app.get("/generateLink", (req, res) => {
  //link generation logic
  const randomString = Math.random().toString(36).substring(2, 15);
  //change the link when deploying to the hosting service
  // `http://localhost:5173/session/${randomString}`
  // `https://mindmosaic-ar6t.onrender.com/session/${randomString}`
  const link = `http://localhost:5173/session/${randomString}`;

  res.json({ link });
});

//for deploying
//use the client app
app.use(express.static(path.join(__dirname, "/client/dist")));

//render client for any path
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "/client/dist/index.html"))
);


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
