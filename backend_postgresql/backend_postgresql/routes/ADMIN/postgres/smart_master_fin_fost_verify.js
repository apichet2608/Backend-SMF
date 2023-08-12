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
      public.smart_master_verify_fost
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

router.get("/page1/table", async (req, res) => {
  try {
    const { model_name, start_date, stop_date } = req.query;

    queryStr = `
    select
        t.master_type ,
        t.test_datetime ,
        t.machine_id ,
        t.model_name ,
        t.lot_no ,
        t.fixture_code ,
        case
    when not exists (
        select 1
            from smart_master_verify_fost sub
        where
            sub.test_datetime = t.test_datetime
            and sub.model_name = t.model_name
            and sub.fixture_code = t.fixture_code
            and sub.judgement <> 'PASS'
        ) then 'PASS'
     else 'FAIL'
         end as verify_result
     from
        smart_master_verify_fost t
     where 
        model_name = $1
        and test_datetime :: date >= $2 
        and test_datetime :: date <= $3
     group by
        t.master_type ,
        t.test_datetime ,
        t.machine_id ,
        t.model_name ,
        t.lot_no ,
        t.fixture_code
        order by
        t.test_datetime desc;    
        `;
    queryParams = [model_name, start_date, stop_date];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page1/tablemaster", async (req, res) => {
  try {
    const { model_name, fixture_code, start_date, stop_date } = req.query;

    queryStr = `
    select
    row_number() over () as id,
    master_type,
    test_datetime,
    machine_id,
    model_name,
    program_rev,
    lot_no,
    fixture_code,
    piece_index,
    judge,
    master_judge,
    judgement
  from
    smart_master_verify_fost
  where
    model_name = $1
    and fixture_code = $2
    and test_datetime :: date >= $3
    and test_datetime :: date <= $4
  order by
    test_datetime desc;
        `;
    queryParams = [model_name, fixture_code, start_date, stop_date];

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
