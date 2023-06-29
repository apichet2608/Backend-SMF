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

// // POST route to add new data
// router.post("/", async (req, res) => {
//   try {
//     const {
//       item_factory,
//       item_code,
//       item_desc2,
//       item_desc3,
//       item_status,
//       item_building,
//       item_group,
//       item_sub_group,
//       item_owner_cc,
//       item_sub_process,
//       item_mac_maker,
//       item_iot_mc_type,
//       item_iot_group1,
//       item_iot_cont1,
//       item_iot_group2,
//       item_iot_cont2,
//       status,
//       npi_year,
//       plan_date,
//       finish_date,
//       remark,
//       feeder_no,
//       item_desc1,
//     } = req.body;

//     const result = await query(
//       `insert
//       into
//       smart_machine_connect_list
//     (item_factory,
//       item_code,
//       item_desc2,
//       item_desc3,
//       item_status,
//       item_building,
//       item_group,
//       item_sub_group,
//       item_owner_cc,
//       item_sub_process,
//       item_mac_maker,
//       item_iot_mc_type,
//       item_iot_group1,
//       item_iot_cont1,
//       item_iot_group2,
//       item_iot_cont2,
//       status,
//       npi_year,
//       plan_date,
//       finish_date,
//       remark,
//       feeder_no,
//       item_desc1)
//     values($1,
//     $2,
//     $3,
//     $4,
//     $5,
//     $6,
//     $7,
//     $8,
//     $9,
//     $10,
//     $11,
//     $12,
//     $13,
//     $14,
//     $15,
//     $16,
//     $17,
//     $18,
//     $19,
//     $20,
//     $21,
//     $22,
//     $23);`,
//       [
//         item_factory,
//         item_code,
//         item_desc2,
//         item_desc3,
//         item_status,
//         item_building,
//         item_group,
//         item_sub_group,
//         item_owner_cc,
//         item_sub_process,
//         item_mac_maker,
//         item_iot_mc_type,
//         item_iot_group1,
//         item_iot_cont1,
//         item_iot_group2,
//         item_iot_cont2,
//         status,
//         npi_year,
//         plan_date,
//         finish_date,
//         remark,
//         feeder_no,
//         item_desc1,
//       ]
//     );

//     res.status(201).json({ message: "Data added successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while adding data" });
//   }
// });

router.post("/", async (req, res) => {
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

    let query = `
      INSERT INTO smart_machine_connect_list (`;
    let values = [];
    let index = 1;

    if (item_factory !== null) {
      query += `item_factory, `;
      values.push(item_factory);
    }

    if (item_code !== null) {
      query += `item_code, `;
      values.push(item_code);
    }

    if (item_desc2 !== null) {
      query += `item_desc2, `;
      values.push(item_desc2);
    }

    if (item_desc3 !== null) {
      query += `item_desc3, `;
      values.push(item_desc3);
    }

    if (item_status !== null) {
      query += `item_status, `;
      values.push(item_status);
    }

    // เพิ่มเงื่อนไขสำหรับฟิลด์อื่น ๆ ที่คุณต้องการตรวจสอบ
    if (item_building !== null) {
      query += `item_building, `;
      values.push(item_building);
    }

    if (item_group !== null) {
      query += `item_group, `;
      values.push(item_group);
    }

    if (item_sub_group !== null) {
      query += `item_sub_group, `;
      values.push(item_sub_group);
    }

    if (item_owner_cc !== null) {
      query += `item_owner_cc, `;
      values.push(item_owner_cc);
    }

    if (item_sub_process !== null) {
      query += `item_sub_process, `;
      values.push(item_sub_process);
    }

    if (item_mac_maker !== null) {
      query += `item_mac_maker, `;
      values.push(item_mac_maker);
    }

    if (item_iot_mc_type !== null) {
      query += `item_iot_mc_type, `;
      values.push(item_iot_mc_type);
    }

    if (item_iot_group1 !== null) {
      query += `item_iot_group1, `;
      values.push(item_iot_group1);
    }

    if (item_iot_cont1 !== null) {
      query += `item_iot_cont1, `;
      values.push(item_iot_cont1);
    }

    if (item_iot_group2 !== null) {
      query += `item_iot_group2, `;
      values.push(item_iot_group2);
    }

    if (item_iot_cont2 !== null) {
      query += `item_iot_cont2, `;
      values.push(item_iot_cont2);
    }

    if (status !== null) {
      query += `status, `;
      values.push(status);
    }

    if (npi_year !== null) {
      query += `npi_year, `;
      values.push(npi_year);
    }

    if (plan_date !== null) {
      query += `plan_date, `;
      values.push(plan_date);
    }

    if (finish_date !== null) {
      query += `finish_date, `;
      values.push(finish_date);
    }

    if (remark !== null) {
      query += `remark, `;
      values.push(remark);
    }

    if (feeder_no !== null) {
      query += `feeder_no, `;
      values.push(feeder_no);
    }

    if (item_desc1 !== null) {
      query += `item_desc1, `;
      values.push(item_desc1);
    }

    query = query.slice(0, -2); // ลบเครื่องหมายลูกน้ำสุดท้าย ", "
    query += `) VALUES (`;

    for (let i = 0; i < values.length; i++) {
      query += `$${index}, `;
      index++;
    }

    query = query.slice(0, -2); // ลบเครื่องหมายลูกน้ำสุดท้าย ", "
    query += `)`;

    const result = await query(query, values);

    res.status(201).json({ message: "Data added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding data" });
  }
});

module.exports = router;
