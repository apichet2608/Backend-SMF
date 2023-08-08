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

router.get("/distinctline_no", async (req, res) => {
  try {
    const result = await query(
      `select
      distinct line_no
    from
      public.smt_data_reflow_smic_set_log
    order by
      line_no`
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
      public.smt_data_reflow_smic_set_log
    where
      line_no = $1
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

router.get("/page2/tab2/table", async (req, res) => {
  try {
    const { line, machine } = req.query;

    let queryStr = "";
    let queryParams = [];

    queryStr = `
    select
    *
  from
    public.smt_data_reflow_smic_set_log
  where
    line_no = $1
  and machine  = $2
  order by update_datetime asc
        `;
    queryParams = [line, machine];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});
module.exports = router;
