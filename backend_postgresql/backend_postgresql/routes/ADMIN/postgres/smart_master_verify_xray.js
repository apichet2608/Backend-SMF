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
      select
	t.xray_date,
	t.xray_machine,
	t.xray_program,
	t.sheet_no,
	t.xray_inspect_count,
	case
		when not exists

(
		select
			1
		from
			smart_master_verify_xray sub
		where
			sub.xray_date = t.xray_date
			and sub.sheet_no = t.sheet_no
			and sub.xray_inspect_count = t.xray_inspect_count
			and sub.judgement <> 'PASS'

) then 'PASS'
		else 'FAIL'
	end as judgement
from
	smart_master_verify_xray t
where
	t.sheet_no = $1
	and t.xray_date :: date >= $2
	and t.xray_date :: date <= $3
group by
	t.xray_date,
	t.xray_machine,
	t.xray_program,
	t.sheet_no,
	t.xray_inspect_count
order by
	t.xray_date desc,
	t.xray_inspect_count desc; 
          `;
      queryParams = [sheet_no, start_date, stop_date];
    } else {
      queryStr = `
      select
      t.xray_date,
      t.xray_machine,
      t.xray_program,
      t.sheet_no,
      t.xray_inspect_count,
      case
        when not exists
    
    (
        select
          1
        from
          smart_master_verify_xray sub
        where
          sub.xray_date = t.xray_date
          and sub.sheet_no = t.sheet_no
          and sub.xray_inspect_count = t.xray_inspect_count
          and sub.judgement <> 'PASS'
    
    ) then 'PASS'
        else 'FAIL'
      end as judgement
    from
      smart_master_verify_xray t
    where
      t.sheet_no = $1
      and t.xray_date :: date >= $2
      and t.xray_date :: date <= $3
      and t.xray_machine = $4
    group by
      t.xray_date,
      t.xray_machine,
      t.xray_program,
      t.sheet_no,
      t.xray_inspect_count
    order by
      t.xray_date desc,
      t.xray_inspect_count desc;
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
    const {
      sheet_no,
      xray_inspection_count,
      start_date,
      stop_date,
      xray_machine,
    } = req.query;

    if (xray_machine === "ALL") {
      queryStr = `
      select
      t.sheet_no ,
      t.sample_no ,
      t.verify_result ,
      t.master_result ,
      t.verify_operator ,
      t.master_operator ,
      t.judgement
    from
      smart_master_verify_xray t
    where
      sheet_no = $1
      and t.xray_date :: date >= $2
      and t.xray_date :: date <= $3
      and t.xray_inspect_count  = $4
    order by
      t.sample_no asc`;
      queryParams = [sheet_no, start_date, stop_date, xray_inspection_count];
    } else {
      queryStr = `
      select
      t.sheet_no ,
      t.sample_no ,
      t.verify_result ,
      t.master_result ,
      t.verify_operator ,
      t.master_operator ,
      t.judgement
    from
      smart_master_verify_xray t
    where
      sheet_no = $1
      and t.xray_date :: date >= $2
      and t.xray_date :: date <= $3
      and t.xray_inspect_count  = $4
      and t.xray_machine  = $5
    order by
      t.sample_no asc`;
      queryParams = [
        sheet_no,
        start_date,
        stop_date,
        xray_inspection_count,
        xray_machine,
      ];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
