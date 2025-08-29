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
      body: JSON.stringify({ username, password})
    });

    if (response.ok) {
      const data = await response.json();
      // 登录成功后保存 token 或用户信息
      localStorage.setItem("token", data.token);
	  localStorage.setItem("user_id",data.userId);
	  
	  localStorage.setItem("user_name",username);
	  console.log(username);
	  
      alert("登录成功！");
	     // 根据角色跳转到不同页面
	     if (data.role == "customer") {
	         window.location.href = "../home/home.html"; // 顾客主页
	     } 
	     else if (data.role == "rider") {
	         window.location.href = "../rider_home/rider_home.html"; // 骑手主页
	     } 
	     else if (data.role == "admin") {
	         window.location.href = "admin_home.html"; // 管理员主页
	     }
		 else if (data.role == "owner") {
		     window.location.href = "../owner_home/owner_home.html"; // 管理员主页
		 }
	     else {
	         console.warn("未知或未设置的用户角色:", data.role);
	                        // 不跳转，显示错误信息
	                        alert("用户角色未定义，请联系管理员");
	                        // 或者停留在登录页面
	                        // 清空输入框等操作
	                        document.getElementById("username").value = "";
	                        document.getElementById("password").value = "";
	     }
      
    } else {
      document.getElementById("errorMsg").innerText = "用户名或密码错误";
    }
  } catch (error) {
    console.error(error);
    document.getElementById("errorMsg").innerText = "服务器连接失败";
  }
});
