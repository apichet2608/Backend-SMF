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
      distinct sheet_no
      from
      public.smart_master_verify_xray 
    order by sheet_no desc
    `
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page1/distinctxray_machine", async (req, res) => {
  try {
    const { sheet_no, start_date, stop_date } = req.query;

    const queryStr = `
      select
        distinct xray_machine
      from
        public.smart_master_verify_xray 
      where sheet_no = $1
    and xray_date :: date >= $2 
    and xray_date :: date <= $3 
      order by xray_machine desc
    `;

    const queryParams = [sheet_no, start_date, stop_date];

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
    const { sheet_no, start_date, stop_date, xray_machine } = req.query;
    if (xray_machine === "ALL") {
      queryStr = `
      SELECT
      ROW_NUMBER() OVER () AS id,
  t.xray_date,
  t.master_sheet_no,
  t.aoi_inspect_count,
  t.xray_machine,
  CASE
  WHEN NOT EXISTS (
  SELECT 1
  FROM smart_master_verify_xray  sub
  WHERE sub.xray_date = t.xray_date
  AND sub.master_sheet_no = t.master_sheet_no
  AND sub.aoi_inspect_count = t.aoi_inspect_count
  AND sub.judgement <> 'PASS'
  ) THEN 'PASS'
  ELSE 'FAIL'
  END AS judgement
  FROM 
  smart_master_verify_xray  t
  where 
      master_sheet_no = $1
      and xray_date :: date >= $2 
      and xray_date :: date <= $3 
  GROUP BY
  t.xray_date,
  t.master_sheet_no,
  t.aoi_inspect_count,
  t.xray_machine
  ORDER BY
  t.xray_date desc,
  t.aoi_inspect_count desc;   
          `;
      queryParams = [sheet_no, start_date, stop_date];
    } else {
      queryStr = `
  SELECT
  ROW_NUMBER() OVER () AS id,
t.xray_date,
t.master_sheet_no,
t.aoi_inspect_count,
t.xray_machine,
CASE
WHEN NOT EXISTS (
SELECT 1
FROM smart_master_verify_xray  sub
WHERE sub.xray_date = t.xray_date
AND sub.master_sheet_no = t.master_sheet_no
AND sub.aoi_inspect_count = t.aoi_inspect_count
AND sub.judgement <> 'PASS'
) THEN 'PASS'
ELSE 'FAIL'
END AS judgement
FROM 
smart_master_verify_xray  t
where 
  master_sheet_no = $1
  and xray_date :: date >= $2 
  and xray_date :: date <= $3 
  and xray_machine = $4
GROUP BY
t.xray_date,
t.master_sheet_no,
t.aoi_inspect_count,
t.xray_machine
ORDER BY
t.xray_date desc,
t.aoi_inspect_count desc;   
      `;
      queryParams = [sheet_no, start_date, stop_date, xray_machine];
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
    const { sheet_no, aoi_inspect_count, start_date, stop_date, xray_machine } =
      req.query;

    if (xray_machine === "ALL") {
      queryStr = `
  select 
row_number() over () as id,
t.xray_date ,
t.sheet_no ,
t.aoi_inspect_count ,
t."POSITION" ,
t.component ,
t.verify_result ,
t.verify_item ,
t.master_result ,
t.master_item ,
judgement
from smart_master_verify_xray  t
where 
  sheet_no = $1
  and xray_date :: date >= $2 
  and xray_date :: date <= $3 
and aoi_inspect_count = $4
and xray_machine = $5
order by
3 desc,
1 desc,
2 asc,
4 asc`;
      queryParams = [
        sheet_no,
        start_date,
        stop_date,
        aoi_inspect_count,
        xray_machine,
      ];
    } else {
      queryStr = `
  select 
row_number() over () as id,
t.xray_date ,
t.sheet_no ,
t.aoi_inspect_count ,
t."POSITION" ,
t.component ,
t.verify_result ,
t.verify_item ,
t.master_result ,
t.master_item ,
judgement
from smart_master_verify_xray  t
where 
  sheet_no = $1
  and xray_date :: date >= $2 
  and xray_date :: date <= $3 
and aoi_inspect_count = $4
order by
3 desc,
1 desc,
2 asc,
4 asc`;
      queryParams = [sheet_no, start_date, stop_date, aoi_inspect_count];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
