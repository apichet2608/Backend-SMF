const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.71.21",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "data_log",
});

const query = (text, params) => pool.query(text, params);

router.get("/distinctline", async (req, res) => {
  try {
    const result = await query(
      `select
      distinct line
    from
      public.smt_reflow_tamura_set_log
    order by
      line`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctmachine", async (req, res) => {
  try {
    const { machine } = req.query;
    const result = await query(
      `select
      distinct machine
    from
      public.smt_reflow_tamura_set_log
    where
      line = $1
    order by
      machine`,
      [machine]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});
module.exports = router;
