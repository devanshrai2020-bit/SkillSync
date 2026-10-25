
const API_BASE_URL = "http://YOUR-EC2-PUBLIC-IP:3000";

function login() {
  const role = document.getElementById("role").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, role })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      localStorage.setItem("user", username);
      localStorage.setItem("role", role);
      window.location.href = role + ".html";
    } else {
      document.getElementById("msg").innerText = "Invalid credentials";
    }
  })
  .catch(error => {
    console.error("Login error:", error);
    document.getElementById("msg").innerText =
      "Unable to connect to the server. Please try again.";
  });
}
