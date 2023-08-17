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

router.get("/page1/distinctsheet_no", async (req, res) => {
  try {
    const result = await query(
      `select
      distinct master_sheet_no
      from
      public.smart_master_verify_zaoi
    order by master_sheet_no desc
    `
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page1/distinctmachine_no", async (req, res) => {
  try {
    const { master_sheet_no, start_date, stop_date } = req.query;

    const queryStr = `
      select
        distinct machine_no
      from
        public.smart_master_verify_zaoi
      where master_sheet_no = $1
    and aoi_inspect_date :: date >= $2 
    and aoi_inspect_date :: date <= $3 
      order by machine_no desc
    `;

    const queryParams = [master_sheet_no, start_date, stop_date];

    const resultRows = await query(queryStr, queryParams);
    res.status(200).json(resultRows.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

// router.get("/page1/distinctfixture_code", async (req, res) => {
//   try {
//     const { sheet_no } = req.query;

//     const queryStr = `
//     select
//     distinct fixture_code
//   from
//     public.smart_master_fin_fost_verify
//   where sheet_no = $1
//   order by fixture_code desc
//     `;
//     const queryParams = [sheet_no];

//     const result = await query(queryStr, queryParams);
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while fetching data" });
//   }
// });

router.get("/page1/table", async (req, res) => {
  try {
    const { master_sheet_no, start_date, stop_date, machine_no } = req.query;
    if (machine_no === "ALL") {
      queryStr = `
      SELECT
      ROW_NUMBER() OVER () AS id,
  t.aoi_inspect_date,
  t.master_sheet_no,
  t.aoi_inspect_count,
  t.machine_no,
  CASE
  WHEN NOT EXISTS (
  SELECT 1
  FROM smart_master_verify_zaoi sub
  WHERE sub.aoi_inspect_date = t.aoi_inspect_date
  AND sub.master_sheet_no = t.master_sheet_no
  AND sub.aoi_inspect_count = t.aoi_inspect_count
  AND sub.judgement <> 'PASS'
  ) THEN 'PASS'
  ELSE 'FAIL'
  END AS judgement
  FROM 
  smart_master_verify_zaoi t
  where 
      master_sheet_no = $1
      and aoi_inspect_date :: date >= $2 
      and aoi_inspect_date :: date <= $3 
  GROUP BY
  t.aoi_inspect_date,
  t.master_sheet_no,
  t.aoi_inspect_count,
  t.machine_no
  ORDER BY
  t.aoi_inspect_date desc,
  t.aoi_inspect_count desc;   
          `;
      queryParams = [master_sheet_no, start_date, stop_date];
    } else {
      queryStr = `
  SELECT
  ROW_NUMBER() OVER () AS id,
t.aoi_inspect_date,
t.master_sheet_no,
t.aoi_inspect_count,
t.machine_no,
CASE
WHEN NOT EXISTS (
SELECT 1
FROM smart_master_verify_zaoi sub
WHERE sub.aoi_inspect_date = t.aoi_inspect_date
AND sub.master_sheet_no = t.master_sheet_no
AND sub.aoi_inspect_count = t.aoi_inspect_count
AND sub.judgement <> 'PASS'
) THEN 'PASS'
ELSE 'FAIL'
END AS judgement
FROM 
smart_master_verify_zaoi t
where 
  master_sheet_no = $1
  and aoi_inspect_date :: date >= $2 
  and aoi_inspect_date :: date <= $3 
  and machine_no = $4
GROUP BY
t.aoi_inspect_date,
t.master_sheet_no,
t.aoi_inspect_count,
t.machine_no
ORDER BY
t.aoi_inspect_date desc,
t.aoi_inspect_count desc;   
      `;
      queryParams = [master_sheet_no, start_date, stop_date, machine_no];
    }
    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page1/tablemaster", async (req, res) => {
  try {
    const { master_sheet_no, aoi_inspect_count, time, machine_no } = req.query;

    if (machine_no === "ALL") {
      queryStr = `
  select 
row_number() over () as id,
t.aoi_inspect_date ,
t.sheet_no ,
t.aoi_inspect_count ,
t."position" ,
t.component ,
t.verify_result ,
t.verify_item ,
t.master_result ,
t.master_item ,
judgement
from smart_master_verify_zaoi t
where 
  sheet_no = $1
  and aoi_inspect_date = $2 
and aoi_inspect_count = $3
order by
3 desc,
1 desc,
2 asc,
4 asc`;
      queryParams = [master_sheet_no, time, aoi_inspect_count];
    } else {
      queryStr = `
  select 
row_number() over () as id,
t.aoi_inspect_date ,
t.sheet_no ,
t.aoi_inspect_count ,
t."position" ,
t.component ,
t.verify_result ,
t.verify_item ,
t.master_result ,
t.master_item ,
judgement
from smart_master_verify_zaoi t
where 
  sheet_no = $1
  and aoi_inspect_date = $2 
and aoi_inspect_count = $3
and machine_no = $4
order by
3 desc,
1 desc,
2 asc,
4 asc`;
      queryParams = [master_sheet_no, time, aoi_inspect_count, machine_no];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
