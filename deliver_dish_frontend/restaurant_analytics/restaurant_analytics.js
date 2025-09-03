// 全局变量
let restaurantId = null;
let chart = null;
let ordersData = [];

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 获取餐馆ID
    restaurantId = localStorage.getItem('analytics_restaurant_id');
    
    if (!restaurantId) {
        alert('未选择餐馆，请返回管理页面选择餐馆');
        window.location.href = 'owner_home.html';
        return;
    }
    
    // 初始化图表
    initChart();
    
    // 加载数据
    loadData();
    
    // 设置事件监听
    document.getElementById('refreshBtn').addEventListener('click', loadData);
    document.getElementById('timeRange').addEventListener('change', loadData);
    document.getElementById('sortBy').addEventListener('change', renderChart);
});

// 初始化图表
function initChart() {
    const chartDom = document.getElementById('chartContainer');
    chart = echarts.init(chartDom);
    
    const option = {
        title: {
            text: '菜品销售数量分布',
            left: 'center',
            top: 10
        },
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            top: 'middle',
            type: 'scroll',
            pageTextStyle: {
                color: '#333'
            }
        },
        series: [
            {
                name: '销售数量',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '18',
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: []
            }
        ]
    };
    
    chart.setOption(option);
    
    // 响应窗口大小变化
    window.addEventListener('resize', function() {
        chart.resize();
    });
}

// 加载数据
async function loadData() {
    try {
        document.getElementById('chartContainer').innerHTML = '<div class="loading">加载中...</div>';
        
        // 获取订单数据
        const response = await fetch(`http://localhost:8080/api/orders/restaurant/${restaurantId}`);
        const data = await response.json();
        
        if (data.success) {
            ordersData = data.data || [];
            processData();
        } else {
            throw new Error(data.message || '获取数据失败');
        }
    } catch (error) {
        console.error('加载数据失败:', error);
        document.getElementById('chartContainer').innerHTML = `
            <div class="loading">
                <p>数据加载失败</p>
                <p>${error.message}</p>
                <button onclick="loadData()">重试</button>
            </div>
        `;
        
        // 如果API调用失败，使用模拟数据
        processMockData();
    }
}

// 处理数据
function processData() {
    const timeRange = document.getElementById('timeRange').value;
    const now = new Date();
    let startDate = new Date(0); // 默认全部时间
    
    if (timeRange !== 'all') {
        const days = parseInt(timeRange);
        startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    }
    
    // 过滤订单数据
    const filteredOrders = ordersData.filter(order => {
        if (timeRange === 'all') return true;
        
        const orderDate = new Date(order.create_time);
        return orderDate >= startDate;
    });
    
    // 统计菜品销售数据
    const dishSales = {};
    let totalRevenue = 0;
    let totalItems = 0;
    
    filteredOrders.forEach(order => {
        if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
                if (!dishSales[item.dishId]) {
                    dishSales[item.dishId] = {
                        name: item.dishName,
                        quantity: 0,
                        revenue: 0
                    };
                }
                
                dishSales[item.dishId].quantity += item.quantity;
                dishSales[item.dishId].revenue += item.price * item.quantity;
                
                totalItems += item.quantity;
                totalRevenue += item.price * item.quantity;
            });
        }
    });
    
    // 转换为数组并排序
    const sortBy = document.getElementById('sortBy').value;
    let dishData = Object.values(dishSales);
    
    if (sortBy === 'quantity') {
        dishData.sort((a, b) => b.quantity - a.quantity);
    } else if (sortBy === 'name') {
        dishData.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    // 更新统计数据
    updateStatistics(dishData, totalItems, totalRevenue, filteredOrders.length);
    
    // 渲染图表
    renderChart(dishData);
}

// 渲染图表
function renderChart(dishData) {
    if (!dishData) {
        // 如果没有传入数据，重新处理数据
        processData();
        return;
    }
    
    const chartData = dishData.map(item => ({
        value: item.quantity,
        name: item.name
    }));
    
    const option = {
        series: [{
            data: chartData
        }]
    };
    
    chart.setOption(option);
    
    // 隐藏加载提示
    document.getElementById('chartContainer').innerHTML = '';
    document.getElementById('chartContainer').appendChild(chart.getDom());
}

// 更新统计数据
function updateStatistics(dishData, totalItems, totalRevenue, orderCount) {
    document.getElementById('totalDishes').textContent = totalItems;
    document.getElementById('totalRevenue').textContent = `¥${totalRevenue.toFixed(2)}`;
    
    if (dishData.length > 0) {
        const topDish = dishData.reduce((prev, current) => 
            (prev.quantity > current.quantity) ? prev : current
        );
        document.getElementById('topDish').textContent = topDish.name;
    } else {
        document.getElementById('topDish').textContent = '-';
    }
    
    // 计算平均每日销量
    const timeRange = document.getElementById('timeRange').value;
    let days = 1;
    
    if (timeRange !== 'all') {
        days = parseInt(timeRange);
    } else if (ordersData.length > 0) {
        // 如果有订单数据，计算从第一单到现在的时间
        const firstOrder = ordersData.reduce((prev, current) => 
            new Date(prev.create_time) < new Date(current.create_time) ? prev : current
        );
        
        const firstDate = new Date(firstOrder.create_time);
        const now = new Date();
        days = Math.max(1, Math.ceil((now - firstDate) / (1000 * 60 * 60 * 24)));
    }
    
    const avgDaily = Math.round(totalItems / days);
    document.getElementById('avgDaily').textContent = avgDaily;
}

// 使用模拟数据（备用）
function processMockData() {
    const mockDishData = [
        { name: '宫保鸡丁', quantity: 125, revenue: 4750 },
        { name: '麻婆豆腐', quantity: 98, revenue: 3136 },
        { name: '水煮鱼', quantity: 76, revenue: 4560 },
        { name: '回锅肉', quantity: 64, revenue: 3200 },
        { name: '鱼香肉丝', quantity: 52, revenue: 2600 },
        { name: '辣子鸡', quantity: 43, revenue: 3010 },
        { name: '蒜泥白肉', quantity: 37, revenue: 1665 },
        { name: '其他菜品', quantity: 85, revenue: 3825 }
    ];
    
    const totalItems = mockDishData.reduce((sum, item) => sum + item.quantity, 0);
    const totalRevenue = mockDishData.reduce((sum, item) => sum + item.revenue, 0);
    
    updateStatistics(mockDishData, totalItems, totalRevenue, 50);
    renderChart(mockDishData);
}