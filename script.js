let jobs = [
  { company: "TCS", role: "System Engineer" },
  { company: "Infosys", role: "Specialist Programmer" },
  { company: "Zoho", role: "Full Stack Developer" }
];

function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (user !== "" && pass !== "") {
    document.getElementById("login").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
    loadJobs();
  } else {
    document.getElementById("loginMsg").innerText = "Invalid login details";
  }
}

function loadJobs() {
  const list = document.getElementById("jobList");
  list.innerHTML = "";

  jobs.forEach(job => {
    const li = document.createElement("li");
    li.innerText = job.company + " - " + job.role;
    list.appendChild(li);
  });
}