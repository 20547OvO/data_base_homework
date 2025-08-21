document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      const data = await response.json();
      // 登录成功后保存 token 或用户信息
      localStorage.setItem("token", data.token);
      alert("登录成功！");
      window.location.href = "home.html"; // 跳转主页
    } else {
      document.getElementById("errorMsg").innerText = "用户名或密码错误";
    }
  } catch (error) {
    console.error(error);
    document.getElementById("errorMsg").innerText = "服务器连接失败";
  }
});
