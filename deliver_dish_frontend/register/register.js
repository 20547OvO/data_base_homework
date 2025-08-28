document.getElementById("registerForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("regUsername").value;
  const password = document.getElementById("regPassword").value;
  const role = document.getElementById("role").value;
   // 验证是否选择了角色
    if (!role) {
      document.getElementById("errorMsg").innerText = "请选择角色";
      return;
    }

  try {
    const response = await fetch("http://localhost:8080/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password,role })
    });

    const data = await response.json();
    document.getElementById("regMsg").innerText = data.message;

    if (data.success) {
      alert("注册成功，现在去登录");
      window.location.href = "../login/login.html";
    }
  } catch (error) {
    console.error(error);
    document.getElementById("regMsg").innerText = "服务器连接失败";
  }
});
