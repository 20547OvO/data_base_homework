// DOM 元素
const availableOrdersList = document.getElementById('availableOrdersList');
const myTasksList = document.getElementById('myTasksList');
const availableOrdersCount = document.getElementById('availableOrdersCount');
const myTasksCount = document.getElementById('myTasksCount');
const logoutBtn = document.getElementById('logoutBtn');
const riderName = document.getElementById('riderName');
const orderModal = document.getElementById('orderModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const closeModal = document.querySelector('.close');

// 订单数据
let availableOrders = [];
let myTasks = [];

// 初始化页面
async function initPage() {
    // 从localStorage获取骑手信息
    const riderId = localStorage.getItem('user_id');
    const token = localStorage.getItem('token');
    
    if (!riderId || !token) {
        alert('请先登录');
        window.location.href = '../login/login.html';
        return;
    }
    
    // 设置骑手名称
    riderName.textContent = `骑手ID: ${riderId}`;
    
    // 加载订单数据
    await loadOrders();
    
    // 添加事件监听器
    logoutBtn.addEventListener('click', handleLogout);
    closeModal.addEventListener('click', () => orderModal.style.display = 'none');
    
    // 点击模态框外部关闭
    window.addEventListener('click', (event) => {
        if (event.target === orderModal) {
            orderModal.style.display = 'none';
        }
    });
}

// 加载订单数据
async function loadOrders() {
    try {
        const riderId = localStorage.getItem('user_id');
		console.log("骑手订单为"+riderId);
        // const token = localStorage.getItem('token');
        
        // 加载可接订单 (状态为created的订单)
        const availableResponse = await fetch(`http://localhost:8080/api/orders/status/CREATED`, {
            headers: {
                // 'Authorization': `Bearer ${token}`
            }
        });
		//json循环嵌套问题，需要转换为dto
		let responseText = await availableResponse.text();
		console.log("不是哥们"+responseText)
		   if (availableResponse.ok) {
		        try {
		            const result = JSON.parse(responseText);
					console.log(result.data);
		            availableOrders = result.data || [];
		        } catch (e) {
		            console.error("解析响应失败:", e, "响应文本:", responseText);
		            availableOrders = [];
		        }
		   } else {
		        console.error("请求失败，状态码:", availableResponse.status, "响应文本:", responseText);
		        // 可以根据需要处理错误，比如抛出异常或设置默认值
		   }
        
   //      if (availableResponse.ok) {
			
			
   //          const result = await availableResponse.json();
   //          availableOrders = result.data || [];
   //      } else {
   //          console.error('获取可接订单失败:', availableResponse.status);
   //          availableOrders = [];
   //      }
        
        // 加载骑手已接订单 (骑手ID匹配且状态为accepted或delivering)
		console.log("执行到这了");
        const myTasksResponse = await fetch(`http://localhost:8080/api/orders/rider/${riderId}`, {
            headers: {
                // 'Authorization': `Bearer ${token}`
            }
        });
        
        if (myTasksResponse.ok) {
            const result = await myTasksResponse.json();
            myTasks = (result.data || []).filter(order => 
                order.status === 'ACCEPTED' || order.status === 'DELIVERING'
            );
        } else {
            console.error('获取骑手任务失败:', myTasksResponse.status);
            myTasks = [];
        }
        
        renderAvailableOrders();
        renderMyTasks();
    } catch (error) {
        console.error('加载订单时出错:', error);
        // 使用模拟数据作为后备
        availableOrders = getMockAvailableOrders();
        myTasks = getMockMyTasks();
        renderAvailableOrders();
        renderMyTasks();
    }
}

// 渲染可接订单
function renderAvailableOrders() {
    availableOrdersCount.textContent = `(${availableOrders.length})`;
    
    if(availableOrders.length === 0) {
        availableOrdersList.innerHTML = `
            <div class="empty-state">
                <i>📭📭</i>
                <p>暂无待接订单</p>
            </div>
        `;
        return;
    }
    
    availableOrdersList.innerHTML = availableOrders.map(order => `
        <div class="order-card" data-order-id="${order.orderId}">
            <div class="order-header">
                <span class="order-id">订单 #${order.orderId}</span>
                <span class="order-time">${formatDate(order.createdAt)}</span>
            </div>
            <div class="order-restaurant">${order.restaurantName}</div>
            <div class="order-detail">
                <span class="order-items">${getOrderItemsText(order.items)}</span>
                <span class="order-price">¥${order.totalPrice.toFixed(2)}</span>
            </div>
            <div class="order-address">📍 ${order.deliveryAddress}</div>
            <div class="order-actions">
                <button class="btn btn-accept" onclick="acceptOrder(${order.orderId})">接单</button>
                <button class="btn btn-details" onclick="showOrderDetails(${order.orderId}, 'available')">查看详情</button>
            </div>
        </div>
    `).join('');
}

// 渲染我的任务
function renderMyTasks() {
    myTasksCount.textContent = `(${myTasks.length})`;
    
    if(myTasks.length === 0) {
        myTasksList.innerHTML = `
            <div class="empty-state">
                <i>🚴🚴</i>
                <p>暂无进行中的任务</p>
                <p>快去接单吧！</p>
            </div>
        `;
        return;
    }
    
    myTasksList.innerHTML = myTasks.map(task => {
        let statusText, statusClass, actionButton;
		
        
        if(task.status === 'ACCEPTED') {
            statusText = '已接单';
            statusClass = 'status-accepted';
            actionButton = `<button class="btn btn-pickup" onclick="updateOrderStatus(${task.orderId}, 'DELIVERING')">取餐</button>`;
        } else if(task.status === 'DELIVERING') {
            statusText = '配送中';
            statusClass = 'status-delivering';
            actionButton = `<button class="btn btn-complete" onclick="updateOrderStatus(${task.orderId}, 'COMPLETED')">完成订单</button>`;
        } else {
            statusText = '已完成';
            statusClass = 'status-completed';
            actionButton = '';
        }
        
        return `
        <div class="order-card" data-order-id="${task.orderId}">
            <div class="order-header">
                <span class="order-id">订单 #${task.orderId} <span class="status-badge ${statusClass}">${statusText}</span></span>
                <span class="order-time">${formatDate(task.createdAt)}</span>
            </div>
            <div class="order-restaurant">${task.restaurantName}</div>
            <div class="order-detail">
                <span class="order-items">${getOrderItemsText(task.items)}</span>
                <span class="order-price">¥${task.totalPrice.toFixed(2)}</span>
            </div>
            <div class="order-address">📍 ${task.deliveryAddress}</div>
            <div class="order-actions">
                ${actionButton}
                <button class="btn btn-details" onclick="showOrderDetails(${task.orderId}, 'mytask')">查看详情</button>
            </div>
        </div>
        `;
    }).join('');
}

// 接单功能
async function acceptOrder(orderId) {
    try {
        const riderId = localStorage.getItem('user_id');
        const token = localStorage.getItem('token');
        
        // 调用API接单
        const response = await fetch(`http://localhost:8080/api/orders/${orderId}/status?status=ACCEPTED&riderId=${riderId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            // 从可接订单中移除
            const orderIndex = availableOrders.findIndex(order => order.orderId === orderId);
            if (orderIndex !== -1) {
                const acceptedOrder = availableOrders[orderIndex];
                acceptedOrder.status = 'ACCEPTED';
                // 添加到我的任务
                myTasks.push(acceptedOrder);
                availableOrders.splice(orderIndex, 1);
                
                // 更新UI
                renderAvailableOrders();
                renderMyTasks();
                
                alert(`已成功接单 #${orderId}`);
            }
        } else {
            const error = await response.json();
            alert(`接单失败: ${error.message || '未知错误'}`);
        }
    } catch (error) {
        console.error('接单时出错:', error);
        alert('接单失败，请稍后重试');
    }
}

// 更新订单状态
async function updateOrderStatus(orderId, newStatus) {
	console.log("开始改变订单状态"+orderId+newStatus);
    try {
        // const token = localStorage.getItem('token');
        
        // 调用API更新状态
        const response = await fetch(`http://localhost:8080/api/orders/${orderId}/status?status=${newStatus}`, {
            method: 'PUT',
            // headers: {
            //     'Authorization': `Bearer ${token}`,
            //     'Content-Type': 'application/json'
            // }
        });
        
        if (response.ok) {
            // 更新本地数据
            const taskIndex = myTasks.findIndex(task => task.orderId === orderId);
            if (taskIndex !== -1) {
                myTasks[taskIndex].status = newStatus;
                
                if (newStatus === 'completed') {
                    // 完成订单后从任务列表中移除
                    setTimeout(() => {
                        myTasks.splice(taskIndex, 1);
                        renderMyTasks();
                        alert(`订单 #${orderId} 已完成！`);
                    }, 1000);
                }
                
                renderMyTasks();
            }
        } else {
            const error = await response.json();
            alert(`更新订单状态失败: ${error.message || '未知错误'}`);
        }
    } catch (error) {
        console.error('更新订单状态时出错:', error);
        alert('更新订单状态失败，请稍后重试');
    }
}

// 显示订单详情
async function showOrderDetails(orderId, type) {
    try {
        const token = localStorage.getItem('token');
        let order;
        
        if (type === 'available') {
            order = availableOrders.find(o => o.orderId === orderId);
        } else {
            order = myTasks.find(o => o.orderId === orderId);
        }
        
        // 如果本地没有找到订单详情，尝试从API获取
        if (!order) {
            const response = await fetch(`http://localhost:8080/api/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                order = result.data;
            }
        }
        
        if (order) {
            modalTitle.textContent = `订单详情 #${order.orderId}`;
            
            // 获取订单项详情
            const itemsResponse = await fetch(`http://localhost:8080/api/orders/${orderId}/items`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            let itemsHtml = '';
            if (itemsResponse.ok) {
                const itemsResult = await itemsResponse.json();
                itemsHtml = itemsResult.data.map(item => 
                    `${item.dishName} x${item.quantity} (¥${item.price.toFixed(2)})`
                ).join('<br>');
            } else {
                itemsHtml = getOrderItemsText(order.items);
            }
            
            modalBody.innerHTML = `
                <div class="order-detail-item">
                    <div class="order-detail-label">餐厅</div>
                    <div>${order.restaurantName}</div>
                </div>
                <div class="order-detail-item">
                    <div class="order-detail-label">菜品</div>
                    <div>${itemsHtml}</div>
                </div>
                <div class="order-detail-item">
                    <div class="order-detail-label">总价</div>
                    <div>¥${order.totalPrice.toFixed(2)}</div>
                </div>
                <div class="order-detail-item">
                    <div class="order-detail-label">顾客信息</div>
                    <div>${order.customerName || '顾客'} (${order.customerPhone || '电话未提供'})</div>
                </div>
                <div class="order-detail-item">
                    <div class="order-detail-label">餐厅地址</div>
                    <div>${order.restaurantAddress || '地址未提供'}</div>
                </div>
                <div class="order-detail-item">
                    <div class="order-detail-label">配送地址</div>
                    <div>${order.deliveryAddress}</div>
                </div>
                <div class="order-detail-item">
                    <div class="order-detail-label">下单时间</div>
                    <div>${formatDate(order.createdAt)}</div>
                </div>
                <div class="order-detail-item">
                    <div class="order-detail-label">订单状态</div>
                    <div>${getStatusText(order.status)}</div>
                </div>
            `;
            
            orderModal.style.display = 'block';
        } else {
            alert('无法获取订单详情');
        }
    } catch (error) {
        console.error('获取订单详情时出错:', error);
        alert('获取订单详情失败');
    }
}

// 辅助函数 - 获取订单项文本
function getOrderItemsText(items) {
    if (!items) return '商品详情加载中...';
    if (Array.isArray(items)) {
        return items.map(item => 
            `${item.dishName || '商品'} x${item.quantity}`
        ).join(', ');
    }
    return '商品详情加载中...';
}

// 辅助函数 - 获取订单状态文本
function getStatusText(status) {
    const statusMap = {
        'CREATED': '待接单',
        'ACCEPTED': '已接单',
        'DELIVERING': '配送中',
        'COMPLETED': '已完成',
        'CANCELLED': '已取消'
		// 'created': '待接单',
		// 'accepted': '已接单',
		// 'delivering': '配送中',
		// 'completed': '已完成',
		// 'cancelled': '已取消'
    };
    
    return statusMap[status] || status;
}

// 辅助函数 - 格式化日期
function formatDate(dateString) {
    if (!dateString) return '时间未知';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// 处理退出登录
function handleLogout() {
    if(confirm('确定要退出登录吗？')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        window.location.href = '../login/login.html';
    }
}

// 模拟数据函数（仅用于开发测试）
function getMockAvailableOrders() {
    return [
        {
            orderId: 10001,
            restaurantName: "麦当劳 - 人民广场店",
            items: [{ dishName: "巨无霸汉堡", quantity: 1 }, { dishName: "薯条", quantity: 2 }],
            totalPrice: 45.5,
            deliveryAddress: "上海市黄浦区南京东路123号15楼",
            createdAt: "2023-06-15T11:30:00",
            status: "created",
            customerName: "李先生",
            customerPhone: "138****1234",
            restaurantAddress: "上海市黄浦区南京东路456号"
        }
    ];
}

function getMockMyTasks() {
    return [
        {
            orderId: 9991,
            restaurantName: "星巴克 - 陆家嘴店",
            items: [{ dishName: "拿铁", quantity: 2 }, { dishName: "蓝莓 muffin", quantity: 1 }],
            totalPrice: 75.0,
            deliveryAddress: "上海市浦东新区陆家嘴环路1000号",
            createdAt: "2023-06-15T10:15:00",
            status: "accepted",
            customerName: "赵先生",
            customerPhone: "137****9012",
            restaurantAddress: "上海市浦东新区陆家嘴环路888号"
        }
    ];
}

// 页面加载时初始化
window.onload = initPage;