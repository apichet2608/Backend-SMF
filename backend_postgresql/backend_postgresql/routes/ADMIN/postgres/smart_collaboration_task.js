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
group by
	status
union all
    select
	'total' as status,
	COUNT(*) as count
from
	public.smart_project_task
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

router.get("/count-status-fixed", async (req, res) => {
  try {
    const { dri } = req.query;

    const result = await query(
      `
      SELECT
      status,
      count,
      CASE
        WHEN status = 'Finished' THEN (
          SELECT json_agg(json_build_object(
            'dri', dri,
            'status', status,
            'project',project
          ))
          FROM (
            SELECT dri, COUNT(*) AS status,
            project
            FROM public.smart_project_task
            WHERE status = 'Finished' AND dri = $1
            GROUP BY dri,project
          ) subquery
        )
        WHEN status = 'Ongoing' THEN (
          SELECT json_agg(json_build_object(
            'dri', dri,
            'status', status,
            'project',project
          ))
          FROM (
            SELECT dri, COUNT(*) AS status,
            project
            FROM public.smart_project_task
            WHERE status = 'Ongoing' AND dri = $1
            GROUP BY dri,project
          ) subquery
        )
        WHEN status = 'Open' THEN (
          SELECT json_agg(json_build_object(
            'dri', dri,
            'status', status,
            'project',project
          ))
          FROM (
            SELECT dri, COUNT(*) AS status,
            project
            FROM public.smart_project_task
            WHERE status = 'Open' AND dri = $1
            GROUP BY dri,project
          ) subquery
        )
        WHEN status = '' THEN (
          SELECT json_agg(json_build_object(
            'dri', dri,
            'status', status
          ))
          FROM (
            SELECT dri, COUNT(*) AS status
            FROM public.smart_project_task
            WHERE status = ''
            GROUP BY dri
          ) subquery
        )
        ELSE NULL
      END AS sum_month
    FROM (
      SELECT status, COUNT(*) AS count
      FROM public.smart_project_task
      WHERE dri = $1
      GROUP BY status
      UNION ALL
      SELECT 'total' AS status, COUNT(*) AS count
      FROM public.smart_project_task
      WHERE dri = $1
    ) subquery
    ORDER BY count DESC
      `,
      [dri]
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

    const result = await query(
      `INSERT INTO smart_project_task (
         dept,
         project,
         description,
         action,
         dri,
         plan_date,
         status,
         email,
         link
         no
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10)`,
      [dept, project, description, action, dri, plan_date, status, email, link]
    );

    res.status(201).json({ message: "Data added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding data" });
  }
});

module.exports = router;
