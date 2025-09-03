// const userId = localStorage.getItem('user_id');
//     if (!userId) {
//         showError('用户未登录，请先登录');
//         window.location.href = '../login/login.html';
//         return;
//     };
// 显示错误信息
function showError(message) {
  alert(message);
  console.error(message);
}

// 页面加载时执行
document.addEventListener('DOMContentLoaded', function() {
  // 检查用户登录状态
  // const user = JSON.parse(localStorage.getItem("user"));
  // if (user) {
  //   document.getElementById("username").innerText = user.username;
  //   // 加载初始数据
    const username = localStorage.getItem('user_name');
	console.log("加载到home界面的username为"+username);
	document.getElementById('username').textContent = username || '游客';
    loadRestaurants();
    loadCurrentOrders();
    loadHistoryOrders();
  // } else {
  //   window.location.href = "index.html";
  // }
});

// 切换标签页
function switchTab(tabName) {
  // 隐藏所有标签内容
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // 取消所有标签的激活状态
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // 显示选中的标签内容
  document.getElementById(tabName).classList.add('active');
  
  // 激活选中的标签
  event.currentTarget.classList.add('active');
  
  // 根据需要刷新数据
  if (tabName === 'orders') {
    loadCurrentOrders();
  } else if (tabName === 'history') {
    loadHistoryOrders();
  }
}

// 加载餐馆列表
async function loadRestaurants() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
	console.log("开始加载餐馆数据")
    const response = await fetch('http://localhost:8080/api/restaurants', {
      headers: {
        // 'Authorization': `Bearer ${user.token}`
      }
    });
    
    if (response.ok) {
      const restaurants = await response.json();
	  console.log("raaaa"+restaurants);
	  console.log("是否是数组:", Array.isArray(restaurants.data));
	  // const result = await response.json();
	  // console.log("完整的API响应:", result);
	  // console.log("响应类型:", typeof result);
	  // console.log("是否是数组:", Array.isArray(result));
	  
	  // // 查看对象的所有键
	  // if (result && typeof result === 'object') {
	  //   console.log("对象的键:", Object.keys(result));
	  // }
	  console.log("aaaarrr"+restaurants.data)
      displayRestaurants(restaurants.data);
    } else {
      console.error('获取餐馆列表失败');
    }
  } catch (error) {
    console.error('加载餐馆时出错:', error);
	console.log("aaaab"+getMockRestaurants())
    // 使用模拟数据作为后备
    displayRestaurants(getMockRestaurants());
  }
}

// 显示餐馆列表
// 显示餐馆列表
// 显示餐馆列表
async function displayRestaurants(restaurants) {
  const restaurantGrid = document.querySelector('.restaurant-grid');
  restaurantGrid.innerHTML = '';
  
  // 批量获取所有餐馆的评分
  const restaurantRatings = await getRestaurantsAverageRatings(restaurants);
  
  restaurants.forEach(restaurant => {
    const card = document.createElement('div');
    card.className = 'restaurant-card';
    
    card.onclick = () => viewRestaurant(restaurant.restaurantId);
    
    // 获取该餐馆的平均评分
    const averageRating = restaurantRatings[restaurant.restaurantId] || 0;
    
    // 构建图片HTML
    const imageHtml = restaurant.src 
      ? `<img src="http://localhost:8080${restaurant.src}" alt="${restaurant.name}" class="restaurant-image">`
      : `<div class="restaurant-image"><i class="fas fa-utensils fa-3x"></i></div>`;
    
    card.innerHTML = `
      ${imageHtml}
      <div class="restaurant-info">
        <div class="restaurant-name">${restaurant.name}</div>
        <div class="restaurant-meta">
          <span class="rating">${getStarRating(averageRating)} </span>
        </div>
        <button class="btn btn-primary">进入点餐</button>
      </div>
    `;
    
    restaurantGrid.appendChild(card);
  });
}

// 批量获取所有餐馆的平均评分
async function getRestaurantsAverageRatings(restaurants) {
  const ratings = {};
  
  // 使用 Promise.all 并行获取所有评分
  const ratingPromises = restaurants.map(async (restaurant) => {
    try {
      const response = await fetch(`http://localhost:8080/api/reviews/target/restaurant/${restaurant.restaurantId}`);
      
      if (response.ok) {
        const result = await response.json();
        const reviews = result.data || [];
        
        if (reviews.length > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          ratings[restaurant.restaurantId] = totalRating / reviews.length;
        } else {
          ratings[restaurant.restaurantId] = 0;
        }
      }
    } catch (error) {
      console.error(`获取餐馆 ${restaurant.restaurantId} 评分失败:`, error);
      ratings[restaurant.restaurantId] = 0;
    }
  });
  
  await Promise.all(ratingPromises);
  return ratings;
}
// 加载当前订单
async function loadCurrentOrders() {
  try {
	  const userId = localStorage.getItem('user_id');
	  if (!userId) {
	      showError('用户未登录，请先登录');
	      window.location.href = '../login/login.html';
	      return;
	  };

	
   const response = await fetch(`http://localhost:8080/api/orders/customer/${userId}/current`, {
     headers: {
       // 'Authorization': `Bearer ${user.token}`
     }
    });
	
	 // const rawResponse = await response.text();
	 //    console.log('原始响应文本:', rawResponse); // 这里可以看到有问题的JSON
	if (response.ok) {
	  console.log("开始打印数据1111111");
	  const orders = await response.json();
	  console.log("完整响应:", orders.data); // 打印完整响应
	  
	  displayCurrentOrders(orders.data);
	} else {
	  console.error("请求失败:", response.status);
	}
    
   //  if (response.ok) {
	  //  console.log("开始打印数据1111111");
   //    const orders = await response.json();
	  // console.log("aaaaabbbbbcccc"+JSON.stringify(orders.data))
   //    displayCurrentOrders(orders);
   //  } else {
   //    console.error('获取当前订单失败');
   //  }
  } catch (error) {
    console.error('加载订单时出错:', error);
    // 使用模拟数据作为后备
    displayCurrentOrders(getMockCurrentOrders());
  }
}
// 显示当前订单
function displayCurrentOrders(orders) {
  const ordersContainer = document.querySelector('.orders-container');
  ordersContainer.innerHTML = '';
  
  if (!orders || orders.length === 0) {
    ordersContainer.innerHTML = '<p class="no-orders">暂无进行中的订单</p>';
    return;
  }
  
  orders.forEach(order => {
    const orderCard = document.createElement('div');
    orderCard.className = 'order-card';
	const totalItemCount = (order.items && order.items.length > 0) 
	  ? order.items.reduce((total, item) => total + (item.quantity || 0), 0) 
	  : order.itemCount || 0;
    
    orderCard.innerHTML = `
      <div class="order-header">
        <div class="order-id">订单号: #${order.orderId}</div>
        <div class="order-status status-${order.status}">${getStatusText(order.status)}</div>
      </div>
      <div class="order-details">
        <div class="order-restaurant">${order.restaurantName}</div>
        <div class="order-items">${totalItemCount}件商品</div>
        <div class="order-price">¥${order.totalPrice.toFixed(2)}</div>
      </div>
    `;
    
    ordersContainer.appendChild(orderCard);
  });
}

// 加载历史订单
async function loadHistoryOrders() {
  try {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
        showError('用户未登录，请先登录');
        window.location.href = '../login/login.html';
        return;
    };
    const timeRange = document.getElementById('timeRange').value;
    const restaurantFilter = document.getElementById('restaurantFilter').value;
    
    // 加载餐厅列表到下拉框
    await loadRestaurantsToFilter();
    
    const response = await fetch(
      `http://localhost:8080/api/orders/customer/${userId}/history`, 
      {
        headers: {
          // 'Authorization': `Bearer ${user.token}`
        }
      }
    );
    
    if (response.ok) {
      const orders = await response.json();
      // 应用筛选条件
      const filteredOrders = applyFilters(orders.data, timeRange, restaurantFilter);
      displayHistoryOrders(filteredOrders);
    } else {
      console.error('获取历史订单失败');
    }
  } catch (error) {
    console.error('加载历史订单时出错:', error);
    // 使用模拟数据作为后备
    const timeRange = document.getElementById('timeRange').value;
    const restaurantFilter = document.getElementById('restaurantFilter').value;
    await loadRestaurantsToFilter();
    const mockOrders = getMockHistoryOrders();
    const filteredOrders = applyFilters(mockOrders, timeRange, restaurantFilter);
    displayHistoryOrders(filteredOrders);
  }
}

// 加载餐厅列表到筛选下拉框
async function loadRestaurantsToFilter() {
  try {
    const restaurantSelect = document.getElementById('restaurantFilter');
    // 清空现有选项（保留第一个"所有餐厅"选项）
    while (restaurantSelect.options.length > 1) {
      restaurantSelect.remove(1);
    }
    
    const response = await fetch('http://localhost:8080/api/restaurants');
    
    if (response.ok) {
      const restaurants = await response.json();
      // 添加餐厅选项
      restaurants.data.forEach(restaurant => {
        const option = document.createElement('option');
        option.value = restaurant.restaurantId;
        option.textContent = restaurant.name;
        restaurantSelect.appendChild(option);
      });
    } else {
      console.error('获取餐厅列表失败');
      // 使用模拟数据
      const mockRestaurants = getMockRestaurants();
      mockRestaurants.forEach(restaurant => {
        const option = document.createElement('option');
        option.value = restaurant.id;
        option.textContent = restaurant.name;
        restaurantSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('加载餐厅筛选列表时出错:', error);
  }
}

// 应用筛选条件
function applyFilters(orders, timeRange, restaurantFilter) {
  let filtered = [...orders];
  console.log("这次的餐馆数据为: ", JSON.stringify(orders, null, 2));

  // 应用时间范围筛选
  if (timeRange) {
    const months = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    console.log("时间筛选：过去", months, "个月，截止日期=", cutoffDate.toISOString());

    filtered = filtered.filter(order => {
      const orderDate = new Date(order.createTime || order.orderTime);
      console.log("订单时间=", order.createTime || order.orderTime, " => ", orderDate.toISOString());
      return orderDate >= cutoffDate;
    });
  }

  // 应用餐厅筛选
  if (restaurantFilter && restaurantFilter !== 'all') {
    console.log("筛选餐馆条件: ", restaurantFilter, " (类型=", typeof restaurantFilter, ")");
    filtered = filtered.filter(order => {
      console.log("检查订单: restaurantId=", order.restaurantId, 
                  "(类型=", typeof order.restaurantId, ")",
                  " restaurantName=", order.restaurantName,
                  " vs 过滤条件=", restaurantFilter);

      return order.restaurantId == restaurantFilter || order.restaurantName == restaurantFilter;
    });
  }

  console.log("最终筛选结果数量: ", filtered.length);
  return filtered;
}


// 显示历史订单
function displayHistoryOrders(orders) {
  const historyContainer = document.querySelector('.history-container');
  historyContainer.innerHTML = '';
  
  if (orders.length === 0) {
    historyContainer.innerHTML = '<p class="no-orders">暂无历史订单</p>';
    return;
  }
  
  orders.forEach(order => {
    const orderCard = document.createElement('div');
    orderCard.className = 'order-card';
	const totalItemCount = order.items.reduce((total, item) => total + item.quantity, 0);
    
    orderCard.innerHTML = `
      <div class="order-header">
        <div class="order-id">订单号: #${order.orderId}</div>
        <div class="order-status status-${order.status}">${getStatusText(order.status)}</div>
      </div>
      <div class="order-details">
        <div class="order-restaurant">${order.restaurantName}</div>
        <div class="order-items">${totalItemCount}件商品</div>
        <div class="order-price">¥${order.totalPrice.toFixed(2)}</div>
      </div>
      <div class="order-time">下单时间: ${formatDate(order.createTime)}</div>
    `;
    
    historyContainer.appendChild(orderCard);
  });
}

// 筛选历史订单
function filterHistory() {
  loadHistoryOrders();
}

// 查看餐馆详情
function viewRestaurant(restaurantId) {
  // console.log("本次跳转订单id"+restaurantId)
  window.location.href = `../restaurant-detail/restaurant-detail.html?id=${restaurantId}`;
}

// 退出登录
function logout() {
  localStorage.removeItem("user_id");
  localStorage.removeItem("user_name");
  window.location.href = "../login/login.html";
}

// 辅助函数 - 获取星级评分显示
function getStarRating(rating) {
  // 添加默认值处理
  const safeRating = rating || 0; // 如果 rating 是 undefined/null，使用 0
  
  const fullStars = Math.floor(safeRating);
  const halfStar = safeRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  return '★'.repeat(fullStars) + (halfStar ? '☆' : '') + '☆'.repeat(emptyStars) + ' ' + safeRating.toFixed(1);
}

// 辅助函数 - 获取订单状态文本
function getStatusText(status) {
  const statusMap = {
    'CREATED': '已创建',
    'ACCEPTED': '骑手已接单',
    'DELIVERING': '配送中',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消'
  };
  
  return statusMap[status] || status;
}

// 辅助函数 - 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// 模拟数据函数（在实际应用中应删除）
function getMockRestaurants() {
  return [
    { id: 1, name: "美味汉堡店", rating: 4.5, minOrderPrice: 20 },
    { id: 2, name: "意式披萨坊", rating: 4.8, minOrderPrice: 30 },
    { id: 3, name: "香香炸鸡店", rating: 4.3, minOrderPrice: 25 },
    { id: 4, name: "甜蜜甜品屋", rating: 4.6, minOrderPrice: 15 }
  ];
}

function getMockCurrentOrders() {
  return [
    { id: 123456, status: "delivering", restaurantName: "美味汉堡店", itemCount: 3, totalPrice: 68.00 },
    { id: 123455, status: "accepted", restaurantName: "意式披萨坊", itemCount: 2, totalPrice: 89.00 }
  ];
}

function getMockHistoryOrders() {
  // 生成过去6个月内的随机日期
  function getRandomDateInMonths(months) {
    const now = new Date();
    const pastDate = new Date();
    pastDate.setMonth(now.getMonth() - months);
    
    // 生成两个日期之间的随机日期
    const randomTime = pastDate.getTime() + Math.random() * (now.getTime() - pastDate.getTime());
    return new Date(randomTime);
  }
  
  // 格式化日期为ISO字符串
  function formatDate(date) {
    return date.toISOString();
  }
  
  // 模拟历史订单数据，包含不同时间和餐厅的订单
  return [
    { 
      id: 123454, 
      restaurantId: 1, // 对应美味汉堡店
      status: "completed", 
      restaurantName: "美味汉堡店", 
      items: [{quantity: 2}, {quantity: 1}], // 用于计算商品总数
      totalPrice: 45.00, 
      createTime: formatDate(getRandomDateInMonths(1)) // 最近一个月
    },
    { 
      id: 123455, 
      restaurantId: 2, // 对应意式披萨坊
      status: "completed", 
      restaurantName: "意式披萨坊", 
      items: [{quantity: 1}], 
      totalPrice: 38.00, 
      createTime: formatDate(getRandomDateInMonths(2)) // 最近两个月内
    },
    { 
      id: 123456, 
      restaurantId: 3, // 对应香香炸鸡店
      status: "completed", 
      restaurantName: "香香炸鸡店", 
      items: [{quantity: 2}], 
      totalPrice: 52.00, 
      createTime: formatDate(getRandomDateInMonths(3)) // 最近三个月内
    },
    { 
      id: 123457, 
      restaurantId: 4, // 对应甜蜜甜品屋
      status: "completed", 
      restaurantName: "甜蜜甜品屋", 
      items: [{quantity: 3}], 
      totalPrice: 28.00, 
      createTime: formatDate(getRandomDateInMonths(5)) // 最近五个月内
    }
  ];
}