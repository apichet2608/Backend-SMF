-- WITH MaxRoundPerKey AS (
--     SELECT
--         r.key_id,
--         MAX(r.round) AS max_round
--     FROM
--         public.smart_qa_aql_header h
--     JOIN
--         public.smart_qa_aql_record r
--     ON
--         h.un_id = r.key_id
--         AND h."type" = $1
--         AND h.process = $2
--         AND (r.status  IN ('ACCEPT', 'GOOD', 'Good', 'Accept', 'good', 'accept') AND r.status is NOT NULL)
--     GROUP BY
--         r.key_id
-- )

-- SELECT
--     h.process,
--     h."type",
--     r.status,
--     COUNT(r.status) AS result_count_status
-- FROM
--     public.smart_qa_aql_header h
-- JOIN
--     public.smart_qa_aql_record r
-- ON
--     h.un_id = r.key_id
--     AND h."type" = $1
--     AND h.process = $2
--     AND r.round = (SELECT max_round FROM MaxRoundPerKey WHERE key_id = r.key_id)
-- GROUP BY
--     h.process,
--     h."type",
--     r.status

-- UNION ALL

-- SELECT
--     h.process,
--     h."type",
--     'Total' AS status,
--     COUNT(r.status) AS result_count_status
-- FROM
--     public.smart_qa_aql_header h
-- JOIN
--     public.smart_qa_aql_record r
-- ON
--     h.un_id = r.key_id
--     AND h."type" = $1
--     AND h.process = $2
--     AND r.round = (SELECT max_round FROM MaxRoundPerKey WHERE key_id = r.key_id)
-- GROUP BY
--     h.process,
--     h."type";


------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

-- WITH MaxRoundPerKey AS (
--     SELECT
--         r.key_id,
--         MAX(r.round) AS max_round
--     FROM
--         public.smart_qa_aql_header h
--     JOIN
--         public.smart_qa_aql_record r
--     ON
--         h.un_id = r.key_id
--         AND h."type" = $1
--         AND h.process = $2
--     GROUP BY
--         r.key_id
-- )

-- SELECT
--     h.un_id,
--     r.key_id,
--     h.process,
--     h."type",
--     r.id,
--     r.date_time::timestamp,
--     r.round,
--     r.qa_code,
--     r.qa_shift,
--     r.qa_head,
--     r.total_rej,
--     r.status,
--     r.rootcause,
--     r.corrective,
--     r.preventive,
--     r.result_res,
--     r.eff_date,
--     r.action_by,
--     r.approve_by,
--     r.sub_total_rej
-- FROM
--     public.smart_qa_aql_header h
-- JOIN
--     public.smart_qa_aql_record r
-- ON
--     h.un_id = r.key_id
--     AND h."type" = $1
--     AND h.process = $2
-- --    AND (r.status NOT IN ('ACCEPT', 'GOOD', 'Good', 'Accept', 'good', 'accept') OR r.status IS NULL)
--     AND r.round = (SELECT max_round FROM MaxRoundPerKey WHERE key_id = r.key_id);

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

-- WITH MaxRoundPerKey AS (
--     SELECT
--         r.key_id,
--         MAX(r.round) AS max_round
--     FROM
--         public.smart_qa_aql_header h
--     JOIN
--         public.smart_qa_aql_record r
--     ON
--         h.un_id = r.key_id
--         AND h."type" = $1
--         AND h.process = $2
--     GROUP BY
--         r.key_id
-- )

-- SELECT
--     h.process,
--     h."type",
--     r.status,
--     COUNT(r.status) AS result_count_status
-- FROM
--     public.smart_qa_aql_header h
-- JOIN
--     public.smart_qa_aql_record r
-- ON
--     h.un_id = r.key_id
--     AND h."type" = $1
--     AND h.process = $2
--     AND r.round = (SELECT max_round FROM MaxRoundPerKey WHERE key_id = r.key_id)
-- GROUP BY
--     h.process,
--     h."type",
--     r.status;

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

-- WITH MaxRoundData AS (
--   SELECT
--       key_id,
--       status,
--       MAX(round) AS max_round
--   FROM
--       (
--       SELECT
--           h.un_id,
--           r.key_id,
--           h.process,
--           h."type",
--           r.id,
--           r.date_time,
--           r.round,
--           r.qa_code,
--           r.qa_shift,
--           r.qa_head,
--           r.total_rej,
--           r.status,
--           r.rootcause,
--           r.corrective,
--           r.preventive,
--           r.result_res,
--           r.eff_date,
--           r.action_by,
--           r.approve_by,
--           r.sub_total_rej
--       FROM
--           public.smart_qa_aql_header h
--       JOIN
--           public.smart_qa_aql_record r
--       ON
--           h.un_id = r.key_id
--           AND h."type" = 'VISUAL'
--           AND h.process = 'EFPC'
-- --          AND r.status != 'ACCEPT' AND r.status != 'GOOD'  AND r.status != 'Good'  AND r.status != 'Accept'AND r.status != 'good'  AND r.status != 'accept'
--       ) subquery
--   GROUP BY
--       key_id,
--       status
-- )
-- SELECT
--   md.key_id,
--   md.status,
--   md.max_round
-- FROM
--   MaxRoundData md
-- INNER JOIN (
--   SELECT
--       key_id,
--       MAX(max_round) AS max_max_round
--   FROM
--       MaxRoundData
--   GROUP BY
--       key_id
-- ) max_max_rounds
-- ON
--   md.key_id = max_max_rounds.key_id
--   AND md.max_round = max_max_rounds.max_max_round;

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

-- WITH MaxRoundPerKey AS (
--     SELECT
--         r.key_id,
--         MAX(r.round) AS max_round
--     FROM
--         public.smart_qa_aql_header h
--     JOIN
--         public.smart_qa_aql_record r
--     ON
--         h.un_id = r.key_id
--         AND h."type" = $1
--         AND h.process = $2
--     GROUP BY
--         r.key_id
-- )

-- SELECT
--     h.un_id,
--     r.key_id,
--     h.process,
--     h."type",
--     r.id,
--     r.date_time,
--     r.round,
--     r.qa_code,
--     r.qa_shift,
--     r.qa_head,
--     r.total_rej,
--     r.status,
--     r.rootcause,
--     r.corrective,
--     r.preventive,
--     r.result_res,
--     r.eff_date,
--     r.action_by,
--     r.approve_by,
--     r.sub_total_rej
-- FROM
--     public.smart_qa_aql_header h
-- JOIN
--     public.smart_qa_aql_record r
-- ON
--     h.un_id = r.key_id
--     AND h."type" = $1
--     AND h.process = $2
--     AND (r.status NOT IN ('ACCEPT', 'GOOD', 'Good', 'Accept', 'good', 'accept') OR r.status IS NULL)
--     AND r.round = (SELECT max_round FROM MaxRoundPerKey WHERE key_id = r.key_id);












