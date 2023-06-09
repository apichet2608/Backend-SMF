const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.66.230",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "postgres",
});

const query = (text, params) => pool.query(text, params);

router.get("/distinct-build", async (req, res) => {
  try {
    const { date } = req.query;

    const result = await query(
      `select
distinct  buiding 
from
public.smart_oee_overall
where date_time = $1`,
      [date]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/fix-mccode", async (req, res) => {
  try {
    const { date, build, mc } = req.query;

    const result = await query(
      `select
*
from
public.smart_oee_overall
where date_time = $1
and buiding = $2
and mc_code =$3`,
      [date, build, mc]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinct-process", async (req, res) => {
  try {
    const { date, build } = req.query;

    const result = await query(
      `select
distinct  process_group  
from
public.smart_oee_overall
where date_time = $1
and buiding = $2`,
      [date, build]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinct-process-all", async (req, res) => {
  try {
    const { date } = req.query;

    const result = await query(
      `select
distinct  process_group  
from
public.smart_oee_overall
where date_time = $1`,
      [date]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/data-all-all", async (req, res) => {
  try {
    const { date } = req.query;

    const result = await query(
      `select
*
from
public.smart_oee_overall
where date_time = $1`,
      [date]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/data-all-notall", async (req, res) => {
  try {
    const { date, process } = req.query;

    const result = await query(
      `select
*
from
public.smart_oee_overall
where date_time = $1
and process_group = $2`,
      [date, process]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/data-notall-all", async (req, res) => {
  try {
    const { date, build } = req.query;

    const result = await query(
      `select
*
from
public.smart_oee_overall
where date_time = $1
and buiding = $2`,
      [date, build]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/data-notall-notall", async (req, res) => {
  try {
    let { date, build, process } = req.query;

    // เข้ารหัสอักขระพิเศษในค่า Query Parameters
    router.get("/data-notall-notall", async (req, res) => {
      try {
        let { date, build, process } = req.query;

        // แปลงอักขระ "+" เป็น "%2B"
        date = date.replace(/\+/g, "%2B");
        build = build.replace(/\+/g, "%2B");
        process = process.replace(/\+/g, "%2B");

        const result = await query(
          `SELECT * FROM public.smart_oee_overall WHERE date_time = $1 AND buiding = $2 AND process_group = $3`,
          [date, build, process]
        );

        res.status(200).json(result.rows);
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ error: "An error occurred while fetching data" });
      }
    });

    const result = await query(
      `SELECT * FROM public.smart_oee_overall WHERE date_time = $1 AND buiding = $2 AND process_group = $3`,
      [date, build, process]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/data-all-all-plot", async (req, res) => {
  try {
    const { date, mc_code } = req.query;

    const result = await query(
      `SELECT *
      FROM public.smart_oee_overall
      WHERE date_time >= $1::DATE - INTERVAL '90 days'
      AND date_time <= $1::DATE
      AND mc_code = $2
      order by date_time asc`,
      [date, mc_code]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/data-all-notall-plot", async (req, res) => {
  try {
    const { date, process, mc_code } = req.query;

    const result = await query(
      `SELECT *
      FROM public.smart_oee_overall
      WHERE date_time >= $1::DATE - INTERVAL '90 days'
      AND date_time <= $1::DATE
      AND process_group = $2
      AND mc_code = $3
      order by date_time asc`,
      [date, process, mc_code]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/data-notall-all-plot", async (req, res) => {
  try {
    const { date, build, mc_code } = req.query;

    const result = await query(
      `SELECT *
      FROM public.smart_oee_overall
      WHERE date_time >= $1::DATE - INTERVAL '90 days' 
      AND date_time <= $1::DATE
      AND buiding = $2
      AND mc_code = $3
      order by date_time asc`,
      [date, build, mc_code]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/data-notall-notall-plot", async (req, res) => {
  try {
    const { date, build, process, mc_code } = req.query;

    const result = await query(
      `SELECT *
      FROM public.smart_oee_overall
      WHERE date_time >= $1::DATE - INTERVAL '90 days'
      AND date_time <= $1::DATE
      AND buiding = $2
      AND process_group = $3
      AND mc_code = $4
      order by date_time asc`,
      [date, build, process, mc_code]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
