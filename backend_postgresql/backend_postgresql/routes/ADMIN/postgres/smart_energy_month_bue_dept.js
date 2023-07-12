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

router.get("/page4/distinctDept", async (req, res) => {
  try {
    const result = await query(`
    select
	distinct dept_2
from
	public.smart_energy_month_bue_dept
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

// router.get("/page3/table", async (req, res) => {
//   try {
//     const { dept } = req.query;

//     let queryStr = "";
//     let queryParams = [];

//     if (dept === "ALL") {
//       queryStr = `
//       select
// 	ROW_NUMBER() OVER (ORDER BY month_code ASC) AS id,
// 	month_code,
// 	load_type,
// 	dept_2,
// 	sum(diff_energy_usage) as diff_energy_usage,
// 	sum(energy_cost_baht) as energy_cost_baht
// from
// 	public.smart_energy_by_month
// where
// 	month_code = (
// 	select
// 		MAX(month_code)
// 	from
// 		public.smart_energy_by_month)
// group by
// 	month_code,
// 	dept_2,
// 	load_type
// order by
// 	month_code asc
//         `;
//     } else {
//       queryStr = `
//       select
//       ROW_NUMBER() OVER (ORDER BY month_code ASC) AS id,
//       month_code,
//       load_type,
//       dept_2,
//       sum(diff_energy_usage) as diff_energy_usage,
//       sum(energy_cost_baht) as energy_cost_baht
//     from
//       public.smart_energy_by_month
//     where
//       month_code = (
//       select
//         MAX(month_code)
//       from
//         public.smart_energy_by_month)
//       and dept_2 = $1
//     group by
//       month_code,
//       dept_2,
//       load_type
//     order by
//       month_code asc
//         `;
//       queryParams = [dept];
//     }

//     const result = await query(queryStr, queryParams);
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while fetching data" });
//   }
// });

// router.get("/page3/distinctbuild", async (req, res) => {
//   try {
//     const { dept, loadtype } = req.query;

//     let queryStr = "";
//     let queryParams = [];

//     if (dept === "ALL") {
//       queryStr = `
//       select
// 	distinct building
// from
// 	public.smart_energy_by_month
// where
//       load_type = $1
//         `;
//       queryParams = [loadtype];
//     } else {
//       queryStr = `
//       select
//       distinct building
//     from
//       public.smart_energy_by_month
//     where
//       dept_2 = $1
//       and
//       load_type = $2
//         `;
//       queryParams = [dept, loadtype];
//     }

//     const result = await query(queryStr, queryParams);
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while fetching data" });
//   }
// });

// router.get("/page3/table2", async (req, res) => {
//   try {
//     const { dept, loadtype, build } = req.query;

//     let queryStr = "";
//     let queryParams = [];

//     queryStr = `
//       select
//       *
//     from
//       public.smart_energy_by_month
//     where
//       dept_2 = $1
//       and
//       load_type = $2
//       and
//       building = $3
//     order by
//          "month" asc
//         `;
//     queryParams = [dept, loadtype, build];

//     const result = await query(queryStr, queryParams);
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while fetching data" });
//   }
// });

// router.get("/page3/plot2", async (req, res) => {
//   try {
//     const { build, loadtype, dept } = req.query;

//     let queryStr = "";
//     let queryParams = [];

//     if (dept === "ALL") {
//       queryStr = `
//       select
//       month_code,
//       sum(diff_energy_usage) as diff_energy_usage
//     from
//       public.smart_energy_by_month
//     where
//       building = $1
//       and
//       load_type = $2
//     group by
//       month_code
//     order by
//          month_code asc
//         `;
//       queryParams = [build, loadtype];
//     } else {
//       queryStr = `
//       select
//       month_code,
//       sum(diff_energy_usage) as diff_energy_usage
//     from
//       public.smart_energy_by_month
//     where
//       building = $1
//       and
//       load_type = $2
//       and
//       dept_2 = $3
//     group by
//       month_code
//     order by
//          month_code asc
//         `;
//       queryParams = [build, loadtype, dept];
//     }

//     const result = await query(queryStr, queryParams);
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while fetching data" });
//   }
// });

module.exports = router;
