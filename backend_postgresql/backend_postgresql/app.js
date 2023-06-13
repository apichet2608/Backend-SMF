const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const compression = require("compression"); // นำเข้า compression

const { Pool } = require("pg");
const pool = new Pool({
  host: "10.17.71.57",
  port: 5432,
  user: "postgres",
  password: "fujikura",
  database: "smart_factory", // แทนที่ด้วยชื่อฐานข้อมูลของคุณ
});

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const customRouter = require("./routes/10.17.71.57/10.17.71.57-smart_factory/smf-aoi");
const smt_aoi = require("./routes/10.17.71.57/10.17.71.57-smart_factory/smt-aoi");
const jwdb_r23662_actv = require("./routes/10.17.71.21/10.17.71.21-postgres/jwdb_r23662_actv");
const smart_mil_common = require("./routes/ADMIN/postgres/smart_mil_common");
const smart_enviro_cleanroomparticle = require("./routes/10.17.71.57/10.17.71.57-smart_factory/smart_enviro_cleanroomparticle");
const ok2s = require("./routes/ADMIN/postgres/smart-ok2s");
const foxsystem_json_backup_header_ok = require("./routes/ADMIN/postgres/foxsystem_json_backup_header_ok");
const foxsystem_json_backup_header_summary = require("./routes/ADMIN/postgres/foxsystem_json_backup_header_summary");
const foxsystem_json_backup_header_defect = require("./routes/ADMIN/postgres/foxsystem_json_backup_header_defect");
const smart_oee_overall = require("./routes/10.17.66.230/postgres/smart_oee_overall");
const fin_ost_reject_day = require("./routes/10.17.66.230/postgres/fin_ost_reject");
const jwdb_rdflv_mck_actv = require("./routes/10.17.71.21/10.17.71.21-postgres/jwdb_rdflv_mck_actv");
const jwdb_rdfl_mck_actv = require("./routes/10.17.71.21/10.17.71.21-postgres/jwdb_rdfl_mck_actv");
const jwdb_rdflv_gro_up_actv = require("./routes/10.17.71.21/10.17.71.21-postgres/jwdb_rdflv_gro_up_actv");
const jwdb_rexp_two_line = require("./routes/10.17.71.21/10.17.71.21-arduino_iot_project/jwdb_rexp_two_line");
const jwdb_rlse_beac = require("./routes/10.17.71.21/10.17.71.21-arduino_iot_project/jwdb_rlse_beac");
const jwdb_rcur_b = require("./routes/10.17.71.21/10.17.71.21-arduino_iot_project/jwdb_rcur_b");
const jwdb_rcll = require("./routes/10.17.71.21/10.17.71.21-arduino_iot_project/jwdb_rcll");
const elgop_mto_ni = require("./routes/10.17.71.57/10.17.71.57-smart_factory/elgop_mto_ni");

const app = express();

// app.use(compression()); // ใช้งาน compression middleware
app.use(cors());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/custom", customRouter);
app.use("/smt-aoi", smt_aoi);
app.use("/jwdb_r23662_actv", jwdb_r23662_actv);
app.use("/api/smart-mil-common", smart_mil_common);
app.use("/api/smart_enviro_cleanroomparticle", smart_enviro_cleanroomparticle);
app.use("/api/smart-ok2s", ok2s);
app.use(
  "/api/foxsystem_json_backup_header_ok",
  foxsystem_json_backup_header_ok
);
app.use(
  "/api/foxsystem_json_backup_header_summary",
  foxsystem_json_backup_header_summary
);
app.use(
  "/api/foxsystem_json_backup_header_defect",
  foxsystem_json_backup_header_defect
);
app.use("/api/smart_oee_overall", smart_oee_overall);
app.use("/api/fin_ost_reject", fin_ost_reject_day);
app.use("/api/jwdb_rdflv_mck_actv", jwdb_rdflv_mck_actv);
app.use("/api/jwdb_rdfl_mck_actv", jwdb_rdfl_mck_actv);
app.use("/api/jwdb_rdflv_gro_up_actv", jwdb_rdflv_gro_up_actv);
app.use("/api/jwdb_rexp_two_line", jwdb_rexp_two_line);
app.use("/api/jwdb_rlse_beac", jwdb_rlse_beac);
app.use("/api/jwdb_rcur_b", jwdb_rcur_b);
app.use("/api/jwdb_rcll", jwdb_rcll);
app.use("/api/elgop_mto_ni", elgop_mto_ni);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
