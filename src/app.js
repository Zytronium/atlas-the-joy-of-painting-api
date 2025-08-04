#!/bin/node
const express = require('express');
const dotenv = require('dotenv').config({ quiet: true });
const morgan = require("morgan");
const routes = require('./routes/index.js');
const PORT = process.env.PORT || 3000;

const app = express();

// Log requests to console
app.use(morgan("dev")); // Or "combined" for more detailed logs

// Allow JSON in requests
app.use(express.json());

// Serve routes
app.use("/episodes", routes);

// Run the server
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
