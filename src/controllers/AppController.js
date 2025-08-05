const db = require("../utils/firebase");

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

    // Get the "episodes" collection reference as a starter for the master query if `matchFilters` is set to "all"
    let masterQuery = db.collection("episodes");

    // Create an array to contain each individual Firebase query for each filter
    const queries = []; // This allows running each query separately if `matchFilters` is set to "any"

    // `masterQuery` is used if `matchFilters` === "all", else, `queries` is used.

    // Build the query from the filters given
    if (month) {
      // Translate `MM/YYYY` to a Firebase timestamp (month start and end timestamps)
      const [monthStr, yearStr] = month.split("/");
      const monthIndex = parseInt(monthStr, 10) - 1;
      const year = parseInt(yearStr, 10);

      const start = new Date(Date.UTC(year, monthIndex, 1));
      const end = new Date(Date.UTC(year, monthIndex + 1, 1));

      // Add the query
      if (matchFilters === "all") {
        masterQuery = masterQuery
          .where("air_date", ">=", start)
          .where("air_date", "<", end);
      } else {
        queries.push(
          db.collection("episodes")
            .where("air_date", ">=", start)
            .where("air_date", "<", end)
        );
      }
    }
    if (subjects) {
      // Translate comma-separated subjects into an array and convert to uppercase to make case-insensitive (only works for subjects, not colors)
      const subjectList = subjects.split(",").map(s => s.trim().toUpperCase());
      // Add the query | Note: Don't get matchValues and matchFilters confused. They are both used here.
      if (matchValues === "all") {
        // Create a single query that contains each .where query for each subject
        let query = db.collection("episodes");

        // Add a query for each subject in the array
        if (matchFilters === "all") {
          subjectList.forEach(value => {
            masterQuery = masterQuery.where("subjects", "array-contains", value);
          });
        } else {
          subjectList.forEach(value => {
            query = query.where("subjects", "array-contains", value);
          });
          // Add these as a single query to the queries array
          queries.push(query);
        }
      } else {
        // Add a single query for the entire subject array
        if (matchFilters === "all") {
          masterQuery = masterQuery.where("subjects", "array-contains-any", subjectList);
        } else {
          queries.push(db.collection("episodes").where("subjects", "array-contains-any", subjectList));
        }
      }
    }
    if (colors) {
      // Translate comma-separated colors into an array
      const colorList = colors.split(",").map(s => s.trim());
      // Add the query | Note: Don't get matchValues and matchFilters confused. They are both used here.
      if (matchValues === "all") {
        // Create a single query that contains each .where query for each color
        let query = db.collection("episodes");

        // Add a query for each color in the array
        if (matchFilters === "all") {
          colorList.forEach(value => {
            masterQuery = masterQuery.where("colors", "array-contains", value);
          });
        } else {
          colorList.forEach(value => {
            query = query.where("colors", "array-contains", value);
          });
          // Add these as a single query to the queries array
          queries.push(query);
        }
      } else {
        if (matchFilters === "all") {
          masterQuery = masterQuery.where("colors", "array-contains-any", colorList);
        } else {
          // Add a single query for the entire color array
          queries.push(db.collection("episodes").where("colors", "array-contains-any", colorList));
        }
      }
    }

    // Create results array to later combine query results
    let results = [];

    if (matchFilters === "all") {
      // Run the master query

      // Get list of episodes matching the given filters
      const snapshot = await masterQuery.get()

      // Check if any documents were found
      if (snapshot.empty) {
        return res.status(404).send({ error: "No episodes found matching the given filters." });
      }

      // Map all matching docs to an array of episodes
      results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } else {
      // Run all queries in `queries`

      // Get each snapshot containing the episodes matching any of the filters for each query
      const snapshots = await Promise.all(queries.map(q => q.get()));
      const seen = new Set(); // A set to contain each doc and prevent duplicate results. Faster than using an array.

      // Add each result to the results array, excluding duplicates
      snapshots.forEach(snapshot => {
        snapshot.forEach(doc => {
          // Add this result to the results array if it's not been accounted for already
          if (!seen.has(doc.id)) {
            seen.add(doc.data());
            results.push({
              id: doc.id,
              ...doc.data()
            });
          }
        });
      });

      // Check if any results were found
      if (results.length === 0) {
        return res.status(404).send({ error: "No episodes found matching the given filters" });
      }
    }

    // Return the results of this query.
    return res.status(200).send(results);
  }
}

module.exports = AppController;
