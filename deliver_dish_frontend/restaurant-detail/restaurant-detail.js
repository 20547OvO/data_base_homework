const IMAGE_BASE_URL = 'http://localhost:8080';
// 从URL获取餐馆ID
const urlParams = new URLSearchParams(window.location.search);
const restaurantId = urlParams.get('id');

// 全局状态
let restaurant = null;
let dishes = [];
let cart = {
    items: [],
    total: 0
};
let reviews = [];
let selectedRating = 0;

// 页面加载时执行
document.addEventListener('DOMContentLoaded', function() {
    if (!restaurantId) {
        showError('无效的餐馆ID');
        return;
    }
    
    // 加载餐馆详情和菜品
    loadRestaurantDetails();
    loadDishes();
    
    // 加载购物车数据
    loadCartFromStorage();
    updateCartUI();
	
    
    // 结算按钮点击事件
    document.getElementById('checkoutBtn').addEventListener('click', function() {
        if (cart.items.length === 0) return;
        
        localStorage.setItem('current_cart', JSON.stringify(cart));
        localStorage.setItem('current_restaurant', JSON.stringify(restaurant));
        
        window.location.href = `../checkout/checkout.html?restaurantId=${restaurantId}`;
    });
	// 加载评论
    loadReviews();
    
    // 添加评论按钮点击事件
    document.getElementById('addReviewBtn').addEventListener('click', openReviewModal);
    
    // 模态框关闭事件
    document.getElementById('closeModal').addEventListener('click', closeReviewModal);
    
    // 星级评分点击事件
    document.querySelectorAll('.star-rating i').forEach(star => {
        star.addEventListener('click', function() {
            setRating(parseInt(this.dataset.rating));
        });
    });
    
    // 提交评价事件
    document.getElementById('submitReviewBtn').addEventListener('click', submitReview);
    
    // 点击模态框外部关闭
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('reviewModal');
        if (event.target === modal) {
            closeReviewModal();
        }
    });
    // 加载评论
    loadReviews();
    
    // 添加评论按钮点击事件
    document.getElementById('addReviewBtn').addEventListener('click', openReviewModal);
    
    // 模态框关闭事件
    document.getElementById('closeModal').addEventListener('click', closeReviewModal);
    
    // 星级评分点击事件
    document.querySelectorAll('.star-rating i').forEach(star => {
        star.addEventListener('click', function() {
            setRating(parseInt(this.dataset.rating));
        });
    });
    
    // 提交评价事件
    document.getElementById('submitReviewBtn').addEventListener('click', submitReview);
    
    // 点击模态框外部关闭
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('reviewModal');
        if (event.target === modal) {
            closeReviewModal();
        }
    });	
});

function showError(message) {
    const dishesContainer = document.getElementById('dishesContainer');
    dishesContainer.innerHTML = `<div class="error">${message}</div>`;
}

async function loadRestaurantDetails() {
    try {
        const response = await fetch(`http://localhost:8080/api/restaurants/${restaurantId}`);
        if (!response.ok) throw new Error('获取餐馆信息失败');
        const result = await response.json();
        restaurant = result.data;
        
        document.getElementById('restaurantName').textContent = restaurant.name;
        
        // 初始显示餐馆的默认评分
        document.getElementById('restaurantRating').textContent = 
            getStarRating(restaurant.rating || 0) + ' ' + (restaurant.rating || 0).toFixed(1);
        
    } catch (error) {
        console.error('加载餐馆详情失败:', error);
        showError('加载餐馆详情失败，请重试');
    }
}

async function loadDishes() {
    try {
        const response = await fetch(`http://localhost:8080/api/dishes/restaurant/${restaurantId}`);
        if (!response.ok) throw new Error('获取菜品信息失败');
        const result = await response.json();
        dishes = result.data || [];
        document.getElementById('loadingIndicator').style.display = 'none';
        renderDishes();
    } catch (error) {
        console.error('加载菜品失败:', error);
        showError('加载菜品失败，请重试');
    }
}

function renderDishes() {
    const dishesContainer = document.getElementById('dishesContainer');
    if (dishes.length === 0) {
        dishesContainer.innerHTML = '<div class="error">该餐馆暂无菜品</div>';
        return;
    }
    dishesContainer.innerHTML = '';

    const categorySection = document.createElement('div');
    categorySection.className = 'category-section';
    categorySection.id = 'category-all';

    const categoryTitle = document.createElement('h2');
    categoryTitle.className = 'category-title';
    categoryTitle.textContent = '所有菜品';

    const dishList = document.createElement('div');
    dishList.className = 'dish-list';

    dishes.forEach(dish => {
        const dishItem = document.createElement('div');
        dishItem.className = 'dish-item';
        if (dish.stock === 0) dishItem.classList.add('sold-out');

        const dishImage = document.createElement('div');
        dishImage.className = 'dish-image';
        
        if (dish.src) {
            const img = document.createElement('img');
            img.src = IMAGE_BASE_URL+dish.src;
            img.alt = dish.name;
            img.onerror = function() {
                // 如果图片加载失败，显示默认图标
                this.style.display = 'none';
                dishImage.innerHTML = '<i class="fas fa-utensils"></i>';
            };
            dishImage.appendChild(img);
        } else {
            dishImage.innerHTML = '<i class="fas fa-utensils"></i>';
        }
        const dishInfo = document.createElement('div');
        dishInfo.className = 'dish-info';

        const dishName = document.createElement('div');
        dishName.className = 'dish-name';
        dishName.textContent = dish.name;

        const dishDesc = document.createElement('div');
        dishDesc.className = 'dish-desc';
        dishDesc.textContent = dish.description || '暂无描述';

        const dishBottom = document.createElement('div');
        dishBottom.className = 'dish-bottom';

        const dishPrice = document.createElement('div');
        dishPrice.className = 'dish-price';
        dishPrice.textContent = `¥${dish.price}`;

        const dishActions = document.createElement('div');
        dishActions.className = 'dish-actions';

        const cartItem = cart.items.find(item => item.dishId === dish.dishId);
        const quantity = cartItem ? cartItem.quantity : 0;

        if (dish.stock === 0) {
            const soldOutText = document.createElement('div');
            soldOutText.className = 'sold-out-text';
            soldOutText.textContent = '已售罄';
            dishActions.appendChild(soldOutText);
        } else if (quantity > 0) {
            const decreaseBtn = document.createElement('button');
            decreaseBtn.className = 'quantity-btn';
            decreaseBtn.textContent = '-';
            decreaseBtn.addEventListener('click', function() {
                decreaseQuantity(dish.dishId);
            });

            const quantityNum = document.createElement('span');
            quantityNum.className = 'quantity-num';
            quantityNum.textContent = quantity;
            quantityNum.id = `quantity-${dish.dishId}`;

            const increaseBtn = document.createElement('button');
            increaseBtn.className = 'quantity-btn';
            increaseBtn.textContent = '+';
            increaseBtn.addEventListener('click', function() {
                increaseQuantity(dish.dishId);
            });
            if (dish.stock <= quantity) increaseBtn.disabled = true;

            dishActions.appendChild(decreaseBtn);
            dishActions.appendChild(quantityNum);
            dishActions.appendChild(increaseBtn);
        } else {
            const addBtn = document.createElement('button');
            addBtn.className = 'add-btn';
            addBtn.textContent = '加入购物车';
            addBtn.addEventListener('click', function() {
                addToCart(dish.dishId);
            });
            dishActions.appendChild(addBtn);
        }

        dishBottom.appendChild(dishPrice);
        dishBottom.appendChild(dishActions);

        dishInfo.appendChild(dishName);
        dishInfo.appendChild(dishDesc);
        if (dish.stock > 0) {
            const stockInfo = document.createElement('div');
            stockInfo.className = 'dish-desc';
            stockInfo.textContent = `库存: ${dish.stock}`;
            dishInfo.appendChild(stockInfo);
        }
        dishInfo.appendChild(dishBottom);

        dishItem.appendChild(dishImage);
        dishItem.appendChild(dishInfo);

        dishList.appendChild(dishItem);
    });

    categorySection.appendChild(categoryTitle);
    categorySection.appendChild(dishList);
    dishesContainer.appendChild(categorySection);
}

function addToCart(dishId) {
    const dish = dishes.find(d => d.dishId == dishId);
    if (!dish) return;
    if (dish.stock <= 0) {
        alert('该菜品已售罄');
        return;
    }

    const existingItemIndex = cart.items.findIndex(item => item.dishId == dishId);
    if (existingItemIndex !== -1) {
        const existingItem = cart.items[existingItemIndex];
        if (existingItem.quantity >= dish.stock) {
            alert('已达到库存上限');
            return;
        }
        existingItem.quantity += 1;
        cart.items[existingItemIndex] = existingItem;
    } else {
        cart.items.push({
            dishId: dish.dishId,
            name: dish.name,
            price: dish.price,
            quantity: 1
        });
    }

    updateCartTotal();
    saveCartToStorage();
    updateCartUI();
    renderDishes();
}

function increaseQuantity(dishId) {
    const dish = dishes.find(d => d.dishId == dishId);
    const itemIndex = cart.items.findIndex(item => item.dishId == dishId);
    if (itemIndex !== -1 && dish) {
        const item = cart.items[itemIndex];
        if (item.quantity >= dish.stock) {
            alert('已达到库存上限');
            return;
        }
        item.quantity += 1;
        cart.items[itemIndex] = item;
        updateCartTotal();
        saveCartToStorage();
        updateCartUI();
        renderDishes();
    }
}

function decreaseQuantity(dishId) {
    const itemIndex = cart.items.findIndex(item => item.dishId == dishId);
    if (itemIndex !== -1) {
        const item = cart.items[itemIndex];
        item.quantity -= 1;
        if (item.quantity <= 0) cart.items.splice(itemIndex, 1);
        else cart.items[itemIndex] = item;

        updateCartTotal();
        saveCartToStorage();
        updateCartUI();
        renderDishes();
    }
}

function updateCartTotal() {
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function updateCartUI() {
    const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const cartBadge = document.getElementById('cartBadge');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const cartBar = document.getElementById('cartBar');

    cartBadge.textContent = totalQuantity;
    cartTotal.textContent = `¥${cart.total.toFixed(2)}`;

    if (totalQuantity > 0) {
        checkoutBtn.disabled = false;
        cartBar.classList.remove('cart-empty');
        if (restaurant && cart.total < restaurant.minOrder) {
            checkoutBtn.disabled = true;
            checkoutBtn.textContent = `还差 ¥${(restaurant.minOrder - cart.total).toFixed(2)}`;
        } else {
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = '去结算';
        }
    } else {
        checkoutBtn.disabled = true;
        checkoutBtn.textContent = '去结算';
        cartBar.classList.add('cart-empty');
    }
}

function saveCartToStorage() {
    localStorage.setItem(`cart_${restaurantId}`, JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem(`cart_${restaurantId}`);
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartTotal();
    }
}

function getStarRating(rating) {
    const safeRating = rating || 0;
    const fullStars = Math.floor(safeRating);
    const halfStar = safeRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return '★'.repeat(fullStars) + (halfStar ? '☆' : '') + '☆'.repeat(emptyStars);
}
// 加载评论函数
// 加载评论函数
async function loadReviews() {
    try {
        const response = await fetch(`http://localhost:8080/api/reviews/target/restaurant/${restaurantId}`);
        if (!response.ok) throw new Error('获取评论失败');
        const result = await response.json();
        reviews = result.data || [];
        renderReviews();
        
        // 更新餐馆评分显示（基于真实评论数据）
        updateRestaurantRating();
    } catch (error) {
        console.error('加载评论失败:', error);
    }
}

// 更新餐馆评分显示
function updateRestaurantRating() {
    if (reviews.length === 0) return; // 如果没有评论，保持原样
    
    const averageRating = calculateAverageRating();
    document.getElementById('restaurantRating').textContent = 
        getStarRating(averageRating) + ' ' + averageRating.toFixed(1);
}

// 计算平均评分
function calculateAverageRating() {
    if (reviews.length === 0) {
        return restaurant.rating || 0;
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / reviews.length;
}

// 渲染评论函数
function renderReviews() {
    const reviewsList = document.getElementById('reviewsList');
    
    if (reviews.length === 0) {
        reviewsList.innerHTML = '<div class="no-reviews">暂无评价</div>';
        return;
    }
    
    reviewsList.innerHTML = reviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <div class="reviewer-name">${review.reviewer.username || '匿名用户'}</div>
                <div class="review-date">${formatDate(review.createTime)}</div>
            </div>
            <div class="review-rating">${getStarRating(review.rating)}</div>
            <div class="review-comment">${review.comment || '用户未填写评价内容'}</div>
        </div>
    `).join('');
}

// 打开评价模态框
function openReviewModal() {
    
    const userId = localStorage.getItem('user_id');
    if (!userId) {
        alert('请先登录后再评价');
        window.location.href = '../login/login.html';
        return;
    }
    
    // // 检查用户是否已经评价过
    // const userReview = reviews.find(review => review.reviewerId === currentUser.user_id);
    // if (userReview) {
    //     alert('您已经评价过该餐馆');
    //     return;
    // }
    
    // 重置表单
    selectedRating = 0;
    document.getElementById('reviewComment').value = '';
    updateStarRating();
    document.getElementById('ratingValue').textContent = '0';
    
    // 显示模态框
    document.getElementById('reviewModal').style.display = 'block';
}

// 关闭评价模态框
function closeReviewModal() {
    document.getElementById('reviewModal').style.display = 'none';
}

// 设置评分
function setRating(rating) {
    selectedRating = rating;
    updateStarRating();
    document.getElementById('ratingValue').textContent = rating;
}

// 更新星级显示
function updateStarRating() {
    const stars = document.querySelectorAll('.star-rating i');
    stars.forEach((star, index) => {
        if (index < selectedRating) {
            star.className = 'fas fa-star active';
        } else {
            star.className = 'far fa-star';
        }
    });
}

// 提交评价
async function submitReview() {
    if (selectedRating === 0) {
        alert('请选择评分');
        return;
    }
    
    const comment = document.getElementById('reviewComment').value.trim();
    // const currentUser = JSON.parse(localStorage.getItem('current_user'));
	const userId = localStorage.getItem('user_id');
	    if (!userId) {
	        showError('用户未登录，请先登录');
	        window.location.href = '../login/login.html';
	        return;
	    };
    
    try {
        const response = await fetch('http://localhost:8080/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                orderId: null, // 如果需要关联订单，这里需要修改
                reviewerId: userId,
                targetType: 'restaurant',
                targetId: restaurantId,
                rating: selectedRating,
                comment: comment
            })
        });
        
        if (!response.ok) throw new Error('提交评价失败');
        
        const result = await response.json();
        if (response.ok) {
            alert('评价成功');
            closeReviewModal();
            loadReviews(); // 重新加载评论
        } else {
            throw new Error(result.msg您已评价 || '提交评价失败');
        }
    } catch (error) {
        console.error('提交评价失败:', error);
        alert('提交评价失败，请重试.您可能已经评价');
    }
}

// 日期格式化函数
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}
