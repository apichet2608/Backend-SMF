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
    WITH aggregated_data AS (
        SELECT
            month_code,
            building,
            SUM(unit_price_bth_per_kwh) AS total_unit_price_bth_per_kwh,
             SUM(energy_cost_baht) AS total_energy_cost_baht
        FROM
            public.smart_energy_by_month
        WHERE
            NOT EXISTS (
                SELECT
                    1
                FROM
                    public.smart_energy_by_month AS t2
                WHERE
                    t2.building = public.smart_energy_by_month.building
                    AND t2.month_code > public.smart_energy_by_month.month_code
            )
        GROUP BY
            month_code,
            building
    )
    SELECT
        month_code,
        building,
        SUM(total_unit_price_bth_per_kwh) AS total_unit_price_bth_per_kwh,
         SUM(total_energy_cost_baht) AS total_energy_cost_baht
    FROM
        aggregated_data
    GROUP BY
        month_code, building
    
    UNION ALL
    
    SELECT
        month_code,
        'total' AS building,
        SUM(total_unit_price_bth_per_kwh) AS total_unit_price_bth_per_kwh,
         SUM(total_energy_cost_baht) AS total_energy_cost_baht
    FROM
        aggregated_data
    GROUP BY
        month_code
    
    ORDER BY
        month_code, building;       
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

module.exports = router;
