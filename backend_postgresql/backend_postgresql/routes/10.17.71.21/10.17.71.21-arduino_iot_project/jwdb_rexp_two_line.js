const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.71.21",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "arduino_iot_project",
});

const query = (text, params) => pool.query(text, params);

router.get("/distinctFactory", async (req, res) => {
  try {
    const result = await query(
      `select distinct factory from public.jwdb_rexp_two_line`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctMccode", async (req, res) => {
  try {
    const { factory } = req.query;
    const result = await query(
      `select distinct mc_code from public.jwdb_rexp_two_line where factory = $1`,
      [factory]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctfirst_lot", async (req, res) => {
  try {
    const { factory, mc_code } = req.query;
    const hours = parseInt(req.query.hours); // ชั่วโมงที่ผู้ใช้กำหนด

    if (isNaN(hours)) {
      return res.status(400).send("Hours are required");
    }
    const result = await query(
      `select
      distinct first_lot
    from
      public.jwdb_rexp_two_line
      
    where factory = $1
    and mc_code = $2
    and ptime :: timestamp >= (now() - interval '${hours}' hour)
    order by first_lot asc
    `,
      [factory, mc_code]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/dataplot", async (req, res) => {
  try {
    const { factory, mc_code, first_lot } = req.query;
    const hours = parseInt(req.query.hours); // ชั่วโมงที่ผู้ใช้กำหนด

    if (isNaN(hours)) {
      return res.status(400).send("Hours are required");
    }

    let result;
    if (first_lot === "ALL") {
      result = await query(
        `SELECT *
        FROM public.jwdb_rexp_two_line
        WHERE factory = $1
        AND mc_code = $2
        AND ptime::timestamp >= (now() - interval '${hours}' hour)
        ORDER BY first_lot ASC`,
        [factory, mc_code]
      );
    } else {
      result = await query(
        `SELECT *
        FROM public.jwdb_rexp_two_line
        WHERE factory = $1
        AND mc_code = $2
        AND first_lot LIKE $3
        AND ptime::timestamp >= (now() - interval '${hours}' hour)
        ORDER BY first_lot ASC`,
        [factory, mc_code, `${first_lot}%`]
      );
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/dataplot2", async (req, res) => {
  try {
    const { factory, mc_code } = req.query;
    const hours = parseInt(req.query.hours); // ชั่วโมงที่ผู้ใช้กำหนด

    if (isNaN(hours)) {
      return res.status(400).send("Hours are required");
    }

    const result = await query(
      `SELECT *
      FROM public.jwdb_rexp_two_line
      WHERE factory = $1
      AND mc_code = $2
      AND ptime::timestamp >= (now() - interval '${hours}' hour)
      ORDER BY ptime ASC`,
      [factory, mc_code]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
