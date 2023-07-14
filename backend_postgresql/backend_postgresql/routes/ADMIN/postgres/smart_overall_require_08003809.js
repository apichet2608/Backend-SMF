const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.77.111",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "postgres",
});

const query = (text, params) => pool.query(text, params);

router.get("/distinctaspects", async (req, res) => {
  try {
    const result = await query(`
      SELECT DISTINCT aspects
      FROM public.smart_overall_require_08003809
      ORDER BY aspects ASC
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctaspect", async (req, res) => {
  try {
    const { aspects } = req.query;

    const queryStr = `
      SELECT DISTINCT aspect
      FROM public.smart_overall_require_08003809
      WHERE aspects = $1
      ORDER BY aspect ASC
    `;
    const queryParams = [aspects];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
