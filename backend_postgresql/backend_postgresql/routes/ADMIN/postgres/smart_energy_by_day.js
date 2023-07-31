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

router.get("/page6/distinctbuilding", async (req, res) => {
  try {
    const result = await query(
      `select
      distinct building
    from
      public.smart_energy_by_day
    order by building asc
    `
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page6/distinctdept2", async (req, res) => {
  try {
    const { building } = req.query;

    const queryStr = `
    select
	distinct dept_2
from
	public.smart_energy_by_day
where
	building = $1
order by
	dept_2 asc
    `;
    const queryParams = [building];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page6/distinctload_type", async (req, res) => {
  try {
    const { building, dept_2 } = req.query;

    const queryStr = `
    select
	distinct load_type
from
	public.smart_energy_by_day
where
	building = $1
and dept_2  = $2
order by
	load_type asc
    `;
    const queryParams = [building, dept_2];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page6/distinctarea", async (req, res) => {
  try {
    const { building, dept_2, load_type } = req.query;

    const queryStr = `
    select
	distinct area 
from
	public.smart_energy_by_day
where
    building = $1
  and dept_2  = $2
  and load_type = $3
  order by "date"  asc
    `;
    const queryParams = [building, dept_2, load_type];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page6/plotbyarea", async (req, res) => {
  try {
    const { building, dept_2, load_type } = req.query;

    const queryStr = `
    select
    ROW_NUMBER() OVER () AS id,
    mdb_code,
    feeder,
    mc_equip_name,
    energy_use_type,
    load_type,
    "desc",
    building,
    cost_ceter,
    room_type,
    dept_1,
    dept_2,
    area,
    power_ratio,
    max_energy_use,
    energy_usage,
    month_code,
    "date",
    unit_price_bth_per_kwh,
    diff_energy_usage,
    energy_cost_baht,
    auto_check
  from
    public.smart_energy_by_day
  where
    building = $1
  and dept_2  = $2
  and load_type = $3
  order by "date"  asc
    `;
    const queryParams = [building, dept_2, load_type];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;

// select
// ROW_NUMBER() OVER () AS id,
// area,
// "date",
// SUM(diff_energy_usage) as result
// from
// public.smart_energy_by_day
// where
// building = 'A'
// and dept_2  = 'CVC'
// and load_type = 'Air Conditioner'
// and area = 'BLK'
// group by   area,
// "date"
// order by "date"  asc

// select
// ROW_NUMBER() OVER () AS id,
// mdb_code,
// feeder,
// mc_equip_name,
// energy_use_type,
// load_type,
// "desc",
// building,
// cost_ceter,
// room_type,
// dept_1,
// dept_2,
// area,
// power_ratio,
// max_energy_use,
// energy_usage,
// month_code,
// "date",
// unit_price_bth_per_kwh,
// diff_energy_usage,
// energy_cost_baht,
// auto_check
// from
// public.smart_energy_by_day
// where
// building = 'A'
// and dept_2  = 'CVC'
// and load_type = 'Air Conditioner'
// and area = 'BLK'
// order by "date"  asc
