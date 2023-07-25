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

router.get("/distinctemailforadddept", async (req, res) => {
  try {
    const result = await query(
      `SELECT distinct  email 
      FROM public.users
      order by email desc
    `
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/distinctdeptforadddept", async (req, res) => {
  try {
    const result = await query(
      `select
      distinct dept
    from
      public.smart_collaboration_master_add_dept
    order by
      dept desc
    `
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/checkdept", async (req, res) => {
  try {
    const { email } = req.query;
    const result = await query(
      `SELECT distinct  dept
    FROM public.users_dept
    where email = $1
    order by dept asc
    `,
      [email]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/count-status", async (req, res) => {
  try {
    const { dept } = req.query;

    let queryStr = "";
    let queryParams = [];

    const deptValues = dept.split(",").map((value) => value.trim());
    const placeholders = deptValues
      .map((_, index) => `$${index + 1}`)
      .join(",");

    queryStr = `
      select
      status,
      count,
      case
        when status = 'total' then 1
        when status = 'Finished' then 2
        when status = 'Ongoing' then 3
        when status = 'Open' then 4
        else 5
      end as order_by,
      case
        when status = 'Finished' then
            (
        select
          json_agg(json_build_object(
                'dri',
          dri,
          'status',
          status
              ))
        from
          (
          select
            dri,
            COUNT(*) as status
          from
            public.smart_project_task
          where
            status = 'Finished'
            and dept in (${placeholders})
          group by
            dri
              ) subquery
            )
        when status = 'Ongoing' then
            (
        select
          json_agg(json_build_object(
                'dri',
          dri,
          'status',
          status
              ))
        from
          (
          select
            dri,
            COUNT(*) as status
          from
            public.smart_project_task
          where
            status = 'Ongoing'
            and dept in (${placeholders})
          group by
            dri
              ) subquery
            )
        when status = 'Open' then
            (
        select
          json_agg(json_build_object(
                'dri',
          dri,
          'status',
          status
              ))
        from
          (
          select
            dri,
            COUNT(*) as status
          from
            public.smart_project_task
          where
            status = 'Open'
            and dept in (${placeholders})
          group by
            dri
              ) subquery
            )
        when status = '' then
            (
        select
          json_agg(json_build_object(
                'dri',
          dri,
          'status',
          status
              ))
        from
          (
          select
            dri,
            COUNT(*) as status
          from
            public.smart_project_task
          where
            status = ''
            and dept in (${placeholders})
          group by
            dri
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
      public.smart_project_task
    where dept in (${placeholders})
    group by
      status
    union all
        select
      'total' as status,
      COUNT(*) as count
    from
      public.smart_project_task
    where dept in (${placeholders})
      ) subquery
    order by
      order_by asc
      `;
    queryParams = deptValues;

    const result = await query(queryStr, queryParams);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/count-status-fixed", async (req, res) => {
  try {
    const { dri, dept } = req.query;

    const result = await query(
      `
      select
      status,
      count,
      case
        when status = 'total' then 1
        when status = 'Finished' then 2
        when status = 'Ongoing' then 3
        when status = 'Open' then 4
        else 5
      end as order_by,
      case
        when status = 'Finished' then (
        select
          json_agg(json_build_object(
                'dri',
          dri,
          'status',
          status,
          'project',
          project
              ))
        from
          (
          select
            dri,
            COUNT(*) as status,
            project
          from
            public.smart_project_task
          where
            status = 'Finished'
            and dri = $1
            and dept = $2
          group by
            dri,
            project
              ) subquery
            )
        when status = 'Ongoing' then (
        select
          json_agg(json_build_object(
                'dri',
          dri,
          'status',
          status,
          'project',
          project
              ))
        from
          (
          select
            dri,
            COUNT(*) as status,
            project
          from
            public.smart_project_task
          where
            status = 'Ongoing'
            and dri = $1
            and dept = $2
          group by
            dri,
            project
              ) subquery
            )
        when status = 'Open' then (
        select
          json_agg(json_build_object(
                'dri',
          dri,
          'status',
          status,
          'project',
          project
              ))
        from
          (
          select
            dri,
            COUNT(*) as status,
            project
          from
            public.smart_project_task
          where
            status = 'Open'
            and dri = $1
            and dept = $2
          group by
            dri,
            project
              ) subquery
            )
        when status = '' then (
        select
          json_agg(json_build_object(
                'dri',
          dri,
          'status',
          status
              ))
        from
          (
          select
            dri,
            COUNT(*) as status
          from
            public.smart_project_task
          where
            status = ''
            and dri = $1
            and dept = $2
          group by
            dri
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
        public.smart_project_task
      where
        dri = $1
        and dept = $2
      group by
        status
    union all
      select
        'total' as status,
        COUNT(*) as count
      from
        public.smart_project_task
      where
        dri = $1
        and dept = $2
        ) subquery
    order by
      order_by asc
      `,
      [dri, dept]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

// router.get("/table", async (req, res) => {
//   try {
//     const { dept } = req.query;

//     let queryStr = "";
//     let queryParams = [];

//     if (dept === "ALL") {
//       queryStr = `
//       select
//       *
//     from
//       public.smart_project_task
//     order by "no" asc
//       `;
//     } else {
//       queryStr = `
//       select
// 	*
// from
// 	public.smart_project_task
// where dept = $1
// order by "no" asc
//       `;
//       queryParams = [dept];
//     }

//     const result = await query(queryStr, queryParams);
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred while fetching data" });
//   }
// });
router.get("/table", async (req, res) => {
  try {
    const { dept } = req.query;

    let queryStr = "";
    let queryParams = [];

    if (dept === "ALL") {
      queryStr = `
      select
      *
    from
      public.smart_project_task
    order by "no" asc
      `;
    } else {
      const deptValues = dept.split(",").map((value) => value.trim());
      const placeholders = deptValues
        .map((_, index) => `$${index + 1}`)
        .join(",");

      queryStr = `
      select
        *
      from
        public.smart_project_task
      where dept in (${placeholders})
      order by "no" asc
      `;

      queryParams = deptValues;
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
      dept,
      project,
      description,
      action,
      dri,
      plan_date,
      status,
      email,
      link,
      no,
    } = req.body;

    if (status === "Finished") {
      const result = await query(
        `UPDATE public.smart_project_task
         SET
           dept = $1,
           project = $2,
           description = $3,
           action = $4,
           dri = $5,
           plan_date = $6,
           status = $7,
           email = $8,
           link = $9,
           "no" = $10,
           finished_date = now()
         WHERE id = $11`,
        [
          dept,
          project,
          description,
          action,
          dri,
          plan_date,
          status,
          email,
          link,
          no,
          id,
        ]
      );
    } else {
      const result = await query(
        `UPDATE public.smart_project_task
         SET
           dept = $1,
           project = $2,
           description = $3,
           action = $4,
           dri = $5,
           plan_date = $6,
           status = $7,
           email = $8,
           link = $9,
           "no" = $10,
           finished_date = null
         WHERE id = $11`,
        [
          dept,
          project,
          description,
          action,
          dri,
          plan_date,
          status,
          email,
          link,
          no,
          id,
        ]
      );
    }

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
      "DELETE FROM public.smart_project_task WHERE id = $1;",
      [id]
    );

    res.status(200).json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while deleting data" });
  }
});

// router.post("/", async (req, res) => {
//   try {
//     const {
//       dept,
//       project,
//       description,
//       action,
//       dri,
//       plan_date,
//       status,
//       email,
//       link,
//       no,
//     } = req.body;

//     const result = await query(
//       `INSERT INTO smart_project_task (
//          dept,
//          project,
//          description,
//          action,
//          dri,
//          plan_date,
//          status,
//          email,
//          link,
//          "no"
//        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10)`,
//       [
//         dept,
//         project,
//         description,
//         action,
//         dri,
//         plan_date,
//         status,
//         email,
//         link,
//         no,
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
      dept,
      project,
      description,
      action,
      dri,
      plan_date,
      status,
      email,
      link,
      no,
      sub_action, // เพิ่ม sub_action ในการรับข้อมูล
    } = req.body;

    let querrydata;
    let values;
    console.log(plan_date);
    if (plan_date === null || plan_date === "") {
      querrydata = `INSERT INTO smart_project_task (
         dept,
         project,
         description,
         action,
         dri,
         status,
         email,
         link,
         "no",
         sub_action
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
      values = [
        dept,
        project,
        description,
        action,
        dri,
        status,
        email,
        link,
        no,
        JSON.stringify(sub_action), // แปลง Array of Objects เป็น JSON
      ];
    } else {
      querrydata = `INSERT INTO smart_project_task (
         dept,
         project,
         description,
         action,
         dri,
         plan_date,
         status,
         email,
         link,
         "no",
         sub_action
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`;
      values = [
        dept,
        project,
        description,
        action,
        dri,
        plan_date,
        status,
        email,
        link,
        no,
        JSON.stringify(sub_action), // แปลง Array of Objects เป็น JSON
      ];
    }

    const result = await query(querrydata, values);

    res.status(201).json({ message: "Data added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding data" });
  }
});

router.put("/smart_collaboration_task/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { subaction } = req.body;
    console.log(subaction);
    if (!subaction) {
      return res.status(400).json({ error: "Missing subaction data" });
    }

    const subActionJson = JSON.stringify(subaction); // แปลง Array of Objects เป็น JSON
    const result = await query(
      `UPDATE smart_project_task
       SET sub_action = $1
       WHERE id = $2`,
      [subActionJson, id]
    );

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});

module.exports = router;
