const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.76.155",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "iot", // แทนที่ด้วยชื่อฐานข้อมูลของคุณ
});

const query = (text, params) => pool.query(text, params);

router.get("/page1/distinctmodel_name", async (req, res) => {
  try {
    const result = await query(
      `select
      distinct model_name
    from
      public.smart_master_fin_fost_verify
    order by model_name desc
    `
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page1/distinctfixture_code", async (req, res) => {
  try {
    const { model_name } = req.query;

    const queryStr = `
    select
    distinct fixture_code 
  from
    public.smart_master_fin_fost_verify
  where model_name = $1
  order by fixture_code desc
    `;
    const queryParams = [model_name];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});
module.exports = router;
