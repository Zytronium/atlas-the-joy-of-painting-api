const db = require("../utils/firebase");
const { FieldValue, Timestamp } = require("firebase-admin").firestore;

class AppController {
  static async getFromID(req, res) {
    // Find episode from its ID
    const episodeRef = db
      .collection("episodes")
      .doc(req.params.id);
    const epDoc = await episodeRef.get();

    // Check if the episode exists
    if (!epDoc.exists)
      return res.status(404).send({ error: "Episode not found." });

    // Return all data on this episode
    return res.status(200).send(await epDoc.data());
  }

  static async getFromName(req, res) {
    const episodeName = req.query.name;

    // Ensure ?name=someValue exists in the URL
    if (!episodeName) {
      return res.status(400).send({ error: "Query param 'name' is required" });
    }

    // Find episode from exact name
    const querySnapshot = await db
      .collection("episodes")
      .where("title", "==", episodeName)
      .limit(1) // There shouldn't be any duplicates, so we won't handle the situation where there are any.
      .get();

    // Ensure this doc exists
    if (querySnapshot.empty) {
      console.log("test123455667");
      return res.status(404).send({ error: "Episode not found." });
    }

    // Get the first (and hopefully only) doc that matches the given params
    const doc = querySnapshot.docs[0];
    return res.status(200).send({ id: doc.id, ...doc.data() });
  }

}

module.exports = AppController;
