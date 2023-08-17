const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.66.230",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "iot",
});

const query = (text, params) => pool.query(text, params);

router.get("/page1/distinctproc_status", async (req, res) => {
  try {
    const result = await query(
      `select
      distinct proc_status
    from
      public.fpc_holdingtime_ab
    order by
      proc_status desc
    `
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page1/table", async (req, res) => {
  try {
    const { proc_status } = req.query;

    let queryStr = `
    select
	id,
	lot_no,
	prd_item_code,
	prd_name,
	ro_rev,
	ro_seq,
	roll_no,
	roll_lot_count,
	con_lot_count,
	current_proc_id,
	current_process,
	proc_status,
	std_min_lot,
	a1a2_b1b2_a1b1_time,
	lock_holding_time,
	warning_holding_time,
	warning_std_time,
	lock_std_time,
	a2b1_time,
	start_proc_id,
	a,
	a1,
	a2,
	stop_proc_id,
	b,
	b1,
	b2,
	"CURRENT_TIME" as "current_time"
from
	public.fpc_holdingtime_ab
    `;

    let queryParams = [];

    if (proc_status !== "ALL") {
      queryStr += `
        where
        proc_status = $1
      `;
      queryParams.push(proc_status);
    }

    queryStr += `
    order by 
    a2b1_time desc
    `;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
