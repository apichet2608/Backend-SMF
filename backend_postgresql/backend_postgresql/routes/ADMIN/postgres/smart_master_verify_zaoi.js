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
      public.smart_master_verify_zaoi
    order by sheet_no desc
    `
    );
    res.status(200).json(result.rows);
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
    const { sheet_no, start_date, stop_date } = req.query;

    queryStr = `
    SELECT
    ROW_NUMBER() OVER () AS id,
t.aoi_inspect_date,
t.sheet_no,
t.aoi_inspect_count,
t.machine_no,
CASE
WHEN NOT EXISTS (
SELECT 1
FROM smart_master_verify_zaoi sub
WHERE sub.aoi_inspect_date = t.aoi_inspect_date
AND sub.sheet_no = t.sheet_no
AND sub.aoi_inspect_count = t.aoi_inspect_count
AND sub.judgement <> 'PASS'
) THEN 'PASS'
ELSE 'FAIL'
END AS judgement
FROM 
smart_master_verify_zaoi t
where 
    sheet_no = $1
    and aoi_inspect_date :: date >= $2 
    and aoi_inspect_date :: date <= $3 
GROUP BY
t.aoi_inspect_date,
t.sheet_no,
t.aoi_inspect_count,
t.machine_no
ORDER BY
t.aoi_inspect_date ASC,
t.aoi_inspect_count ASC;   
        `;
    queryParams = [sheet_no, start_date, stop_date];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page1/tablemaster", async (req, res) => {
  try {
    const { sheet_no, aoi_inspect_count, start_date, stop_date } = req.query;

    queryStr = `
    select 
row_number() over () as id,
t.aoi_inspect_date ,
t.sheet_no ,
t.aoi_inspect_count ,
t."POSITION" ,
t.component ,
t.verify_result ,
t.verify_item ,
t.master_result ,
t.master_item ,
judgement
from smart_master_verify_zaoi t
where 
    sheet_no = $1
    and aoi_inspect_date :: date >= $2 
    and aoi_inspect_date :: date <= $3 
and aoi_inspect_count = $4
order by
3 desc,
1 desc,
2 asc,
4 asc`;
    queryParams = [sheet_no, start_date, stop_date, aoi_inspect_count];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
