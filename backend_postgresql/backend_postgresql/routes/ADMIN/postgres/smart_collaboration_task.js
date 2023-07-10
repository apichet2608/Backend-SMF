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
    const { dept } = req.query;
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
				and dept = $1
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
				and dept = $1
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
				and dept = $1
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
				and dept = $1
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
where dept = $1
group by
	status
union all
    select
	'total' as status,
	COUNT(*) as count
from
	public.smart_project_task
where dept = $1
  ) subquery
order by
	order_by asc
    `,
      [dept]
    );
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
      queryStr = `
      select
	*
from
	public.smart_project_task
where dept = $1
order by "no" asc
      `;
      queryParams = [dept];
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
           "no" = $10
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
         "no"
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
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
         "no"
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
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
      ];
    }

    const result = await query(querrydata, values);

    res.status(201).json({ message: "Data added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding data" });
  }
});

module.exports = router;