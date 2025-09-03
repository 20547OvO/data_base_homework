// API基础URL
const API_BASE_URL = 'http://localhost:8080/api';
const IMAGE_BASE_URL = 'http://localhost:8080';
// 全局数据
let restaurants = [];
let dishes = [];
let orders = [];
let selectedRestaurantId = null;

// DOM元素
const restaurantsList = document.getElementById('restaurantsList');
const dishesList = document.getElementById('dishesList');
const ordersList = document.getElementById('ordersList');
const restaurantsCount = document.getElementById('restaurantsCount');
const dishesCount = document.getElementById('dishesCount');
const ordersCount = document.getElementById('ordersCount');
const addRestaurantBtn = document.getElementById('addRestaurantBtn');
const addDishBtn = document.getElementById('addDishBtn');
const refreshOrdersBtn = document.getElementById('refreshOrdersBtn');
const refreshAllBtn = document.getElementById('refreshAllBtn');
const orderStatusFilter = document.getElementById('orderStatusFilter');
const restaurantModal = document.getElementById('restaurantModal');
const dishModal = document.getElementById('dishModal');
const restaurantForm = document.getElementById('restaurantForm');
const dishForm = document.getElementById('dishForm');
const closeButtons = document.querySelectorAll('.close');
const cancelRestaurantBtn = document.getElementById('cancelRestaurantBtn');
const cancelDishBtn = document.getElementById('cancelDishBtn');
const logoutBtn = document.getElementById('logoutBtn');
document.getElementById('confirmUpdateDishImageBtn').addEventListener('click', function() {
    const dishId = document.getElementById('updateDishId').value;
    updateDishImage(dishId);
});
// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
	loadRestaurants();
	setupEventListeners();
});

// 设置事件监听器
function setupEventListeners() {
	addRestaurantBtn.addEventListener('click', () => {
		restaurantModal.style.display = 'block';
	});
	
	addDishBtn.addEventListener('click', () => {
		dishModal.style.display = 'block';
	});
	
	refreshOrdersBtn.addEventListener('click', () => {
		if (selectedRestaurantId) {
			loadOrders(selectedRestaurantId);
		}
	});
	logoutBtn.addEventListener('click', handleLogout);
	
	refreshAllBtn.addEventListener('click', () => {
		loadRestaurants();
		if (selectedRestaurantId) {
			loadDishes(selectedRestaurantId);
			loadOrders(selectedRestaurantId);
		}
	});
	
	orderStatusFilter.addEventListener('change', () => {
		if (selectedRestaurantId) {
			renderOrders();
		}
	});
	
	closeButtons.forEach(button => {
		button.addEventListener('click', () => {
			restaurantModal.style.display = 'none';
			dishModal.style.display = 'none';
		});
	});
	
	cancelRestaurantBtn.addEventListener('click', () => {
		restaurantModal.style.display = 'none';
	});
	
	cancelDishBtn.addEventListener('click', () => {
		dishModal.style.display = 'none';
	});
	
	restaurantForm.addEventListener('submit', handleAddRestaurant);
	dishForm.addEventListener('submit', handleAddDish);
	
	// 图片预览功能
	document.getElementById('restaurantImage').addEventListener('change', function(e) {
	    previewImage(e.target, 'previewImg', 'imagePreview');
	});
	    
	document.getElementById('updateRestaurantImage').addEventListener('change', function(e) {
	    previewImage(e.target, 'updatePreviewImg', 'updateImagePreview');
	});
	    
	    // 更新图片模态框事件
	document.getElementById('cancelUpdateImageBtn').addEventListener('click', function() {
	    document.getElementById('updateImageModal').style.display = 'none';
	});
	    
	document.getElementById('updateImageForm').addEventListener('submit', handleUpdateRestaurantImage);
	// 图片预览功能
	document.getElementById('dishImage').addEventListener('change', function(e) {
	    previewImage(e.target, 'dishPreviewImg', 'dishImagePreview');
	});
	
	document.getElementById('updateDishImage').addEventListener('change', function(e) {
	    previewImage(e.target, 'updateDishPreviewImg', 'updateDishImagePreview');
	});
	
	// 更新菜品图片模态框事件
	document.getElementById('cancelUpdateDishImageBtn').addEventListener('click', function() {
	    document.getElementById('updateDishImageModal').style.display = 'none';
	});
	
	// 点击模态框外部关闭
	window.addEventListener('click', (e) => {
		  if (e.target === document.getElementById('updateDishImageModal')) {
		        document.getElementById('updateDishImageModal').style.display = 'none';
		    }
		if (e.target === document.getElementById('updateImageModal')) {
		            document.getElementById('updateImageModal').style.display = 'none';
		        }
		if (e.target === restaurantModal) {
			restaurantModal.style.display = 'none';
		}
		if (e.target === dishModal) {
			dishModal.style.display = 'none';
		}
	});
}

// API请求函数
async function apiRequest(endpoint, options = {}) {
	try {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			headers: {
				'Content-Type': 'application/json',
				...options.headers
			},
			...options
		});
		
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('API请求失败:', error);
		throw error;
	}
}

// 加载餐馆数据
async function loadRestaurants() {
	try {
		 const ownerId = localStorage.getItem('user_id');
		 if (!ownerId) {
		         showError('用户未登录，请先登录');
		         window.location.href = '../login/login.html';
		         return;
		     };
			 console.log("这次的请求参数为"+ownerId)
		restaurantsList.classList.add('loading');
		// const data = await apiRequest('/restaurants');
		const data = await apiRequest(`/restaurants/owner/${ownerId}`);
		
		console.log("resturant"+JSON.stringify(data.data));
		restaurants = data.data || [];
		renderRestaurants();
	} catch (error) {
		console.error('加载餐馆失败，使用模拟数据', error);
		// 使用模拟数据
		restaurants = [
			{ 
				restaurant_id: 1, 
				name: "美味中餐厅", 
				address: "北京市朝阳区建国路88号", 
				phone: "13800138000", 
				description: "提供正宗川菜和粤菜" 
			},
			{ 
				restaurant_id: 2, 
				name: "披萨意坊", 
				address: "上海市浦东新区陆家嘴金融区", 
				phone: "13900139000", 
				description: "意大利传统手工披萨" 
			}
		];
		renderRestaurants();
	} finally {
		restaurantsList.classList.remove('loading');
	}
}

// 加载菜品数据
async function loadDishes(restaurantId) {
	try {
		dishesList.classList.add('loading');
		const data = await apiRequest(`/dishes/restaurant/${restaurantId}`);
		console.log("这次加载的餐馆为"+restaurantId);
		dishes = data.data || [];
		console.log(JSON.stringify(dishes));
		renderDishes();
	} catch (error) {
		console.error('加载菜品失败，使用模拟数据', error);
		// 使用模拟数据
		dishes = [
			{ 
				dish_id: 1, 
				restaurant_id: 1, 
				name: "宫保鸡丁", 
				price: 38.0, 
				stock: 50,
				description: "经典川菜，香辣可口" 
			},
			{ 
				dish_id: 2, 
				restaurant_id: 1, 
				name: "麻婆豆腐", 
				price: 32.0, 
				stock: 60,
				description: "四川传统名菜，麻辣鲜香" 
			},
			{ 
				dish_id: 3, 
				restaurant_id: 2, 
				name: "玛格丽特披萨", 
				price: 58.0, 
				stock: 30,
				description: "传统意式披萨，番茄与奶酪的完美结合" 
			}
		].filter(dish => dish.restaurant_id === restaurantId);
		renderDishes();
	} finally {
		dishesList.classList.remove('loading');
	}
}

// 加载订单数据
async function loadOrders(restaurantId) {
	try {
		ordersList.classList.add('loading');
		const data = await apiRequest(`/orders/restaurant/${restaurantId}`);
	
		orders = data.data || [];
		console.log("这个餐馆为订单为"+JSON.stringify(orders));
		renderOrders();
	} catch (error) {
		console.error('加载订单失败，使用模拟数据', error);
		// 使用模拟数据
		orders = [
			{ 
				order_id: 1, 
				restaurant_id: 1, 
				customer_id: 101,
				customer_name: "张先生",
				total_price: 76.0, 
				status: "created", 
				create_time: "2023-04-01T12:00:00",
				items: [
					{ name: "宫保鸡丁", quantity: 2, price: 38.0 }
				]
			},
			{ 
				order_id: 2, 
				restaurant_id: 1, 
				customer_id: 102,
				customer_name: "李女士",
				total_price: 32.0, 
				status: "accepted", 
				create_time: "2023-04-01T12:30:00",
				items: [
					{ name: "麻婆豆腐", quantity: 1, price: 32.0 }
				]
			},
			{ 
				order_id: 3, 
				restaurant_id: 2, 
				customer_id: 103,
				customer_name: "王先生",
				total_price: 116.0, 
				status: "delivering", 
				create_time: "2023-04-01T13:00:00",
				items: [
					{ name: "玛格丽特披萨", quantity: 2, price: 58.0 }
				]
			}
		].filter(order => order.restaurant_id === restaurantId);
		renderOrders();
	} finally {
		ordersList.classList.remove('loading');
	}
}

// 更新订单状态
async function updateOrderStatus(orderId, status) {
	try {
		const data = await apiRequest(`/orders/${orderId}/status?status=${status}`, {
			method: 'PUT'
		});
		
		if (data.success) {
			// 更新本地订单状态
			const orderIndex = orders.findIndex(order => order.order_id === orderId);
			if (orderIndex !== -1) {
				orders[orderIndex].status = status;
				renderOrders();
			}
		} else {
			alert('更新订单状态失败: ' + data.message);
		}
	} catch (error) {
		console.error('更新订单状态失败', error);
		alert('更新订单状态失败，请重试');
	}
}

// 渲染餐馆列表
// 修改渲染餐馆列表函数以显示图片
function renderRestaurants() {
    restaurantsCount.textContent = restaurants.length;
    
    if (restaurants.length === 0) {
        restaurantsList.innerHTML = `
            <div class="empty-state">
                <i>🏪</i>
                <p>暂无餐馆，请添加您的第一家餐馆</p>
            </div>
        `;
        return;
    }
    
    restaurantsList.innerHTML = restaurants.map(restaurant => `
        <div class="card restaurant-card ${selectedRestaurantId === restaurant.restaurantId ? 'selected' : ''}" data-id="${restaurant.restaurantId}">
            <div class="card-header">
                <div class="card-title">${restaurant.name}</div>
                <div>
                    <button class="btn-image" onclick="openUpdateImageModal(${restaurant.restaurantId})">更换图片</button>
                    <button class="btn-danger" onclick="deleteRestaurant(${restaurant.restaurantId})">删除</button>
                </div>
            </div>
            <div class="card-content">
               ${restaurant.src ? 
                                   `<img src="${IMAGE_BASE_URL}${restaurant.src}" class="restaurant-image" alt="${restaurant.name}">` : 
                                   `<div class="restaurant-image-placeholder">🏪</div>`
                               }
                <p>${restaurant.address}</p>
                <p>${restaurant.phone}</p>
                <p>${restaurant.description || '暂无描述'}</p>
            </div>
            <div class="card-footer">
			    <button class="btn btn-secondary" onclick="viewRestaurantData(${restaurant.restaurantId})">查看数据</button>
			
                <button class="btn btn-primary" onclick="selectRestaurant(${restaurant.restaurantId})">管理餐馆</button>
            </div>
        </div>
    `).join('');
}
// 查看餐馆数据
function viewRestaurantData(restaurantId) {
    // 保存当前餐馆ID到localStorage，以便在数据分析页面使用
    localStorage.setItem('analytics_restaurant_id', restaurantId);
    // 跳转到数据分析页面
    window.location.href = '../restaurant_analytics/restaurant_analytics.html';
}

// 渲染菜品列表
// 修改renderDishes函数以显示菜品图片
function renderDishes() {
    if (!selectedRestaurantId) {
        dishesList.innerHTML = `
            <div class="empty-state">
                <i>🍲</i>
                <p>请先选择餐馆，然后添加菜品</p>
            </div>
        `;
        dishesCount.textContent = "0";
        return;
    }
    
    const restaurantDishes = dishes.filter(dish => dish.restaurant.restaurantId === selectedRestaurantId);
    dishesCount.textContent = restaurantDishes.length;
    
    if (restaurantDishes.length === 0) {
        dishesList.innerHTML = `
            <div class="empty-state">
                <i>🍲</i>
                <p>该餐馆暂无菜品，请添加菜品</p>
            </div>
        `;
        return;
    }
    
    dishesList.innerHTML = restaurantDishes.map(dish => `
        <div class="card">
            <div class="card-header">
                <div class="card-title">${dish.name}</div>
                <div>
                    <button class="btn-image" onclick="openUpdateDishImageModal(${dish.dishId})">更换图片</button>
                    <button class="btn-danger" onclick="deleteDish(${dish.dishId})">删除</button>
                </div>
            </div>
            <div class="card-content">
                ${dish.src ? 
                    `<img src="${IMAGE_BASE_URL}${dish.src}" class="restaurant-image" alt="${dish.name}">` : 
                    `<div class="dish-image-placeholder">🍲</div>`
                }
                <p>价格: ¥${dish.price.toFixed(2)}</p>
                <p>库存: ${dish.stock}</p>
                <p>${dish.description || '暂无描述'}</p>
            </div>
            <div class="card-footer">
                <button class="btn btn-secondary" onclick="updateDishStock(${dish.dishId}, ${dish.stock})">更新库存</button>
            </div>
        </div>
    `).join('');
}

// 添加打开更新菜品图片模态框的函数
function openUpdateDishImageModal(dishId) {
    document.getElementById('updateDishId').value = dishId;
    document.getElementById('updateDishImageModal').style.display = 'block';
}

// 渲染订单列表
function renderOrders() {
	if (!selectedRestaurantId) {
		ordersList.innerHTML = `
			<div class="empty-state">
				<i>📦</i>
				<p>请先选择餐馆</p>
			</div>
		`;
		ordersCount.textContent = "0";
		return;
	}
	console.log("目前加载订单的餐馆id为"+selectedRestaurantId);
	
	const statusFilter = orderStatusFilter.value;
	
	console.log("这次加载的订单为"+JSON.stringify(orders))
	let filteredOrders = orders;
	
	if (statusFilter !== 'all') {
		filteredOrders = orders.filter(order => order.status === statusFilter);
	}
	
	ordersCount.textContent = filteredOrders.length;
	
	if (filteredOrders.length === 0) {
		ordersList.innerHTML = `
			<div class="empty-state">
				<i>📦</i>
				<p>暂无订单</p>
			</div>
		`;
		return;
	}
	
	ordersList.innerHTML = filteredOrders.map(order => `
		<div class="card">
			<div class="card-header">
				<div class="card-title">订单 #${order.orderId}</div>
				<span class="status-badge status-${order.status}">${getStatusText(order.status)}</span>
			</div>
			<div class="card-content">
				<p>顾客: ${order.customer_name || `ID: ${order.customerId}`}</p>
				<p>总价: ¥${order.totalPrice.toFixed(2)}</p>
				<p>下单时间: ${formatDateTime(order.create_time)}</p>
				
				<div class="order-items">
					<strong>订单内容:</strong>
					${order.items ? order.items.map(item => `
						<div class="order-item">
							<span>${item.dishName} × ${item.quantity}</span>
							<span>¥${(item.price * item.quantity).toFixed(2)}</span>
						</div>
					`).join('') : '无订单详情'}
				</div>
			</div>
			<div class="card-footer">
				${getOrderActions(order)}
			</div>
		</div>
	`).join('');
}

// 根据订单状态获取操作按钮
function getOrderActions(order) {
	switch(order.status) {
		case 'created':
			return `
				<button class="btn btn-primary" onclick="updateOrderStatus(${order.order_id}, 'accepted')">接受订单</button>
				<button class="btn btn-danger" onclick="updateOrderStatus(${order.order_id}, 'cancelled')">取消订单</button>
			`;
		case 'accepted':
			return `
				<button class="btn btn-warning" onclick="updateOrderStatus(${order.order_id}, 'delivering')">开始配送</button>
				<button class="btn btn-danger" onclick="updateOrderStatus(${order.order_id}, 'cancelled')">取消订单</button>
			`;
		case 'delivering':
			return `
				<button class="btn btn-primary" onclick="updateOrderStatus(${order.order_id}, 'completed')">完成订单</button>
			`;
		default:
			return `<span>无可用操作</span>`;
	}
}

// 获取状态文本
function getStatusText(status) {
	const statusMap = {
		'CREATED': '已创建',
		'ACCEPTED': '已接受',
		'DELIVERING': '配送中',
		'COMPLETED': '已完成',
		'CANCELLED': '已取消'
	};
	return statusMap[status] || status;
}

// 格式化日期时间
function formatDateTime(dateTimeStr) {
	if (!dateTimeStr) return '未知时间';
	const date = new Date(dateTimeStr);
	return date.toLocaleString('zh-CN');
}

// 选择餐馆
function selectRestaurant(id) {
	selectedRestaurantId = id;
	renderRestaurants();
	loadDishes(id);
	loadOrders(id);
	updateAddDishButton();
}

// 更新添加菜品按钮状态
function updateAddDishButton() {
	addDishBtn.disabled = !selectedRestaurantId;
}

// 处理添加餐馆
// 修改处理添加餐馆函数以支持图片上传
async function handleAddRestaurant(e) {
    e.preventDefault();
    const ownerId = localStorage.getItem('user_id');
    if (!ownerId) {
        showError('用户未登录，请先登录');
        window.location.href = '../login/login.html';
        return;
    };
    
    const name = document.getElementById('restaurantName').value;
    const address = document.getElementById('restaurantAddress').value;
    const phone = document.getElementById('restaurantPhone').value;
    const description = document.getElementById('restaurantDescription').value;
    const imageFile = document.getElementById('restaurantImage').files[0];
    
    try {
        // 创建餐厅请求对象
        const restaurantRequest = {
            name,
            address,
            phone,
            description,
            ownerId
        };
        
        // 使用FormData处理文件上传
        const formData = new FormData();
        // 将请求对象转为JSON字符串并添加到FormData
        formData.append('request', new Blob([JSON.stringify(restaurantRequest)], {
            type: "application/json"
        }));
        
        if (imageFile) {
            formData.append('image', imageFile);
        }
        
        const response = await fetch(`${API_BASE_URL}/restaurants`, {
            method: 'POST',
            body: formData
            // 注意：不要手动设置Content-Type，浏览器会自动设置正确的boundary
        });
        
        const data = await response.json();
        
        if (data.success) {
            // 重新加载餐馆列表
            loadRestaurants();
            restaurantModal.style.display = 'none';
            restaurantForm.reset();
            document.getElementById('imagePreview').style.display = 'none';
        } else {
            alert('添加餐馆失败: ' + data.message);
        }
    } catch (error) {
        console.error('添加餐馆失败', error);
        alert('添加餐馆失败，请重试');
    }
}

// 处理添加菜品
// 修改dishModal的HTML结构（在owner_home.html中）
// 需要在dishModal中添加图片上传字段

// 修改handleAddDish函数
async function handleAddDish(e) {
    e.preventDefault();
    
    if (!selectedRestaurantId) {
        alert('请先选择餐馆');
        return;
    }
    
    const name = document.getElementById('dishName').value;
    const price = parseFloat(document.getElementById('dishPrice').value);
    const stock = parseInt(document.getElementById('dishStock').value);
    const description = document.getElementById('dishDescription').value;
    const imageFile = document.getElementById('dishImage').files[0];
    
    try {
        // 使用FormData处理文件上传
        const formData = new FormData();
        const dishRequest = {
            restaurantId: selectedRestaurantId,
            name,
            price,
            stock,
            description
        };
        
        formData.append('dish', new Blob([JSON.stringify(dishRequest)], {
            type: "application/json"
        }));
        
        if (imageFile) {
            formData.append('image', imageFile);
        }
        
        const response = await fetch(`${API_BASE_URL}/dishes`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            // 重新加载菜品列表
            loadDishes(selectedRestaurantId);
            dishModal.style.display = 'none';
            dishForm.reset();
            document.getElementById('dishImagePreview').style.display = 'none';
        } else {
            alert('添加菜品失败: ' + data.message);
        }
    } catch (error) {
        console.error('添加菜品失败', error);
        alert('添加菜品失败，请重试');
    }
}

// 添加上传菜品图片的函数
// 修改updateDishImage函数
async function updateDishImage() {
    const dishId = document.getElementById('updateDishId').value;
    const imageFile = document.getElementById('updateDishImage').files[0];
    
    if (!imageFile) {
        alert('请选择图片');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const response = await fetch(`${API_BASE_URL}/dishes/${dishId}/upload-image`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            // 重新加载菜品列表
            loadDishes(selectedRestaurantId);
            document.getElementById('updateDishImageModal').style.display = 'none';
            alert('菜品图片更新成功');
        } else {
            alert('更新图片失败: ' + data.message);
        }
    } catch (error) {
        console.error('更新图片失败', error);
        alert('更新图片失败，请重试');
    }
}

// 删除餐馆
async function deleteRestaurant(id) {
	if (confirm('确定要删除这个餐馆吗？同时也会删除该餐馆的所有菜品和订单！')) {
		try {
			console.log("这个餐馆的id为"+id);
			const data = await apiRequest(`/restaurants/${id}`, {
				method: 'DELETE'
			});
			
			if (data.success) {
				// 重新加载餐馆列表
				loadRestaurants();
				
				// 如果删除的是当前选中的餐馆，清除选中状态
				if (selectedRestaurantId === id) {
					selectedRestaurantId = null;
					renderDishes();
					renderOrders();
					updateAddDishButton();
				}
			} else {
				alert('删除餐馆失败: ' + data.message);
			}
		} catch (error) {
			console.error('删除餐馆失败', error);
			alert('删除餐馆失败，请重试');
		}
	}
}

// 删除菜品
async function deleteDish(id) {
	if (confirm('确定要删除这个菜品吗？')) {
		try {
			const data = await apiRequest(`/dishes/${id}`, {
				method: 'DELETE'
			});
			
			if (data.success) {
				// 重新加载菜品列表
				loadDishes(selectedRestaurantId);
			} else {
				alert('删除菜品失败: ' + data.message);
			}
		} catch (error) {
			console.error('删除菜品失败', error);
			alert('删除菜品失败，请重试');
		}
	}
}

// 更新菜品库存
async function updateDishStock(id, currentStock) {
	const newStock = prompt('请输入新的库存数量:', currentStock);
	if (newStock === null) return;
	
	const stock = parseInt(newStock);
	if (isNaN(stock) || stock < 0) {
		alert('请输入有效的库存数量');
		return;
	}
	
	try {
		const data = await apiRequest(`/dishes/${id}/stock?stock=${stock}`, {
			method: 'PATCH'
		});
		
		if (data.success) {
			// 重新加载菜品列表
			loadDishes(selectedRestaurantId);
		} else {
			alert('更新库存失败: ' + data.message);
		}
	} catch (error) {
		console.error('更新库存失败', error);
		alert('更新库存失败，请重试');
	}
}
// 处理退出登录
function handleLogout() {
    if(confirm('确定要退出登录吗？')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        window.location.href = '../login/login.html';
    }
}

// 图片预览函数
function previewImage(input, imgId, previewDivId) {
    const preview = document.getElementById(imgId);
    const previewDiv = document.getElementById(previewDivId);
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.src = e.target.result;
            previewDiv.style.display = 'block';
        }
        
        reader.readAsDataURL(input.files[0]);
    } else {
        previewDiv.style.display = 'none';
    }
}

// 打开更新图片模态框
function openUpdateImageModal(restaurantId) {
    document.getElementById('updateRestaurantId').value = restaurantId;
    document.getElementById('updateImageModal').style.display = 'block';
}

// 处理更新餐馆图片
async function handleUpdateRestaurantImage(e) {
    e.preventDefault();
    
    const restaurantId = document.getElementById('updateRestaurantId').value;
    const imageFile = document.getElementById('updateRestaurantImage').files[0];
    
    if (!imageFile) {
        alert('请选择图片');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}/upload-image`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            // 更新本地餐馆列表中的图片
            const restaurantIndex = restaurants.findIndex(r => r.restaurantId == restaurantId);
            if (restaurantIndex !== -1) {
                restaurants[restaurantIndex].src = data.data.src;
                renderRestaurants();
            }
            
            document.getElementById('updateImageModal').style.display = 'none';
            document.getElementById('updateImageForm').reset();
            document.getElementById('updateImagePreview').style.display = 'none';
        } else {
            alert('更新图片失败: ' + data.message);
        }
    } catch (error) {
        console.error('更新图片失败', error);
        alert('更新图片失败，请重试');
    }
}

// 全局函数声明
window.selectRestaurant = selectRestaurant;
window.deleteRestaurant = deleteRestaurant;
window.deleteDish = deleteDish;
window.updateDishStock = updateDishStock;
window.updateOrderStatus = updateOrderStatus;
window.openUpdateImageModal = openUpdateImageModal;
window.handleUpdateRestaurantImage = handleUpdateRestaurantImage;
// 全局函数声明
window.openUpdateDishImageModal = openUpdateDishImageModal;
window.updateDishImage = updateDishImage;