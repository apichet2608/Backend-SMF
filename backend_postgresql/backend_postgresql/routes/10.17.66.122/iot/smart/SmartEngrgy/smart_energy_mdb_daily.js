const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  host: "10.17.66.122",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "iot",
});

const query = (text, params) => pool.query(text, params);

router.get("/count-status", async (req, res) => {
  try {
    const result = await query(`
    with aggregated_data as (
        select
            month_code,
            building,
            SUM(diff_energy) as total_diff_energy,
            SUM(energy_price) as total_energy_price
        from
            smart.smart_energy_mdb_daily
        where
            not exists (
            select
                1
            from
                smart.smart_energy_mdb_daily as t2
            where
                t2.building = smart.smart_energy_mdb_daily.building
                and t2.month_code > smart.smart_energy_mdb_daily.month_code
                  )
        group by
            month_code,
            building
          )
        select
            month_code,
            building,
            SUM(total_diff_energy) as total_diff_energy,
            SUM(total_energy_price) as total_energy_price
        from
            aggregated_data
        group by
            month_code,
            building
        union all
        select
            month_code,
            'total' as building,
            SUM(total_diff_energy) as total_diff_energy,
            SUM(total_energy_price) as total_energy_price
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

module.exports = router;
