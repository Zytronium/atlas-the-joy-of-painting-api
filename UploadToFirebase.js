#!/bin/node
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const serviceAccount = require("./the-joy-of-coding-firebase-adminsdk-fbsvc-b1a99d83d8.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

function loadCSV(filePath) {
  return new Promise((resolve, reject) => {
    const data = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => data.push(row))
      .on("end", () => resolve(data))
      .on("error", reject);
  });
}

(async () => {
  const colorData = await loadCSV("Colors_Used.csv");
  const subjectData = await loadCSV("Subject_Matter.csv");
  const episodeData = await loadCSV("Episode_Dates.csv");

  // Organize colors by episode
  const colorsByEpisode = {};
  for (const row of colorData) {
    const episode = row.EPISODE?.trim();
    const color = row.COLOR?.trim();
    if (!episode || !color) continue;
    if (!colorsByEpisode[episode]) colorsByEpisode[episode] = [];
    colorsByEpisode[episode].push(color);
  }

  // Organize subjects by episode
  const subjectsByEpisode = {};
  for (const row of subjectData) {
    const episode = row.EPISODE?.trim();
    const subject = row.SUBJECT?.trim();
    if (!episode || !subject) continue;
    subjectsByEpisode[episode] = subject;
  }

  for (const row of episodeData) {
    const id = row.EPISODE?.trim();
    if (!id) {
      console.warn("Skipping row with missing EPISODE ID:", row);
      continue;
    }

    const docData = {
      title: row.TITLE?.trim() || null,
      season: parseInt(row.SEASON) || null,
      episode: parseInt(row.EPISODE_NUM) || null,
      air_date: row.AIR_DATE?.trim() || null,
      colors: colorsByEpisode[id] || [],
      subject: subjectsByEpisode[id] || null
    };

    await db.collection("episodes").doc(id).set(docData);
    console.log(`Uploaded: ${id}`);
  }

  console.log("All episodes uploaded.");
})();
