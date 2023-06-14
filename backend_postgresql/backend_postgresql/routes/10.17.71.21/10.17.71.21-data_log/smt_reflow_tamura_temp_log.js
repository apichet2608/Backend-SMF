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

router.get("/distinctMachine", async (req, res) => {
  try {
    const result = await query(
      `select
      distinct machine_code
    from
      public.smt_reflow_tamura_temp_log`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/dataplot", async (req, res) => {
  try {
    const { machine_code } = req.query;
    const hours = parseInt(req.query.hours); // ชั่วโมงที่ผู้ใช้กำหนด

    if (isNaN(hours)) {
      return res.status(400).send("Hours are required");
    }
    const result = await query(
      `select
      *
    from
      public.smt_reflow_tamura_temp_log
    where 
      machine_code = $1
    and create_at  :: timestamp >= (now() - interval '${hours}' hour)
    order by  create_at asc`,
      [machine_code]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});
module.exports = router;
