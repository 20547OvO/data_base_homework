// 全局状态
let restaurant = null;
let cart = {
    items: [],
    total: 0
};
let userInfo = null;
let deliveryAddress = null;

// 页面加载时执行
document.addEventListener('DOMContentLoaded', function() {
    // 加载用户信息和地址
    loadUserInfo();
    
    // 加载购物车和餐馆信息
    loadCartAndRestaurant();
    
    // 提交订单按钮点击事件
    document.getElementById('submitOrderBtn').addEventListener('click', submitOrder);
    
    // 修改地址按钮点击事件
	 // 修改地址按钮点击事件
	    document.getElementById('editAddressBtn').addEventListener('click', showAddressModal);
	    
	    // 模态框关闭事件
	    document.querySelector('.close').addEventListener('click', hideAddressModal);
	    document.getElementById('cancelAddressBtn').addEventListener('click', hideAddressModal);
	    
	    // 地址表单提交事件
	    document.getElementById('addressForm').addEventListener('submit', saveAddress);
	    
	    // 点击模态框外部关闭
	    document.getElementById('addressModal').addEventListener('click', function(e) {
	        if (e.target === this) hideAddressModal();
	    });
	
  
});

// 显示地址模态框
function showAddressModal() {
    const modal = document.getElementById('addressModal');
    modal.style.display = 'block';
    
    // 填充现有地址信息
    document.getElementById('contactNameInput').value = deliveryAddress ? deliveryAddress.contactName : (userInfo ? userInfo.username : '');
    document.getElementById('contactPhoneInput').value = deliveryAddress ? deliveryAddress.contactPhone : (userInfo ? userInfo.phone : '');
    document.getElementById('addressInput').value = deliveryAddress ? deliveryAddress.fullAddress : '';
}

// 隐藏地址模态框
function hideAddressModal() {
    document.getElementById('addressModal').style.display = 'none';
}

// 保存地址信息
function saveAddress(e) {
    e.preventDefault();
    
    const contactName = document.getElementById('contactNameInput').value.trim();
    const contactPhone = document.getElementById('contactPhoneInput').value.trim();
    const address = document.getElementById('addressInput').value.trim();
    
    // 简单验证
    if (!contactName) {
        alert('请输入收货人姓名');
        return;
    }
    
    if (!contactPhone ) {
        alert('请输入正确的手机号码');
        return;
    }
    
    if (!address) {
        alert('请输入详细地址');
        return;
    }
    
    // 更新地址信息
    deliveryAddress = {
        contactName,
        contactPhone,
        fullAddress: address
    };
    
    // 更新显示
    updateAddressDisplay();
    
    // 关闭模态框
    hideAddressModal();
}

// 修改updateAddressDisplay函数以使用deliveryAddress
function updateAddressDisplay() {
    const contactName = document.getElementById('contactName');
    const contactPhone = document.getElementById('contactPhone');
    const addressText = document.getElementById('addressText');
    
    if (deliveryAddress) {
        contactName.textContent = deliveryAddress.contactName;
        contactPhone.textContent = deliveryAddress.contactPhone;
        addressText.textContent = deliveryAddress.fullAddress;
    } else if (userInfo) {
        contactName.textContent = userInfo.username;
        contactPhone.textContent = userInfo.phone;
        addressText.textContent = '请添加配送地址';
    }
}


function showError(message, elementId = null) {
    if (elementId) {
        document.getElementById(elementId).innerHTML = `<div class="error">${message}</div>`;
    } else {
        alert(message);
    }
}

async function loadUserInfo() {
    try {
        // 假设用户已登录，从localStorage获取用户ID
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            showError('用户未登录，请先登录');
            window.location.href = '../login/login.html';
            return;
        }
        
        // 获取用户信息
        const response = await fetch(`http://localhost:8080/api/users/${userId}`);
        if (!response.ok) throw new Error('获取用户信息失败');
        const result = await response.json();
        userInfo = result;
		console.log("查看用户信息"+userInfo)
        
        // // 获取用户地址
        // const addressResponse = await fetch(`http://localhost:8080/api/users/${userId}/address`);
        // if (addressResponse.ok) {
        //     const addressResult = await addressResponse.json();
        //     if (addressResult.data && addressResult.data.length > 0) {
        //         deliveryAddress = addressResult.data[0];
        //     }
        // }
        
        // 更新地址显示
        updateAddressDisplay();
    } catch (error) {
        console.error('加载用户信息失败:', error);
        showError('加载用户信息失败，请重试');
    }
}

function loadCartAndRestaurant() {
    // 从localStorage获取购物车和餐馆信息
    const savedCart = localStorage.getItem('current_cart');
    const savedRestaurant = localStorage.getItem('current_restaurant');
    
    if (!savedCart || !savedRestaurant) {
        showError('购物车信息丢失，请返回重新选择商品');
        return;
    }
    
    cart = JSON.parse(savedCart);
    restaurant = JSON.parse(savedRestaurant);
    
    // 更新订单显示
    updateOrderDisplay();
}

function updateAddressDisplay() {
    const contactName = document.getElementById('contactName');
    const contactPhone = document.getElementById('contactPhone');
    const addressText = document.getElementById('addressText');
    
    if (deliveryAddress) {
        contactName.textContent = deliveryAddress.contactName || userInfo.username;
        contactPhone.textContent = deliveryAddress.contactPhone || userInfo.phone;
        addressText.textContent = deliveryAddress.fullAddress;
    } else if (userInfo) {
        contactName.textContent = userInfo.username;
        contactPhone.textContent = userInfo.phone;
        addressText.textContent = '请添加配送地址';
    }
}

function updateOrderDisplay() {
    const orderItems = document.getElementById('orderItems');
    const itemsPrice = document.getElementById('itemsPrice');
    const deliveryFeeEl = document.getElementById('deliveryFee');
    const totalPrice = document.getElementById('totalPrice');
    const footerTotal = document.getElementById('footerTotal');
    const submitBtn = document.getElementById('submitOrderBtn');
    
    // 计算商品总价
    const itemsTotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = restaurant.deliveryFee || 0;
    const total = itemsTotal + deliveryFee;
    
    // 更新价格显示
    itemsPrice.textContent = `¥${itemsTotal.toFixed(2)}`;
    deliveryFeeEl.textContent = `¥${deliveryFee.toFixed(2)}`;
    totalPrice.textContent = `¥${total.toFixed(2)}`;
    footerTotal.textContent = `¥${total.toFixed(2)}`;
    
    // 更新订单项显示
    orderItems.innerHTML = '';
    cart.items.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'dish-item';
        itemEl.innerHTML = `
            <div class="dish-name">${item.name}</div>
            <div class="dish-quantity">x${item.quantity}</div>
            <div class="dish-price">¥${(item.price * item.quantity).toFixed(2)}</div>
        `;
        orderItems.appendChild(itemEl);
    });
    
    // 启用提交按钮
    submitBtn.disabled = false;
}

async function submitOrder() {
	
    const submitBtn = document.getElementById('submitOrderBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = '提交中...';
	
	
	
    
    try {
        // 获取支付方式
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        
        // 准备订单数据
        const orderData = {
            customerId: userInfo.userId,
			deliverAdd: deliveryAddress.fullAddress,
			deliverName: deliveryAddress.contactName,
			phone: deliveryAddress.contactPhone,
            restaurantId: restaurant.restaurantId,
            totalPrice: cart.total + (restaurant.deliveryFee || 0),
            status: 'CREATED',
            items: cart.items.map(item => ({
                    dishId: item.dishId,  // 只需要发送dishId，不需要完整对象
                    quantity: item.quantity
                    // price会在后端计算，不需要前端发送
                }))
        };
		console.log("aaaaaauserinfo"+JSON.stringify(orderData))
        // 提交订单
        const response = await fetch('http://localhost:8080/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            const errorResult = await response.json();
            throw new Error(errorResult.message || '提交订单失败');
        }
        
        const result = await response.json();
        
        // 清空购物车
        localStorage.removeItem(`cart_${restaurant.restaurantId}`);
        localStorage.removeItem('current_cart');
        localStorage.removeItem('current_restaurant');
        
        // 跳转到订单成功页面
        alert('订单提交成功！');
        window.location.href = `../home/home.html`;
        
    } catch (error) {
        console.error('提交订单失败:', error);
        showError(error.message+'请检查订单地址联系电话是否正确填写' || '提交订单失败，请重试');
        submitBtn.disabled = false;
        submitBtn.textContent = '提交订单';
    }
}