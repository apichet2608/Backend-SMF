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

router.get("/distinctdefect_code", async (req, res) => {
  try {
    const result = await query(
      `select
      distinct defect_code
    from
      public.smart_qa_aql_defect_master
    order by defect_code asc     
    `
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/autodata", async (req, res) => {
  try {
    const { defect_code } = req.query;
    let queryStr = `
      SELECT *
      FROM public.smart_qa_aql_defect_master
      WHERE defect_code = $1
      order by defect_code desc
    `;
    const queryParams = [defect_code];
    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
