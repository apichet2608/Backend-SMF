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

router.get("/sum-last-status", async (req, res) => {
  try {
    const { division, department } = req.query;
    const result = await query(
      `SELECT
      TO_CHAR(MAX(TO_DATE(year_month, 'YYYY-MM-DD')), 'YYYY-MM-DD') AS year_month,
      cost_type,
      SUM(expense_plan) AS total_expense_plan,
      SUM(expense_result) AS expense_result,
      json_agg(
        CASE
          WHEN cost_type = 'OUTPUT' THEN
            json_build_object(
              'actual_sht_qty', actual_sht_qty
            )
          ELSE
            json_build_object(
              'baht_per_sheet', baht_per_sheet,
              'baht_per_m', baht_per_m,
              'baht_per_m2', baht_per_m2
            )
        END
      ) AS baht_data,
      CASE
        WHEN cost_type = 'OUTPUT' THEN 1
        WHEN cost_type = 'LABOR' THEN 2
        WHEN cost_type = 'CONSUMABLES' THEN 3
        WHEN cost_type = 'CHEMICAL' THEN 4
        WHEN cost_type = 'TOOL' THEN 5
        WHEN cost_type = 'REPAIRING' THEN 6
        ELSE 7
      END AS order_by
    FROM
      public.smart_cost_kpi
    WHERE
      NOT EXISTS (
        SELECT 1
        FROM public.smart_cost_kpi AS t2
        WHERE t2.cost_type = public.smart_cost_kpi.cost_type
          AND TO_DATE(t2.year_month, 'YYYY-MM-DD') > TO_DATE(public.smart_cost_kpi.year_month, 'YYYY-MM-DD')
      )
      AND factory = 'A1'
      AND division = $1
      AND department = $2
    GROUP BY
      cost_type
    ORDER BY
      order_by ASC;        
    `,
      [division, department]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page1/plot", async (req, res) => {
  try {
    const { division, department, cost_type } = req.query;

    let queryStr = "";
    let queryParams = [];

    if (department === "ALL") {
      queryStr = `
      select
      *
    from
      public.smart_cost_kpi
    where
      division = $1
      and cost_type = $2
      and factory = 'A1'
    order by
      year_month::date asc
        `;
      queryParams = [division, cost_type];
    } else {
      queryStr = `
      select
	*
from
	public.smart_cost_kpi
where
	division = $1
	and department = $2
	and cost_type = $3
	and factory = 'A1'
order by
	year_month::date asc
        `;
      queryParams = [division, department, cost_type];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page1/plot2", async (req, res) => {
  try {
    const { division, department, cost_type } = req.query;

    let queryStr = "";
    let queryParams = [];

    if (department === "ALL") {
      queryStr = `
      select
      item_code,
      year_month,
      SUM(expense_result) as total_expense_result
    from
      public.smart_cost_item_month_kpi
    where
      factory = 'A1'
      and division = $1
      and cost_type = $2
      and year_month = (
      select
        MAX(year_month) as year_month
      from
        public.smart_cost_item_month_kpi
      order by
        year_month desc)
    group by
      item_code,
      year_month
    order by
      total_expense_result desc
      limit 20;
        `;
      queryParams = [division, cost_type];
    } else {
      queryStr = `
      SELECT
  CONCAT('ITEM - ', item_code) AS item_code,
  year_month,
  SUM(expense_result) AS total_expense_result
FROM
  public.smart_cost_item_month_kpi
WHERE
  factory = 'A1'
  AND division = $1
  AND department = $2
  AND cost_type = $3
  AND year_month = (
    SELECT
      MAX(year_month) AS year_month
    FROM
      public.smart_cost_item_month_kpi
    ORDER BY
      year_month DESC
  )
GROUP BY
  item_code,
  year_month
ORDER BY
  total_expense_result DESC
  limit 20;
        `;
      queryParams = [division, department, cost_type];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page1/table2", async (req, res) => {
  try {
    const { division, department, cost_type } = req.query;

    let queryStr = "";
    let queryParams = [];

    if (department === "ALL") {
      queryStr = `
      select
	factory,
	division,
	department,
	sub_department,
	cost_center,
	cost_center_name,
	item_code,
	cost_type,
	year_month,
	expense_plan,
	expense_result,
	id,
	create_at,
	update_date
from
	public.smart_cost_item_month_kpi
WHERE
  factory = 'A1'
  AND division = $1
  AND department = $2
  AND cost_type = $3
  AND year_month = (
    SELECT
      MAX(year_month) AS year_month
    FROM
      public.smart_cost_item_month_kpi
    ORDER BY
      year_month DESC
  )
  ORDER BY
  expense_result  DESC;
        `;
      queryParams = [division, cost_type];
    } else {
      queryStr = `
      select
	factory,
	division,
	department,
	sub_department,
	cost_center,
	cost_center_name,
	item_code,
	cost_type,
	year_month,
	expense_plan,
	expense_result,
	id,
	create_at,
	update_date
from
	public.smart_cost_item_month_kpi
WHERE
  factory = 'A1'
  AND division = $1
  AND department = $2
  AND cost_type = $3
  AND year_month = (
    SELECT
      MAX(year_month) AS year_month
    FROM
      public.smart_cost_item_month_kpi
    ORDER BY
      year_month DESC
  )
  ORDER BY
  expense_result  DESC;
        `;
      queryParams = [division, department, cost_type];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page1/plot3", async (req, res) => {
  try {
    const { division, department, cost_type, item_code, cost_center } =
      req.query;

    let queryStr = "";
    let queryParams = [];

    if (department === "ALL") {
      queryStr = `
      SELECT
      CONCAT('ITEM - ', item_code) AS item_code,
      year_month,
      cost_center ,
      SUM(expense_plan) AS total_expense_plan,
      SUM(expense_result) AS total_expense_result
    FROM
      public.smart_cost_item_month_kpi
    WHERE
      factory = 'A1'
      AND division = $1
      AND department = $2
      AND cost_type = $3
      and item_code = $4
      and cost_center = $5
    GROUP BY
      item_code,
      year_month,
      cost_center
    ORDER BY
      year_month asc;
        `;
      queryParams = [division, cost_type];
    } else {
      queryStr = `
      SELECT
      CONCAT('ITEM - ', item_code) AS item_code,
      year_month,
      cost_center ,
      SUM(expense_plan) AS total_expense_plan,
      SUM(expense_result) AS total_expense_result
    FROM
      public.smart_cost_item_month_kpi
    WHERE
      factory = 'A1'
      AND division = $1
      AND department = $2
      AND cost_type = $3
      and item_code = $4
      and cost_center = $5
    GROUP BY
      item_code,
      year_month,
      cost_center
    ORDER BY
      year_month asc;
        `;
      queryParams = [division, department, cost_type, item_code, cost_center];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctdivision", async (req, res) => {
  try {
    const result = await query(
      `select
      distinct division
    from
      public.smart_cost_kpi`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctdepartment", async (req, res) => {
  try {
    const { division } = req.query;
    const result = await query(
      `select
      distinct department
    from
      public.smart_cost_kpi
    where division = $1 and 
    factory = 'A1'`,
      [division]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
