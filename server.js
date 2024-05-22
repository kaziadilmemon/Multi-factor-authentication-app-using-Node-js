const express = require("express");
const cors = require("cors");
const router = require("./routes/route");
require("dotenv").config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api", router);

const PORT = process.env.PORT || 5000;

const start = () => {
  try {
    app.listen(PORT, () => {
      console.log(`server started at ${PORT}`);
    });
  } catch (error) {
    console.log("some error occured");
    console.log(error);
  }
};
start();
