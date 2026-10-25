const express = require("express");
const cors = require("cors");
const { query, pool } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

function upperRows(rows) {
  return rows.map(row => Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key.toUpperCase(), value])
  ));
}
function sendError(res, err, fallback) {
  console.error(err);
  res.status(500).json(fallback);
}

/* LOGIN */
app.post("/login", async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const result = await query(
      "SELECT user_id FROM users WHERE username=$1 AND password=$2 AND role=$3",
      [username, password, role]
    );
    res.json({ success: result.rowCount > 0 });
  } catch (err) { sendError(res, err, { success: false }); }
});

/* PROFILE GET */
app.get("/student/profile/:username", async (req, res) => {
  try {
    const result = await query("SELECT * FROM users WHERE username=$1", [req.params.username]);
    res.json(upperRows(result.rows)[0] || null);
  } catch (err) { sendError(res, err, {}); }
});

/* PROFILE SAVE */
app.post("/student/profile", async (req, res) => {
  const d = req.body;
  try {
    await query(`UPDATE users SET
      full_name=$1, phone=$2, email=$3, linkedin=$4, github=$5,
      degree=$6, branch=$7, year=$8, cgpa=$9, tenth=$10, twelfth=$11, backlog=$12,
      skills=$13, softskills=$14, internships=$15, projects=$16, certifications=$17,
      location_pref=$18, relocate=$19, achievements=$20, hobbies=$21
      WHERE username=$22`,
    [
      d.full_name || "", d.phone || "", d.email || "", d.linkedin || "", d.github || "",
      d.degree || "", d.branch || "", Number(d.year) || null, Number(d.cgpa) || 0,
      Number(d.tenth) || 0, Number(d.twelfth) || 0, Number(d.backlog) || 0,
      d.skills || "", d.softskills || "", d.internships || "", d.projects || "",
      d.certifications || "", d.location_pref || "", d.relocate || "yes",
      d.achievements || "", d.hobbies || "", d.username || ""
    ]);
    res.json({ success: true });
  } catch (err) { sendError(res, err, { success: false }); }
});

/* GET JOBS */
app.get("/student/jobs/:username", async (req, res) => {
  try {
    const result = await query(`
      SELECT j.*, u.cgpa AS student_cgpa, u.skills AS student_skills,
             u.backlog AS student_backlog
      FROM jobs j JOIN users u ON u.username=$1
      WHERE NOT EXISTS (
        SELECT 1 FROM applications a
        WHERE a.job_id=j.job_id AND a.student_username=$1
      )`, [req.params.username]);
    const rows = upperRows(result.rows);
    const data = rows.map(r => {
      const studentSkills = (r.STUDENT_SKILLS || "").toLowerCase().split(",").map(s => s.trim());
      const jobSkills = (r.SKILLS || "").toLowerCase().split(",").map(s => s.trim()).filter(Boolean);
      const matched = jobSkills.filter(s => studentSkills.includes(s));
      const matchPercent = jobSkills.length ? Math.round(matched.length / jobSkills.length * 100) : 0;
      return {
        ...r, MATCH: matchPercent, MATCHED: matched.join(", "),
        ELIGIBLE: Number(r.STUDENT_CGPA || 0) >= Number(r.CGPA || 0) &&
          Number(r.STUDENT_BACKLOG || 0) <= Number(r.BACKLOGS || 0)
      };
    });
    res.json(data);
  } catch (err) { sendError(res, err, []); }
});

/* APPLY */
app.post("/student/apply", async (req, res) => {
  const { job_id, student_username } = req.body;
  try {
    const check = await query(
      "SELECT 1 FROM applications WHERE job_id=$1 AND student_username=$2",
      [Number(job_id), student_username]
    );
    if (check.rowCount) return res.json({ success: false, message: "Already applied" });
    await query(
      "INSERT INTO applications (job_id, student_username, status) VALUES ($1, $2, 'PENDING')",
      [Number(job_id), student_username]
    );
    res.json({ success: true });
  } catch (err) { sendError(res, err, { success: false }); }
});

/* STUDENT APPLICATIONS */
app.get("/student/applications/:username", async (req, res) => {
  try {
    const result = await query(`
      SELECT j.company_name, j.role, a.status
      FROM applications a JOIN jobs j ON a.job_id=j.job_id
      WHERE a.student_username=$1`, [req.params.username]);
    res.json(upperRows(result.rows));
  } catch (err) { sendError(res, err, []); }
});

/* COMPANY JOB POST */
app.post("/company/job", async (req, res) => {
  const d = req.body;
  try {
    await query(`INSERT INTO jobs
      (company_name, role, cgpa, branch, year, backlogs, stipend, description, skills, experience)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [d.company_name || "", d.role || "", Number(d.cgpa) || 0, d.branch || "",
     Number(d.year) || null, Number(d.backlogs) || 0, d.stipend || "",
     d.description || "", d.skills || "", d.experience || ""]);
    res.json({ success: true });
  } catch (err) { sendError(res, err, { success: false }); }
});

/* ADMIN STUDENTS */
app.get("/admin/students", async (req, res) => {
  try {
    const result = await query("SELECT * FROM users WHERE role='student'");
    res.json(upperRows(result.rows));
  } catch (err) { sendError(res, err, []); }
});

/* ADMIN JOBS */
app.get("/admin/jobs", async (req, res) => {
  try {
    const result = await query("SELECT * FROM jobs");
    res.json(upperRows(result.rows));
  } catch (err) { sendError(res, err, []); }
});

/* ADMIN APPLICATIONS WITH MATCH */
app.get("/admin/applications", async (req, res) => {
  try {
    const result = await query(`
      SELECT a.application_id, a.status, u.username, u.full_name, u.cgpa,
             u.skills AS student_skills, u.backlog, j.company_name, j.role,
             j.cgpa AS job_cgpa, j.skills AS job_skills
      FROM applications a
      JOIN users u ON a.student_username=u.username
      JOIN jobs j ON a.job_id=j.job_id`);
    const data = upperRows(result.rows).map(r => {
      const s = (r.STUDENT_SKILLS || "").toLowerCase().split(",").map(x => x.trim());
      const j = (r.JOB_SKILLS || "").toLowerCase().split(",").map(x => x.trim()).filter(Boolean);
      const matched = j.filter(skill => s.includes(skill));
      return {
        ...r,
        MATCH: j.length ? Math.round(matched.length / j.length * 100) : 0,
        MATCHED_SKILLS: matched.join(", "),
        ELIGIBLE: Number(r.CGPA || 0) >= Number(r.JOB_CGPA || 0) && Number(r.BACKLOG || 0) <= 0
      };
    });
    res.json(data);
  } catch (err) { sendError(res, err, []); }
});

app.delete("/admin/application/:id", async (req, res) => {
  try {
    await query("DELETE FROM applications WHERE application_id=$1", [Number(req.params.id)]);
    res.json({ success: true });
  } catch (err) { sendError(res, err, { success: false }); }
});

app.post("/admin/update", async (req, res) => {
  try {
    await query("UPDATE applications SET status=$1 WHERE application_id=$2",
      [req.body.status, Number(req.body.application_id)]);
    res.json({ success: true });
  } catch (err) { sendError(res, err, { success: false }); }
});

app.delete("/company/job/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM applications WHERE job_id=$1", [Number(req.params.id)]);
    await client.query("DELETE FROM jobs WHERE job_id=$1", [Number(req.params.id)]);
    await client.query("COMMIT");
    res.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    sendError(res, err, { success: false });
  } finally { client.release(); }
});

app.put("/company/job/:id", async (req, res) => {
  const d = req.body;
  try {
    await query(`UPDATE jobs SET role=$1, skills=$2, experience=$3, cgpa=$4
      WHERE job_id=$5`,
      [d.role || "", d.skills || "", d.experience || "", Number(d.cgpa) || 0, Number(req.params.id)]);
    res.json({ success: true });
  } catch (err) { sendError(res, err, { success: false }); }
});

app.get("/company/job/:id", async (req, res) => {
  try {
    const result = await query("SELECT * FROM jobs WHERE job_id=$1", [Number(req.params.id)]);
    res.json(upperRows(result.rows)[0] || null);
  } catch (err) { sendError(res, err, {}); }
});

app.get("/health", (req, res) => res.json({ ok: true }));

const port = Number(process.env.PORT || 3000);
app.listen(port, "0.0.0.0", () => console.log(`SkillSync API running on port ${port}`));
