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

router.get("/distinctaoi_prd_name", async (req, res) => {
  try {
    const result = await query(`
select
	distinct aoi_prd_name
from
	cfm_aoi_reject_lot
order by
	aoi_prd_name
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/filteredDataAoiSides", async (req, res) => {
  try {
    const product = req.query.product || "";

    const result = await query(
      `select
	distinct aoi_side
from
	cfm_aoi_reject_lot
where
	aoi_prd_name = $1`,
      [product]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

router.get("/filteredData7day", async (req, res) => {
  try {
    const aoi_side = req.query.aoi_side || "";
    const product = req.query.aoi_prd_name || "";

    const result = await query(
      `select
	*
from
	cfm_aoi_reject_lot
where
	aoi_side = $1
	and aoi_prd_name = $2 AND aoi_date >= CURRENT_DATE - INTERVAL '7 days'`,
      [aoi_side, product]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

router.get("/filteredData1day", async (req, res) => {
  try {
    const aoi_side = req.query.aoi_side || "";
    const product = req.query.product || "";

    const result = await query(
      `select
	*
from
	cfm_aoi_reject_lot
where
	aoi_side = $1
	and aoi_prd_name = $2 AND aoi_date >= CURRENT_DATE - INTERVAL '1 days'`,
      [aoi_side, product]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

router.get("/filteredData1m", async (req, res) => {
  try {
    const aoi_side = req.query.aoi_side || "";
    const product = req.query.product || "";

    const result = await query(
      `select
	*
from
	cfm_aoi_reject_lot
where
	aoi_side = $1
	and aoi_prd_name = $2
      and aoi_date >= CURRENT_DATE - interval '1 months'`,
      [aoi_side, product]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

router.get("/filteredData3m", async (req, res) => {
  try {
    const aoi_side = req.query.aoi_side || "";
    const product = req.query.product || "";

    const result = await query(
      `select
	*
from
	cfm_aoi_reject_lot
where
	aoi_side = $1
	and aoi_prd_name = $2
      and aoi_date >= CURRENT_DATE - interval '3 months'`,
      [aoi_side, product]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});



router.get("/cfm_aoi_reject_day_7day", async (req, res) => {
  try {
    const aoi_side = req.query.aoi_side || "";
    const aoi_prd_name = req.query.aoi_prd_name || "";

    const result = await query(
      `select
	*
from
	cfm_aoi_reject_day
where
	aoi_side = $1
	and aoi_prd_name = $2
	and aoi_date >= CURRENT_DATE - interval '7 days'
order by aoi_date`,
      [aoi_side, aoi_prd_name]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

router.get("/cfm_aoi_reject_day_1day", async (req, res) => {
  try {
    const aoi_side = req.query.aoi_side || "";
    const aoi_prd_name = req.query.aoi_prd_name || "";

    const result = await query(
      `select
	*
from
	cfm_aoi_reject_day
where
	aoi_side = $1
	and aoi_prd_name = $2
	and aoi_date >= CURRENT_DATE - interval '1 days'
order by aoi_date`,
      [aoi_side, aoi_prd_name]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

router.get("/cfm_aoi_reject_day_30day_2", async (req, res) => {
  try {
    const aoi_side = req.query.aoi_side || "";
    const aoi_prd_name = req.query.aoi_prd_name || "";

    const result = await query(
      `select
	*
from
	cfm_aoi_reject_day
where
	aoi_side = $1
	and aoi_prd_name = $2
	and aoi_date >= CURRENT_DATE - interval '3 months'
order by aoi_date`,
      [aoi_side, aoi_prd_name]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

router.get("/cfm_aoi_reject_day_30day", async (req, res) => {
  try {
    const aoi_side = req.query.aoi_side || "";
    const aoi_prd_name = req.query.aoi_prd_name || "";

    const result = await query(
      `select
	*
from
	cfm_aoi_reject_day
where
	aoi_side = $1
	and aoi_prd_name = $2
	and aoi_date >= CURRENT_DATE - interval '1 months'
order by aoi_date`,
      [aoi_side, aoi_prd_name]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

router.get("/cfm_aoi_reject_day_90day", async (req, res) => {
  try {
    const aoi_side = req.query.aoi_side || "";
    const aoi_prd_name = req.query.aoi_prd_name || "";

    const result = await query(
      `select
	to_char(aoi_date,
	'YYYY-MM') as month,
	aoi_prd_name,
	aoi_side,
	aoi_rej_code,
	rej_name,
	SUM(input_pcs_distinct) as sum_input_pcs,
	SUM(rej_qty_distinct) as sum_rej_qty,
	SUM(rej_qty_distinct) / SUM(input_pcs_distinct) * 100 as month_reject_percentage
from
	(
	select
		aoi_date,
		aoi_prd_name,
		aoi_side,
		aoi_rej_code,
		rej_name,
		SUM(distinct sum_input_pcs) as input_pcs_distinct,
		SUM(distinct sum_rej_qty) as rej_qty_distinct
	from
		cfm_aoi_reject_day
	group by
		aoi_date,
		aoi_prd_name,
		aoi_side,
		aoi_rej_code,
		rej_name
) t
where
  aoi_side = $1
	and aoi_prd_name = $2
group by
	to_char(aoi_date,
	'YYYY-MM'),
	aoi_prd_name,
	aoi_side,
	aoi_rej_code,
	rej_name
order by
	to_char(aoi_date,
	'YYYY-MM'),
	aoi_prd_name;
`,
      [aoi_side, aoi_prd_name]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});


module.exports = router;
