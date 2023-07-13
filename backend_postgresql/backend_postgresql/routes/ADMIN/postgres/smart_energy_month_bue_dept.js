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

router.get("/page4/distinctDept", async (req, res) => {
  try {
    const result = await query(`
    select
	distinct dept_2
from
	public.smart_energy_month_bue_dept
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page4/plot", async (req, res) => {
  try {
    const { dept } = req.query;

    let queryStr = "";
    let queryParams = [];

    if (dept === "ALL") {
      queryStr = `
      select
      year_month,
      sum_energy,
      sum_energy_cost,
      bue_sht,
      bue_meter,
      bue_m2
    from
      public.smart_energy_month_bue_dept
        `;
    } else {
      queryStr = `
      select
	year_month,
	sum_energy,
	sum_energy_cost,
	bue_sht,
	bue_meter,
	bue_m2
from
	public.smart_energy_month_bue_dept
where 
	dept_2  = $1
        `;
      queryParams = [dept];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page5/distinctDept", async (req, res) => {
  try {
    const result = await query(`
    select
	distinct dept_2
from
	public.smart_energy_month_bue_dept
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page5/plot", async (req, res) => {
  try {
    const { dept } = req.query;

    let queryStr = "";
    let queryParams = [];

    queryStr = `
      select
	*
from
	public.smart_energy_month_bue_dept
where 
	dept_2  = $1
        `;
    queryParams = [dept];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
