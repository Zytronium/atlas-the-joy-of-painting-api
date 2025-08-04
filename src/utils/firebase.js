const admin = require("firebase-admin");
const serviceAccount = require("../the-joy-of-coding-firebase-adminsdk-fbsvc-b1a99d83d8.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = db;
