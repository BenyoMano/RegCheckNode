require("dotenv").config();
const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const { checkVehicle } = require("./checkVehicle");
const app = express();
const port = process.env.PORT || 3000;

app.set("trust proxy", true);

app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

app.use(express.json());

app.post("/check", async (req, res) => {
  const { regNumber } = req.body;
  if (!regNumber) {
    return res.status(400).send("Registration number is required");
  }

  try {
    const data = await checkVehicle(regNumber);
    res.json(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
