// app.js
const express = require("express");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("App is running..");
});

app.post("/api/logs", (req, res) => {
  const { msg, timestamp } = req.body;

  if (!msg) {
    return res
      .status(400)
      .json({ error: "Missing required fields: level and message." });
  }

  const logEntry = {
    timestamp: timestamp || new Date().toISOString(),
    message: msg,
  };

  const logFilePath = path.join(__dirname, "logs", "logs-2024-11-08.log");

  const logString = JSON.stringify(logEntry) + "\n";

  fs.appendFile(logFilePath, logString, (err) => {
    if (err) {
      console.error("Error writing log to file:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.status(200).json({ message: "Log received successfully." });
  });
});

app.get("/api/logs", async (req, res) => {
  let logEntries = [];

  try {
    const logFilePath = path.join(__dirname, "logs", "logs-2024-11-08.log");
    console.log(logFilePath);
    fs.readFile(logFilePath, "utf-8", (err, data) => {
      if (err) {
        if (err.code === "ENOENT") {
          console.error("File not found:", err.path);
        } else {
          console.error("Error reading file:", err);
        }
        return;
      }
      console.log("File content:", data);
      const lines = data.trim().split("\n");
      logEntries = lines.map((line) => JSON.parse(line));

      res.status(200).json({ logs: logEntries });
    });
  } catch (err) {
    if (err.code === "ENOENT") {
      return res.status(404).json({ error: "Log file not found." });
    }
    console.error("Error retrieving logs:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
