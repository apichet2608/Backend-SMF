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

router.get("/page1/distinctaspects", async (req, res) => {
  try {
    const result = await query(`
    select
    distinct aspects
  from
    public.smart_overall_require_08003809
  order by
    aspects asc
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page1/distinctaspect", async (req, res) => {
  try {
    const { aspects } = req.query;

    let queryStr = "";
    let queryParams = [];

    queryStr = `
    select
	distinct aspect
from
	public.smart_overall_require_08003809
where 
	aspects = $1
order by
	aspect asc
        `;
    queryParams = [aspects];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
