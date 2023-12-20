const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.71.21",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "postgres",
});

const query = (text, params) => pool.query(text, params);

router.get("/distinctMachine", async (req, res) => {
  try {
    const result = await query(
      `SELECT distinct mc_code FROM public.jwdb_rdfl_mck_actv`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/data-plot", async (req, res) => {
  try {
    const { machine } = req.query;
    const hours = parseInt(req.query.hours); // ชั่วโมงที่ผู้ใช้กำหนด

    if (isNaN(hours)) {
      return res.status(400).send("Hours are required");
    }
    const result = await query(
      `select 
      ptime,
      mc_code,
      temp_front_upper_heater_pv,
      temp_front_lower_heater_pv,
      temp_rear_upper_heater_pv,
      temp_rear_lower_heater_pv,
      cleaner_roll_pv,
      front_roll_pv,
      rear_roll_pv
      from jwdb_rdfl_mck_actv
      where
      mc_code = $1
      and ptime >= NOW() - INTERVAL '${hours} hour'
      order by ptime  asc`,
      [machine]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
