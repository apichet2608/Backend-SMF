const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.71.57",
  port: 5432,
  user: "postgres",
  password: "fujikura",
  database: "smart_factory", // แทนที่ด้วยชื่อฐานข้อมูลของคุณ
});

const query = (text, params) => pool.query(text, params);

router.get("/distinct-product", async (req, res) => {
  try {
    const result = await query(`
select
	distinct  product
from
	public.smt_aoi_master;
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/select-smt_aoi_master-product", async (req, res) => {
  try {
    const product = req.query.product || "";

    const result = await query(
      `select
	*
from
	public.smt_aoi_master
where 
	product = $1`,
      [product]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

router.get("/select-smt_aoi_mastercheck-product", async (req, res) => {
  try {
    const product = req.query.product || "";

    const result = await query(
      `select
	*
from
	public.smt_aoi_mastercheck
where 
	product = $1`,
      [product]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

module.exports = router;
//set DEBUG=myapp:* & npm start