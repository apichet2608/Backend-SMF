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

router.get("/tablescada", async (req, res) => {
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

router.put("/scada/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      item_factory,
      item_code,
      item_desc1,
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
         item_desc1 = $3,
         item_desc2 = $4,
         item_desc3 = $5,
         item_status = $6,
         item_building = $7,
         item_group = $8,
         item_sub_group = $9,
         item_owner_cc = $10,
         item_sub_process = $11,
         item_mac_maker = $12,
         item_iot_mc_type = $13,
         item_iot_group1 = $14,
         item_iot_cont1 = $15,
         item_iot_group2 = $16,
         item_iot_cont2 = $17,
         status = $18,
         npi_year = $19,
         plan_date = $20,
         finish_date = $21,
         remark = $22,
         feeder_no = $23
       WHERE id = $24;`,
      [
        item_factory,
        item_code,
        item_desc1,
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
router.delete("/scada/:id", async (req, res) => {
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

// POST route to add new data
router.post("/scada/", async (req, res) => {
  try {
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
      item_desc1,
    } = req.body;

    const result = await query(
      `insert
      into
      smart_machine_connect_list
    (item_factory,
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
      item_desc1)
    values($1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    $8,
    $9,
    $10,
    $11,
    $12,
    $13,
    $14,
    $15,
    $16,
    $17,
    $18,
    $19,
    $20,
    $21,
    $22,
    $23);`,
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
        item_desc1,
      ]
    );

    res.status(201).json({ message: "Data added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding data" });
  }
});

router.get("/table2did", async (req, res) => {
  try {
    const { status } = req.query;

    let queryStr = "";
    let queryParams = [];

    if (status === "total") {
      queryStr = `
      select
      item_code, 
      item_building,
      item_owner_cc,
      item_sub_process,
      item_iot_group1,
      twodid ,
      twodid_plan_date ,
      twodid_finish_date ,
      status_2did
    from
      public.smart_machine_connect_list
     WHERE status IN ('Finished', 'Planed', 'Wait for plan', '')
     and  twodid = 'Y'
      `;
    } else {
      queryStr = `
      select
	item_code, 
	item_building,
	item_owner_cc,
	item_sub_process,
	item_iot_group1,
	twodid ,
	twodid_plan_date ,
	twodid_finish_date ,
	status_2did
from
	public.smart_machine_connect_list
 WHERE status = $1
 and  twodid = 'Y'
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

// PUT route to update data
router.put("/2did/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      item_code,
      item_building,
      item_owner_cc,
      item_sub_process,
      item_iot_group1,
      twodid,
      twodid_plan_date,
      twodid_finish_date,
      status_2did,
    } = req.body;

    // Rest of the code remains unchanged
    const result = await query(
      `UPDATE public.smart_machine_connect_list
       SET
         item_code = $1,
         item_building = $2,
         item_owner_cc = $3,
         item_sub_process = $4,
         item_iot_group1 = $5,
         twodid = $6,
         twodid_plan_date = $7,
         twodid_finish_date = $8,
         status_2did = $9
       WHERE id = $10;`,
      [
        item_code,
        item_building,
        item_owner_cc,
        item_sub_process,
        item_iot_group1,
        twodid,
        twodid_plan_date,
        twodid_finish_date,
        status_2did,
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
router.delete("/2did/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Rest of the code remains unchanged
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

// POST route to add new data
router.post("/2did/", async (req, res) => {
  try {
    const {
      item_code,
      item_building,
      item_owner_cc,
      item_sub_process,
      item_iot_group1,
      twodid,
      twodid_plan_date,
      twodid_finish_date,
      status_2did,
    } = req.body;

    // Rest of the code remains unchanged
    const result = await query(
      `INSERT INTO smart_machine_connect_list
      (item_code,
       item_building,
       item_owner_cc,
       item_sub_process,
       item_iot_group1,
       twodid,
       twodid_plan_date,
       twodid_finish_date,
       status_2did)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
      [
        item_code,
        item_building,
        item_owner_cc,
        item_sub_process,
        item_iot_group1,
        twodid,
        twodid_plan_date,
        twodid_finish_date,
        status_2did,
      ]
    );

    res.status(201).json({ message: "Data added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding data" });
  }
});

module.exports = router;
