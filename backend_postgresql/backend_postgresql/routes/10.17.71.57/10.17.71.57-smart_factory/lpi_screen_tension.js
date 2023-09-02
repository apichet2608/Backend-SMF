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

router.get("/distinctproduct_name", async (req, res) => {
  try {
    const result = await pool.query(
      `select
    distinct product_name
from
    public.lpi_screen_tension
order by product_name asc
        `
    );

    // Send the JSON response back to the client
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/distinctprocess", async (req, res) => {
  try {
    const { product_name } = req.query;

    let queryStr = `
      select
    distinct process  
from
    public.lpi_screen_tension
      `;

    let queryParams = [];

    if (product_name !== "ALL") {
      queryStr += `
          where product_name = $1
        `;
      queryParams.push(product_name);
    }

    queryStr += `
     order by process asc
      `;
    console.log(queryStr);

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctscreen_no", async (req, res) => {
  try {
    const { product_name, process } = req.query;

    let queryStr = `
      SELECT DISTINCT screen_no  
      FROM public.lpi_screen_tension
    `;

    let queryParams = [];

    if (product_name !== "ALL") {
      queryStr += ` WHERE product_name = $${queryParams.length + 1}`;
      queryParams.push(product_name);
    }

    if (process !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += ` AND process = $${queryParams.length + 1}`;
      } else {
        queryStr += ` WHERE process = $${queryParams.length + 1}`;
      }
      queryParams.push(process);
    }

    queryStr += ` ORDER BY screen_no ASC`;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/dataAPI", async (req, res) => {
  try {
    const { product_name, process, screen_no } = req.query;

    let queryStr = `
      SELECT *
      FROM public.lpi_screen_tension
    `;

    let queryParams = [];

    // ตรวจสอบและเพิ่มเงื่อนไขสำหรับค้นหาตามชื่อผลิตภัณฑ์
    if (product_name !== "ALL") {
      queryStr += ` WHERE product_name = $${queryParams.length + 1}`;
      queryParams.push(product_name);
    }

    // ตรวจสอบและเพิ่มเงื่อนไขสำหรับค้นหาตามกระบวนการ
    if (process !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += ` AND process = $${queryParams.length + 1}`;
      } else {
        queryStr += ` WHERE process = $${queryParams.length + 1}`;
      }
      queryParams.push(process);
    }

    // ตรวจสอบและเพิ่มเงื่อนไขสำหรับค้นหาตามหมายเลขหน้าจอ
    if (screen_no !== "ALL") {
      if (queryParams.length > 0) {
        queryStr += ` AND screen_no = $${queryParams.length + 1}`;
      } else {
        queryStr += ` WHERE screen_no = $${queryParams.length + 1}`;
      }
      queryParams.push(screen_no);
    }

    queryStr += ` ORDER BY date_time ASC`;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
