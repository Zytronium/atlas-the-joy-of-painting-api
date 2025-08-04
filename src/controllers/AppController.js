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
    if (!episodeName)
      return res.status(400).send({ error: "Query param 'name' is required." });

    // Find episode from exact name
    const querySnapshot = await db
      .collection("episodes")
      .where("title", "==", episodeName)
      .limit(1) // There shouldn't be any duplicates, so we won't handle the situation where there are any.
      .get();

    // Ensure this doc exists
    if (querySnapshot.empty)
      return res.status(404).send({ error: "Episode not found." });

    // Get the first (and hopefully only) doc that matches the given params
    const epDoc = querySnapshot.docs[0];
    return res.status(200).send({ id: epDoc.id, ...epDoc.data() });
  }

  static async getFromfilters(req, res) {
    const { month, subject, color } = req.query;

    // Ensure at least one filter is provided
    if (!month && !subject && !color) {
      return res.status(400).send({
        error: "At least one of query params 'month', 'subject', or 'color' is required."
      });
    }

    // Get the "episodes" collection reference as a starter for the query
    let query = db.collection("episodes");

    // Build the query from the filters given
    if (month)
      query = query.where("month", "==", month); // this won't work since there is no month in db (it's air_date, which is a tiemstamp)
    if (subject)
      query = query.where("subject", "==", subject); // this won't work as it's actually an array called "subjects"
    if (color)
      query = query.where("color", "==", color); // this won't work as it's actually an array called "colors"

    // Get list of episodes matching the given filters
    const querySnapshot = await query.get();

    // Check if any documents were found
    if (querySnapshot.empty)
      return res.status(404).send({ error: "No episodes found matching the given filters." });

    // Map all matching docs to an array of episodes
    const results = querySnapshot.docs.map(doc => doc.data());

    return res.status(200).send(results);


    // -------- Everything below here is WIP and mostly copy-pasted from previous route --------


    // Ensure this doc exists
    if (querySnapshot.empty)
      return res.status(404).send({ error: "Episode not found." });

    // Get the first (and hopefully only) doc that matches the given params
    const epDoc = querySnapshot.docs[0];
    return res.status(200).send({ id: epDoc.id, ...epDoc.data() });
  }

}

module.exports = AppController;
