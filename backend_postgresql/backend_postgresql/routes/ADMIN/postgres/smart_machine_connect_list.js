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

router.get("/count-status", async (req, res) => {
  try {
    const result = await query(`
    select
    status, COUNT(*) as count
  from
    public.smart_machine_connect_list
  group by
    status
  order by
    count asc
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/table", async (req, res) => {
  try {
    const { status } = req.query;

    const result = await query(
      `select 
      ROW_NUMBER() OVER (ORDER BY finish_date) AS id,
      *
    from 
      public.smart_machine_connect_list smcl 
    where status = $1
    order by
      finish_date  asc 
    `,
      [status]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
