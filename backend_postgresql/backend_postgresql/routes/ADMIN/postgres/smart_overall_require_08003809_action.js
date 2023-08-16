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

// DELETE route to delete data
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `delete
      from
        smart_overall_require_08003809
      where
        id = $1;
        `,
      [id]
    );

    res.status(200).json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while deleting data" });
  }
});

// UPDATE route to UPDATE data
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      no,
      aspects,
      sub_no,
      aspect,
      sub_sub_no,
      request,
      score,
      description_proof,
      done,
      total,
      update_by,
      fjk_comment,
      dept_concern,
      email,
    } = req.body;

    const result = await query(
      `UPDATE smart_overall_require_08003809
       SET
         "no" = $1,
         aspects = $2,
         sub_no = $3,
         aspect = $4,
         sub_sub_no = $5,
         request = $6,
         score = $7,
         description_proof = $8,
         done = $9,
         total = $10,
         update_by = $11,
         fjk_comment = $12,
         dept_concern = $13,
         email = $14,
         update_date = now()
       WHERE id = $15`,
      [
        no,
        aspects,
        sub_no,
        aspect,
        sub_sub_no,
        request,
        score,
        description_proof,
        done,
        total,
        update_by,
        fjk_comment,
        dept_concern,
        email,
        id,
      ]
    );

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      no,
      aspects,
      this_years_target,
      sub_sub_no,
      improvement,
      update,
      status,
      check_point,
      link,
    } = req.body;

    const result = await query(
      `INSERT INTO smart_overall_require_08003809_action
      ("no",
      aspects,
      this_years_target,
      sub_sub_no,
      improvement,
      "update",
      status,
      check_point,
      link)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        no,
        aspects,
        this_years_target,
        sub_sub_no,
        improvement,
        update,
        status,
        check_point,
        link,
      ]
    );

    // Update this_years_target to 0 where aspects matches
    const updateResult = await query(
      `UPDATE smart_overall_require_08003809_action
       SET this_years_target = $1
       WHERE aspects = $2`,
      [this_years_target, aspects]
    );

    res.status(201).json({ message: "Data added and updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding data" });
  }
});

//Page2
router.get("/page2/table", async (req, res) => {
  try {
    const queryStr = `
    -- ข้อมูลปกติที่มีในต้นแบบ SQL ของคุณ
    SELECT
        row_number() over () as id,
        t2.no,
        t2.aspects,
        t1.this_years_target,
        t2.count,
        t2.score_1_count,
        t2.score_0_count,
        t2.score_1_percentage,
        t2.score_0_percentage
    FROM (
        SELECT
            no,
            aspects,
            this_years_target
        FROM
            public.smart_overall_require_08003809_action
        GROUP BY
            no,
            aspects,
            this_years_target
    ) t1
    JOIN (
        SELECT
            no,
            aspects,
            COUNT(*) as count,
            SUM(CASE WHEN score > 0 THEN score ELSE 0 END) as score_1_count,
            SUM(CASE WHEN score = 0 THEN 1 ELSE 0 END) as score_0_count,
            (SUM(CASE WHEN score > 0 THEN score ELSE 0 END) * 100.0) / COUNT(*) as score_1_percentage,
            (SUM(CASE WHEN score = 0 THEN 1 ELSE 0 END) * 100.0) / COUNT(*) as score_0_percentage
        FROM
            public.smart_overall_require_08003809
        GROUP BY
            no,
            aspects
    ) t2 ON t1.no = t2.no AND t1.aspects = t2.aspects
    
    UNION ALL
    
    -- แถวที่มีชื่อ "total" และคำนวณค่ารวม
    SELECT
        count(*)+1 as id,
        count(*)+1 as no,
        'total' as aspects,
        SUM(t1.this_years_target) / COUNT(*) as this_years_target,
        SUM(t2.count) as count,
        SUM(t2.score_1_count) as score_1_count,
        SUM(t2.score_0_count) as score_0_count,
        (SUM(t2.score_1_count) * 100.0) / SUM(t2.count) as score_1_percentage,
        (SUM(t2.score_0_count) * 100.0) / SUM(t2.count) as score_0_percentage
    FROM (
        SELECT
            no,
            aspects,
            COUNT(*) as count,
            SUM(CASE WHEN score > 0 THEN score ELSE 0 END) as score_1_count,
            SUM(CASE WHEN score = 0 THEN 1 ELSE 0 END) as score_0_count
        FROM
            public.smart_overall_require_08003809
        GROUP BY
            no,
            aspects
    ) t2
    JOIN (
        SELECT
            no,
            aspects,
            this_years_target
        FROM
            public.smart_overall_require_08003809_action
        GROUP BY
            no,
            aspects,
            this_years_target
    ) t1 ON t1.no = t2.no AND t1.aspects = t2.aspects
    
    ORDER BY
        no ASC, aspects DESC; -- เรียงลำดับตามเลขที่และชื่อ aspects    
    `;

    const result = await query(queryStr);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

router.get("/page2/tableaction", async (req, res) => {
  try {
    const { aspects } = req.query;

    let queryStr = `
    select
     *
    from
      public.smart_overall_require_08003809_action
    `;

    let queryParams = [];

    if (aspects !== "total") {
      queryStr += `
        where
          aspects = $1
      `;
      queryParams.push(aspects);
    }

    queryStr += `
    order by no asc
    `;

    const result = await query(queryStr, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

module.exports = router;
