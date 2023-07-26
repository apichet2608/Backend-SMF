const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.66.121",
  port: 5432,
  user: "-",
  password: "-",
  database: "iot", // แทนที่ด้วยชื่อฐานข้อมูลของคุณ
});

const query = (text, params) => pool.query(text, params);

//
module.exports = router;
