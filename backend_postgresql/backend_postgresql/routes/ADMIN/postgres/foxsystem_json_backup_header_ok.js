const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "127.0.0.1",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "postgres",
});

const query = (text, params) => pool.query(text, params);

router.get("/product", async (req, res) => {
  try {
    const { startdate, stopdate, product } = req.query;

    const result = await query(
      `SELECT
        test_attributes_uut_stop,
        accumulate,
        station_process
      FROM
        public.foxsystem_json_backup_header_ok
      WHERE
        test_attributes_uut_stop >= $1
        AND DATE_TRUNC('day', test_attributes_uut_stop) <= DATE_TRUNC('day', $2::TIMESTAMP)
        AND sendresultdetails_product = $3
      ORDER BY
        test_attributes_uut_stop`,
      [startdate, stopdate, product]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/product-fail", async (req, res) => {
  try {
    const { startdate, stopdate, product } = req.query;

    const result = await query(
      `SELECT
        *
      FROM
        public.foxsystem_json_backup_header_ok
      WHERE
        test_attributes_uut_stop >= $1
        AND DATE_TRUNC('day', test_attributes_uut_stop) <= DATE_TRUNC('day', $2::TIMESTAMP)
        AND sendresultdetails_product = $3
        and test_attributes_test_result = 'FAIL'
      ORDER BY
        test_attributes_uut_stop`,
      [startdate, stopdate, product]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinct-sendresultdetails_product", async (req, res) => {
  try {
    const result = await query(`
select
	distinct  sendresultdetails_product 
from
	public.foxsystem_json_backup_header_ok
order by sendresultdetails_product 
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinct-process", async (req, res) => {
  try {
    const result = await query(`
select
	distinct  process 
from
	public.foxsystem_json_backup_header_ok
order by process 
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
