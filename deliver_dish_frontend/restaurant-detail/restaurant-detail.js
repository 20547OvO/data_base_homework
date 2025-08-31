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
        document.getElementById('restaurantRating').textContent = getStarRating(restaurant.rating || 0) + ' ' + (restaurant.rating || 0).toFixed(1);
        document.getElementById('deliveryFee').textContent = `配送费 ¥${restaurant.deliveryFee || 0}`;
        document.getElementById('deliveryTime').textContent = `${restaurant.deliveryTime || 0}分钟`;
        document.getElementById('minOrder').textContent = `起送 ¥${restaurant.minOrder || 0}`;
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
