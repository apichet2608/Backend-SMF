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

    //     queryStr = `
    //     SELECT *
    // FROM public.smart_eworking_calling
    // WHERE
    // 	jwpv_dept = $1
    // 	and jwpv_proc_group = $2
    // 	and jwpv_job_type = $3
    // 	and jwpv_mc_code = $4
    // 	and DATE(create_at) = (
    //     SELECT MAX(DATE(create_at))
    //     FROM public.smart_eworking_calling
    //     where jwpv_dept = $1
    // 	and jwpv_proc_group = $2
    // 	and jwpv_job_type = $3
    // 	and jwpv_mc_code = $4
    // )
    //         `;

    queryStr = `
    SELECT *
FROM public.smart_eworking_calling
WHERE
  jwpv_dept = $1
  and jwpv_proc_group = $2
  and jwpv_job_type = $3
  and jwpv_mc_code = $4
  and DATE_TRUNC('second', create_at) = (
  SELECT MAX(DATE_TRUNC('second', create_at))
  FROM public.smart_eworking_calling
  where jwpv_dept = $1
  and jwpv_proc_group = $2
  and jwpv_job_type = $3
  and jwpv_mc_code = $4
)
order by create_at asc
        `;
    queryParams = [jwpv_dept, jwpv_proc_group, jwpv_job_type, jwpv_mc_code];
    const result = await query(queryStr, queryParams);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/pageverify/plot", async (req, res) => {
  try {
    const { jwpv_dept, jwpv_proc_group, jwpv_job_type, jwpv_mc_code } =
      req.query;
    let queryStr = "";
    let queryParams = [];
    if (jwpv_job_type === "Reflow Profile") {
      queryStr = `
      SELECT *
      FROM public.smart_eworking_raw
       where jwpv_dept = $1
        and jwpv_proc_group = $2
        and jwpv_job_type = $3
        and jwpv_mc_code = $4
          and DATE(create_at) = (
          SELECT MAX(DATE(create_at))
          FROM public.smart_eworking_raw
          where jwpv_dept = $1
        and jwpv_proc_group = $2
        and jwpv_job_type = $3
        and jwpv_mc_code = $4
      )
      order by create_at asc
              `;
    } else if (jwpv_job_type === "Temp Profile" && jwpv_dept === "LPI") {
      queryStr = `
      SELECT *
      FROM public.smart_eworking_raw
       where jwpv_dept = $1
        and jwpv_proc_group = $2
        and jwpv_job_type = $3
        and jwpv_mc_code = $4
          and DATE(create_at) = (
          SELECT MAX(DATE(create_at))
          FROM public.smart_eworking_raw
          where jwpv_dept = $1
        and jwpv_proc_group = $2
        and jwpv_job_type = $3
        and jwpv_mc_code = $4
      )
      order by create_at asc
              `;
    } else {
      queryStr = `
    SELECT *
FROM public.smart_eworking_raw
 where jwpv_dept = $1
	and jwpv_proc_group = $2
	and jwpv_job_type = $3
	and jwpv_mc_code = $4
		and DATE(jwpv_check_time) = (
    SELECT MAX(DATE(jwpv_check_time))
    FROM public.smart_eworking_raw
    where jwpv_dept = $1
	and jwpv_proc_group = $2
	and jwpv_job_type = $3
	and jwpv_mc_code = $4
)
order by jwpv_check_time asc
        `;
    }

    queryParams = [jwpv_dept, jwpv_proc_group, jwpv_job_type, jwpv_mc_code];
    const result = await query(queryStr, queryParams);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

//------------------------------------------------------------------//
router.get("/", async (req, res) => {
  try {
    const { mc_code } = req.query; // ดึงค่า mc_code จาก req.query
    // สร้างคำสั่ง SQL โดยใช้ค่า mc_code
    let queryStr = `
      select
        t.*
      from
        (
          select
            jwpv_proc_group,
            jwpv_job_type,
            jwpv_mc_code,
            max(update_file) as max_update_file
          from
            smart_eworking_calling
          where
            jwpv_proc_group = 'A-RLSB'
          group by
            jwpv_proc_group,
            jwpv_job_type,
            jwpv_mc_code
        ) sq
      inner join smart_eworking_calling t
        on
        t.jwpv_proc_group = sq.jwpv_proc_group
        and t.jwpv_job_type = sq.jwpv_job_type
        and t.update_file = sq.max_update_file
        and t.jwpv_mc_code = sq.jwpv_mc_code
      where 
      t.jwpv_mc_code = $1
    `;
    const queryParams = [mc_code]; // ใส่ค่า mc_code ใน queryParams
    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/check_status", async (req, res) => {
  try {
    const { mc_code } = req.query; // ดึงค่า mc_code จาก req.query
    // สร้างคำสั่ง SQL โดยใช้ค่า mc_code
    let queryStr = `
    select
    distinct  t.jwpv_param_tvalue
   from
     (
       select
         jwpv_proc_group,
         jwpv_job_type,
         jwpv_mc_code,
         max(update_file) as max_update_file
       from
         smart_eworking_calling
       where
         jwpv_proc_group = 'A-RLSB'
       group by
         jwpv_proc_group,
         jwpv_job_type,
         jwpv_mc_code
     ) sq
   inner join smart_eworking_calling t
     on
     t.jwpv_proc_group = sq.jwpv_proc_group
     and t.jwpv_job_type = sq.jwpv_job_type
     and t.update_file = sq.max_update_file
     and t.jwpv_mc_code = sq.jwpv_mc_code
   where 
   t.jwpv_mc_code = $1 AND
   t.jwpv_param_title = 'Judgment'
    `;
    const queryParams = [mc_code]; // ใส่ค่า mc_code ใน queryParams
    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});
//------------------------------------------------------------------------//

module.exports = router;
