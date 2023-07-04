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

router.get("/count-status", async (req, res) => {
  try {
    const result = await query(`
    with aggregated_data as (
        select
            month_code,
            building,
            SUM(diff_energy_usage) as total_diff_energy_usage,
            SUM(energy_cost_baht) as total_energy_cost_baht
        from
            public.smart_energy_by_month
        where
            not exists (
            select
                1
            from
                public.smart_energy_by_month as t2
            where
                t2.building = public.smart_energy_by_month.building
                and t2.month_code > public.smart_energy_by_month.month_code
                  )
        group by
            month_code,
            building
          )
        select
            month_code,
            building,
            SUM(total_diff_energy_usage) as total_diff_energy_usage,
            SUM(total_energy_cost_baht) as total_energy_cost_baht
        from
            aggregated_data
        group by
            month_code,
            building
        union all
        select
            month_code,
            'total' as building,
            SUM(total_diff_energy_usage) as total_diff_energy_usage,
            SUM(total_energy_cost_baht) as total_energy_cost_baht
        from
            aggregated_data
        group by
            month_code
        order by
            month_code,
            building;    
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/plot", async (req, res) => {
  try {
    const { build } = req.query;

    let queryStr = "";
    let queryParams = [];

    if (build === "ALL") {
      queryStr = `
      select
      ROW_NUMBER() OVER (ORDER BY month_code ASC) AS id,
      month_code,
      SUM(diff_energy_usage) as total_diff_energy_usage,
      SUM(energy_cost_baht) as total_energy_cost_baht
  from
      public.smart_energy_by_month
  group by
      month_code
  order by
      month_code asc
        `;
    } else {
      queryStr = `
      select
      ROW_NUMBER() OVER (ORDER BY month_code ASC) AS id,
      month_code,
      building,
      SUM(diff_energy_usage) as total_diff_energy_usage,
      SUM(energy_cost_baht) as total_energy_cost_baht
  from
      public.smart_energy_by_month
  where
      building = $1
  group by
      month_code,
      building
  order by
      month_code asc
        `;
      queryParams = [build];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/plot2", async (req, res) => {
  try {
    const { build } = req.query;

    let queryStr = "";
    let queryParams = [];

    if (build === "ALL") {
      queryStr = `
      select
      ROW_NUMBER() OVER (ORDER BY month_code ASC) AS id,
      CONCAT(area, '-', building) AS area,
	month_code,
	building,
	SUM(diff_energy_usage) as total_diff_energy_usage
from
	public.smart_energy_by_month
where
	month_code = (SELECT MAX(month_code) FROM public.smart_energy_by_month)
group by
	area,
	month_code,
	building
order by
	month_code desc,
	total_diff_energy_usage desc
limit 10
        `;
    } else {
      queryStr = `
      select
      ROW_NUMBER() OVER (ORDER BY month_code ASC) AS id,
      CONCAT(area, '-', building) AS area,
      month_code,
      building,
      SUM(diff_energy_usage) as total_diff_energy_usage
    from
      public.smart_energy_by_month
    where
      month_code = (SELECT MAX(month_code) FROM public.smart_energy_by_month)
      and building = $1
    group by
      area,
      month_code,
      building
    order by
      month_code desc,
      total_diff_energy_usage desc
    limit 10
        `;
      queryParams = [build];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page2/table", async (req, res) => {
  try {
    const { build } = req.query;

    let queryStr = "";
    let queryParams = [];

    if (build === "ALL") {
      queryStr = `
      select
	row_number() over (
	order by month_code asc) as id,
		load_type,
		building,
		month_code,
		sum(diff_energy_usage) as diff_energy_usage_count
from
	public.smart_energy_by_month
where
	month_code = (
	select
		MAX(month_code)
	from
		public.smart_energy_by_month)
group by 
		load_type,
		building,
		month_code
order by
diff_energy_usage_count desc,
		 load_type desc
        `;
    } else {
      queryStr = `
      select
	row_number() over (
	order by month_code asc) as id,
		load_type,
		building,
		month_code,
		sum(diff_energy_usage) as diff_energy_usage_count
from
	public.smart_energy_by_month
where
	month_code = (
	select
		MAX(month_code)
	from
		public.smart_energy_by_month)
    and building = $1
group by 
		load_type,
		building,
		month_code
order by
diff_energy_usage_count desc,
		 load_type desc
        `;
      queryParams = [build];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page2/distinctarea", async (req, res) => {
  try {
    const { build, loadtype } = req.query;

    let queryStr = "";
    let queryParams = [];

    if (build === "ALL") {
      queryStr = `
      select
	distinct area 
from
	public.smart_energy_by_month
        `;
    } else {
      queryStr = `
      select
      distinct area 
    from
      public.smart_energy_by_month
    where 
      building = $1
      and
      load_type = $2
        `;
      queryParams = [build, loadtype];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page2/table2", async (req, res) => {
  try {
    const { build, loadtype, area } = req.query;

    let queryStr = "";
    let queryParams = [];

    if (build === "ALL") {
      queryStr = `
      select
      *
    from
      public.smart_energy_by_month
    order by
         "month" asc
        `;
    } else {
      queryStr = `
      select
      *
    from
      public.smart_energy_by_month
    where 
      building = $1
      and
      load_type = $2
      and 
      area = $3
    order by
         "month" asc
        `;
      queryParams = [build, loadtype, area];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page2/plot2", async (req, res) => {
  try {
    const { build, loadtype, area } = req.query;

    let queryStr = "";
    let queryParams = [];

    if (build === "ALL") {
      queryStr = `
      select
      month_code,
      sum(diff_energy_usage) as diff_energy_usage
    from
      public.smart_energy_by_month
    where 
      building = 'A'
      and
      load_type = 'Lighting'
      and 
      area = 'OFFICE-A'
    group by 
      month_code 
    order by
         month_code asc
        `;
    } else {
      queryStr = `
      select
      month_code,
      sum(diff_energy_usage) as diff_energy_usage
    from
      public.smart_energy_by_month
    where 
      building = $1
      and
      load_type = $2
      and 
      area = $3
    group by 
      month_code 
    order by
         month_code asc
        `;
      queryParams = [build, loadtype, area];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page3/distinctDept", async (req, res) => {
  try {
    const result = await query(`
    SELECT distinct dept_2 
FROM public.smart_energy_by_month
order by dept_2 asc
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page3/table", async (req, res) => {
  try {
    const result = await query(`
    select
    row_number() over (
      order by month_code asc) as id,
    month_code,
    load_type,
    dept_2,
    sum(energy_cost_baht) as energy_cost_baht,
    sum(unit_price_bth_per_kwh) as unit_price_bth_per_kwh
  from
    public.smart_energy_by_month
  where
    month_code = (
    select
      MAX(month_code)
    from
      public.smart_energy_by_month)
  group by
    month_code,
    dept_2,
    load_type
  order by
    month_code asc
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
