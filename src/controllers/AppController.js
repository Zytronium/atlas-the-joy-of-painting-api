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
    return res.status(200).send({ id: epDoc.id, ...epDoc.data() });
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

  static async getFromFilters(req, res) {
    // Get query params 'month', 'subjects', and 'colors'
    const { month, subjects, colors } = req.query;
    // Get query param `matchValues`, case-insensitive, defaulting to 'all' if missing or invalid
    const matchValues = ["all", "any"].includes((req.query.match || "").toLowerCase())
      ? req.query.match.toLowerCase()
      : "all"; // todo: consider changing to returning error 400 if value is invalid instead of silently defaulting to "all"
    const matchFilters = ["all", "any"].includes((req.query.match || "").toLowerCase())
      ? req.query.match.toLowerCase()
      : "all"; // todo: consider changing to returning error 400 if value is invalid instead of silently defaulting to "all"

    // Ensure at least one filter is provided
    if (!month && !subjects && !colors) {
      return res.status(400).send({
        error: "At least one of query params 'month', 'subjects', or 'colors' is required."
      });
    }

    // Get the "episodes" collection reference as a starter for the query
    let query = db.collection("episodes");

    // Build the query from the filters given
    if (month) {
      // Translate `MM/YYYY` to a Firebase timestamp (month start and end timestamps)
      const [monthStr, yearStr] = month.split("/");
      const monthIndex = parseInt(monthStr, 10) - 1;
      const year = parseInt(yearStr, 10);

      const start = new Date(Date.UTC(year, monthIndex, 1));
      const end = new Date(Date.UTC(year, monthIndex + 1, 1));

      // Add the query
      query = query
        .where("air_date", ">=", start)
        .where("air_date", "<", end);
    }
    if (subjects) {
      // Translate comma-separated subjects into an array and convert to uppercase to make case-insensitive (only works for subjects, not colors)
      const subjectList = subjects.split(",").map(s => s.trim().toUpperCase());
      // Add the query
      if (matchValues === "all") {
        // Add a query for each subject in the array
        subjectList.forEach(value => {
          query = query.where("subjects", "array-contains", value);
        });
      } else {
        // Add a single query for the subject array
        query = query.where("subjects", "array-contains-any", subjectList);
      }
    }
    if (colors) {
      // Translate comma-separated colors into an array
      const colorList = colors.split(",").map(s => s.trim());
      // Add the query
      if (matchValues === "all") {
        // Add a query for each color in the array
        colorList.forEach(value => {
          query = query.where("colors", "array-contains", value);
        });
      } else {
        // Add a single query for the color array
        query = query.where("colors", "array-contains-any", colorList);
      }
    }

    // Get list of episodes matching the given filters
    const querySnapshot = await query.get();

    // Check if any documents were found
    if (querySnapshot.empty)
      return res.status(404).send({ error: "No episodes found matching the given filters." });

    // Map all matching docs to an array of episodes
    const results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.status(200).send(results);
  }
}

module.exports = AppController;
