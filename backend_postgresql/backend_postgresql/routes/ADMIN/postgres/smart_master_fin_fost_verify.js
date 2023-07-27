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

// router.get("/page1/distinctfixture_code", async (req, res) => {
//   try {
//     const { model_name } = req.query;

//     const queryStr = `
//     select
//     distinct fixture_code
//   from
//     public.smart_master_fin_fost_verify
//   where model_name = $1
//   order by fixture_code desc
//     `;
//     const queryParams = [model_name];

//     const result = await query(queryStr, queryParams);
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while fetching data" });
//   }
// });

// router.get("/page1/table", async (req, res) => {
//   try {
//     const { model_name, fixture_code } = req.query;

//     if (fixture_code === "ALL") {
//       queryStr = `
//       select
// a.master_type ,
// a.test_datetime ,
// a.machine_id ,
// a.model_name ,
// a.program_rev ,
// a.lot_no ,
// a.fixture_code ,
// CASE
// WHEN NOT EXISTS (SELECT 1 FROM smart_master_verify_fost WHERE judgement <> 'PASS') THEN 'PASS'
// ELSE 'FAIL'
// END AS verify_result
// from
// smart_master_verify_fost a
// where
// model_name = $1
// and fixture_code  = $2
// group by
// a.master_type ,
// a.test_datetime ,
// a.machine_id ,
// a.model_name ,
// a.program_rev ,
// a.lot_no ,
// a.fixture_code
// order by
// a.test_datetime desc;
//         `;
//       queryParams = [model_name];
//     } else {
//       queryStr = `
//       select
//       a.master_type ,
//       a.test_datetime ,
//       a.machine_id ,
//       a.model_name ,
//       a.program_rev ,
//       a.lot_no ,
//       a.fixture_code ,
//       CASE
//       WHEN NOT EXISTS (SELECT 1 FROM smart_master_verify_fost WHERE judgement <> 'PASS') THEN 'PASS'
//       ELSE 'FAIL'
//       END AS verify_result
//       from
//       smart_master_verify_fost a
//       where
//       model_name = $1
//       and fixture_code  = $2
//       group by
//       a.master_type ,
//       a.test_datetime ,
//       a.machine_id ,
//       a.model_name ,
//       a.program_rev ,
//       a.lot_no ,
//       a.fixture_code
//       order by
//       a.test_datetime desc;
//         `;
//       queryParams = [model_name, fixture_code];
//     }

//     const result = await query(queryStr, queryParams);
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while fetching data" });
//   }
// });

module.exports = router;
