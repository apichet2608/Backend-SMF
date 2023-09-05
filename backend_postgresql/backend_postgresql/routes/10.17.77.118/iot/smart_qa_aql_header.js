const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.77.118",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "iot",
});

const query = (text, params) => pool.query(text, params);

router.get("/header", async (req, res) => {
  try {
    // Extract the 'process' query parameter from the request
    const { process, type } = req.query;

    if (!process) {
      // If 'process' query parameter is missing, return a 400 Bad Request response
      return res
        .status(400)
        .json({ error: "Missing 'process' query parameter" });
    }

    const result = await pool.query(
      `SELECT * FROM public.smart_qa_aql_header WHERE process = $1 AND type = $2 ORDER BY id DESC`,
      [process, type]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
