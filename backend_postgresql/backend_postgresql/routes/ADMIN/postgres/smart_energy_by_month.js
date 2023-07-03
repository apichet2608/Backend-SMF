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
      building,
      SUM(diff_energy_usage) as total_diff_energy_usage,
      SUM(energy_cost_baht) as total_energy_cost_baht
  from
      public.smart_energy_by_month
  group by
      month_code,
      building
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
	area,
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
      area,
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
    const result = await query(`
    select
	mdb_code,
	feeder,
	maker_mdb_code,
	mc_equip_name,
	energy_use_type,
	load_type,
	"desc",
	building,
	cost_ceter,
	room_type,
	dept_1,
	dept_2,
	area,
	power_ratio,
	max_energy_use,
	energy_usage,
	"month",
	month_code,
	max_date,
	unit_price_bth_per_kwh,
	diff_energy_usage,
	energy_cost_baht,
	id,
	auto_check
from
	public.smart_energy_by_month; 
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
