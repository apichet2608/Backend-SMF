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

module.exports = router;
