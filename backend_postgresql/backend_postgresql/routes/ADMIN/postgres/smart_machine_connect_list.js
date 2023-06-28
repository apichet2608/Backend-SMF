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
    select
    status,
    count,
    case
      when status = 'Finished' then
        (
      select
        json_agg(json_build_object(
            'plan_date_formatted',
        plan_date_formatted,
        'finished_count',
        finished_count
          ))
      from
        (
        select
          TO_CHAR(plan_date,
          'Mon-YYYY') as plan_date_formatted,
          COUNT(*) as finished_count
        from
          public.smart_machine_connect_list
        where
          status = 'Finished'
        group by
          TO_CHAR(plan_date,
          'Mon-YYYY')
          ) subquery 
        ) 
      when status = 'Planed' then
        (
      select
        json_agg(json_build_object(
            'plan_date_formatted',
        plan_date_formatted,
        'planed_count',
        planed_count
          ))
      from
        (
        select
          TO_CHAR(plan_date,
          'Mon-YYYY') as plan_date_formatted,
          COUNT(*) as planed_count
        from
          public.smart_machine_connect_list
        where
          status = 'Planed'
        group by
          TO_CHAR(plan_date,
          'Mon-YYYY')
          ) subquery
        )
      when status = 'Wait for plan' then
        (
      select
        json_agg(json_build_object(
            'plan_date_formatted',
        plan_date_formatted,
        'wait_for_plan_count',
        wait_for_plan_count
          ))
      from
        (
        select
          TO_CHAR(plan_date,
          'Mon-YYYY') as plan_date_formatted,
          COUNT(*) as wait_for_plan_count
        from
          public.smart_machine_connect_list
        where
          status = 'Wait for plan'
        group by
          TO_CHAR(plan_date,
          'Mon-YYYY')
          ) subquery
        )
      when status = '' then
        (
      select
        json_agg(json_build_object(
            'plan_date_formatted',
        plan_date_formatted,
        'empty_status_count',
        empty_status_count
          ))
      from
        (
        select
          TO_CHAR(plan_date,
          'Mon-YYYY') as plan_date_formatted,
          COUNT(*) as empty_status_count
        from
          public.smart_machine_connect_list
        where
          status = ''
        group by
          TO_CHAR(plan_date,
          'Mon-YYYY')
          ) subquery
        )
      else null
    end as sum_month
  from
    (
    select
      status,
      COUNT(*) as count
    from
      public.smart_machine_connect_list
    where
      status in ('Finished', 'Planed', 'Wait for plan', '')
    group by
      status
  union all
    select
      'total' as status,
      COUNT(*) as count
    from
      public.smart_machine_connect_list
    where
      status in ('Finished', 'Planed', 'Wait for plan', '')
  ) subquery
  order by
    count desc
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/table", async (req, res) => {
  try {
    const { status } = req.query;

    let queryStr = "";
    let queryParams = [];

    if (status === "total") {
      queryStr = `
        SELECT *
        FROM public.smart_machine_connect_list smcl
        WHERE status IN ('Finished', 'Planed', 'Wait for plan', '')
        ORDER BY finish_date ASC
      `;
    } else {
      queryStr = `
        SELECT *
        FROM public.smart_machine_connect_list smcl
        WHERE status = $1
        ORDER BY finish_date ASC
      `;
      queryParams = [status];
    }

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      item_factory,
      item_code,
      item_desc2,
      item_desc3,
      item_status,
      item_building,
      item_group,
      item_sub_group,
      item_owner_cc,
      item_sub_process,
      item_mac_maker,
      item_iot_mc_type,
      item_iot_group1,
      item_iot_cont1,
      item_iot_group2,
      item_iot_cont2,
      status,
      npi_year,
      plan_date,
      finish_date,
      remark,
      feeder_no,
    } = req.body;

    const result = await query(
      `UPDATE public.smart_machine_connect_list
       SET
         item_factory = $1,
         item_code = $2,
         item_desc2 = $3,
         item_desc3 = $4,
         item_status = $5,
         item_building = $6,
         item_group = $7,
         item_sub_group = $8,
         item_owner_cc = $9,
         item_sub_process = $10,
         item_mac_maker = $11,
         item_iot_mc_type = $12,
         item_iot_group1 = $13,
         item_iot_cont1 = $14,
         item_iot_group2 = $15,
         item_iot_cont2 = $16,
         status = $17,
         npi_year = $18,
         plan_date = $19,
         finish_date = $20,
         remark = $21,
         feeder_no = $22
       WHERE id = $23;`,
      [
        item_factory,
        item_code,
        item_desc2,
        item_desc3,
        item_status,
        item_building,
        item_group,
        item_sub_group,
        item_owner_cc,
        item_sub_process,
        item_mac_maker,
        item_iot_mc_type,
        item_iot_group1,
        item_iot_cont1,
        item_iot_group2,
        item_iot_cont2,
        status,
        npi_year,
        plan_date,
        finish_date,
        remark,
        feeder_no,
        id,
      ]
    );

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});

// DELETE route to delete data
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      "DELETE FROM public.smart_machine_connect_list WHERE id = $1;",
      [id]
    );

    res.status(200).json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while deleting data" });
  }
});

module.exports = router;
