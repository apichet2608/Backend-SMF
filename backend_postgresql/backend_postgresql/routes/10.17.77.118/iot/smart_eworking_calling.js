const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.77.118",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "iot",
});

const query = (text, params) => pool.query(text, params);

router.get("/distinctjwpv_dept", async (req, res) => {
  try {
    const result = await query(
      `select
      distinct jwpv_dept
    from
      public.smart_eworking_calling`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctjwpv_proc_group", async (req, res) => {
  try {
    const { jwpv_dept } = req.query;
    let queryStr = "";
    let queryParams = [];

    queryStr = `
      select
      distinct jwpv_proc_group
    from
      public.smart_eworking_calling
    where jwpv_dept  = $1
        `;
    queryParams = [jwpv_dept];
    const result = await query(queryStr, queryParams);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctjwpv_job_type", async (req, res) => {
  try {
    const { jwpv_dept, jwpv_proc_group } = req.query;
    let queryStr = "";
    let queryParams = [];

    queryStr = `
    select
    distinct jwpv_job_type
  from
    public.smart_eworking_calling
  where
    jwpv_dept = $1
    and jwpv_proc_group = $2
        `;
    queryParams = [jwpv_dept, jwpv_proc_group];
    const result = await query(queryStr, queryParams);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctjwpv_mc_code", async (req, res) => {
  try {
    const { jwpv_dept, jwpv_proc_group, jwpv_job_type } = req.query;
    let queryStr = "";
    let queryParams = [];

    queryStr = `
    select
	distinct jwpv_mc_code
from
	public.smart_eworking_calling
where
	jwpv_dept = $1
	and jwpv_proc_group = $2
	and jwpv_job_type = $3
        `;
    queryParams = [jwpv_dept, jwpv_proc_group, jwpv_job_type];
    const result = await query(queryStr, queryParams);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/pageverify/table", async (req, res) => {
  try {
    const { jwpv_dept, jwpv_proc_group, jwpv_job_type, jwpv_mc_code } =
      req.query;
    let queryStr = "";
    let queryParams = [];

    queryStr = `
    SELECT *
FROM public.smart_eworking_calling
WHERE 
	jwpv_dept = $1
	and jwpv_proc_group = $2
	and jwpv_job_type = $3
	and jwpv_mc_code = $4
	and DATE(create_at) = (
    SELECT MAX(DATE(create_at))
    FROM public.smart_eworking_calling
    where jwpv_dept = $1
	and jwpv_proc_group = $2
	and jwpv_job_type = $3
	and jwpv_mc_code = $4
)
        `;
    queryParams = [jwpv_dept, jwpv_proc_group, jwpv_job_type, jwpv_mc_code];
    const result = await query(queryStr, queryParams);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
