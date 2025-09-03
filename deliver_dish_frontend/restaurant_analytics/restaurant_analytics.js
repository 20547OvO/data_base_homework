// 全局变量
let restaurantId = null;
let chart = null;
let salesData = [];
let restaurantInfo = {};

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 获取餐馆ID
    restaurantId = localStorage.getItem('analytics_restaurant_id');
    
    // 如果没有restaurantId，设置一个默认值以继续加载mock数据
    if (!restaurantId) {
        console.warn('未检测到餐馆ID，使用演示模式');
        // 可以设置一个默认值，不影响使用mock数据
        restaurantId = 'demo';
    }
    
    // 初始化图表
    initChart();
    
    // 加载数据
    loadData();
    
    // 设置事件监听
    if (document.getElementById('refreshBtn')) {
        document.getElementById('refreshBtn').addEventListener('click', loadData);
    }
    
    if (document.getElementById('timeRange')) {
        document.getElementById('timeRange').addEventListener('change', loadData);
    }
    
    if (document.getElementById('sortBy')) {
        document.getElementById('sortBy').addEventListener('change', renderChart);
    }
    
    // 饼图和条形图切换功能
    if (document.getElementById('viewPie')) {
        document.getElementById('viewPie').addEventListener('click', function() {
            this.classList.add('active');
            document.getElementById('viewBar').classList.remove('active');
            renderChart('pie');
        });
    }
    
    if (document.getElementById('viewBar')) {
        document.getElementById('viewBar').addEventListener('click', function() {
            this.classList.add('active');
            document.getElementById('viewPie').classList.remove('active');
            renderChart('bar');
        });
    }
});

// 初始化图表
function initChart() {
    // 确保图表容器存在
    const chartContainer = document.getElementById('salesChart');
    if (!chartContainer) {
        console.error('图表容器不存在');
        return;
    }
    
    // 如果图表已存在，先销毁
    if (chart && !chart.isDisposed()) {
        chart.dispose();
    }
    
    // 初始化图表
    try {
        chart = echarts.init(chartContainer);
    } catch (error) {
        console.error('ECharts初始化失败:', error);
        // 如果ECharts不可用，设置一个简单的占位符
        chartContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">图表加载失败</div>';
        return;
    }
    
    // 响应窗口大小变化
    window.addEventListener('resize', function() {
        if (chart && !chart.isDisposed()) {
            chart.resize();
        }
    });
    
    console.log('图表初始化完成');
}

// 加载数据
async function loadData() {
    console.log('开始加载数据');
    
    try {
        // 重置全局数据
        salesData = [];
        restaurantInfo = {};
        
        // 显示加载状态
        const chartContainer = document.getElementById('salesChart');
        if (chartContainer) {
            // 不要直接清空容器，因为ECharts实例在里面
            chart.setOption({
                title: {
                    text: '加载中...',
                    left: 'center',
                    textStyle: {
                        color: '#999'
                    }
                },
                series: []
            });
        }
        
        // 获取时间范围
        const timeRange = document.getElementById('timeRange')?.value || '30';
        
        try {
            // 获取餐厅信息
            await fetchRestaurantInfo();
            
            // 获取菜品销售数据
            await fetchDishSalesData(timeRange);
        } catch (dataError) {
            console.warn('实际数据获取失败，使用mock数据:', dataError);
            // 使用mock数据
            useMockData(timeRange);
        }
        
    } catch (error) {
        console.error('加载数据失败:', error);
        // 显示错误信息
        showErrorMessage('数据加载失败: ' + error.message);
    }
}

// 获取餐厅信息
async function fetchRestaurantInfo() {
    try {
        const response = await fetch(`http://localhost:8080/api/restaurants/${restaurantId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            restaurantInfo = data.data || {};
            console.log('成功获取餐厅信息:', restaurantInfo);
            
            // 更新页面上的餐厅信息
            updateRestaurantInfo();
        } else {
            console.error('获取餐厅信息失败，状态码:', response.status);
            throw new Error('获取餐厅信息失败');
        }
    } catch (error) {
        console.error('获取餐厅信息时出错:', error);
        throw new Error('获取餐厅信息时出错: ' + error.message);
    }
}

// 获取菜品销售数据
async function fetchDishSalesData(timeRange) {
    try {
        // 这里假设有一个API端点可以获取菜品销售数据
        // 实际实现需要根据后端API调整
        const response = await fetch(`http://localhost:8080/api/restaurants/${restaurantId}/dish-sales?days=${timeRange}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('成功获取菜品销售数据:', data);
            
            // 处理数据 - 确保兼容不同的后端返回格式
            if (data.data && Array.isArray(data.data)) {
                processData(data.data);
            } else {
                console.warn('数据格式不符合预期，但尝试处理:', data);
                processData(Array.isArray(data) ? data : []);
            }
        } else {
            console.error('获取菜品销售数据失败，状态码:', response.status);
            
            // 如果没有专门的API，尝试从订单数据中计算
            await calculateDishSalesFromOrders(timeRange);
        }
    } catch (error) {
        console.error('获取菜品销售数据时出错:', error);
        
        // 尝试从订单数据中计算
        await calculateDishSalesFromOrders(timeRange);
    }
}

// 从订单数据计算菜品销量
async function calculateDishSalesFromOrders(timeRange) {
    try {
        // 获取餐厅的所有订单
        const response = await fetch(`http://localhost:8080/api/orders/restaurant/${restaurantId}?days=${timeRange}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('获取订单数据失败');
        }
        
        const orders = await response.json();
        console.log('成功获取订单数据:', orders);
        
        // 计算每个菜品的销量
        const dishSalesMap = {};
        
        // 处理不同格式的订单数据
        const orderItems = orders.data && Array.isArray(orders.data) ? orders.data : 
                          Array.isArray(orders) ? orders : [];
        
        orderItems.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    // 兼容直接包含dishId的情况
                    const dishId = item.dishId || (item.dish && item.dish.dishId);
                    const dishName = item.dishName || (item.dish && item.dish.name);
                    const dishPrice = item.price || (item.dish && item.dish.price);
                    const quantity = item.quantity || 0;
                    
                    if (dishId && dishName) {
                        if (!dishSalesMap[dishId]) {
                            dishSalesMap[dishId] = {
                                dishId: dishId,
                                name: dishName,
                                price: dishPrice || 0,
                                sales: 0,
                                revenue: 0
                            };
                        }
                        
                        dishSalesMap[dishId].sales += quantity;
                        dishSalesMap[dishId].revenue += (dishPrice || 0) * quantity;
                    }
                });
            }
        });
        
        // 转换为数组
        const dishSales = Object.values(dishSalesMap);
        console.log('计算出的菜品销售数据:', dishSales);
        
        // 处理数据
        processData(dishSales);
    } catch (error) {
        console.error('从订单计算菜品销量时出错:', error);
        // 显示友好错误信息而不是抛出异常，以免中断其他功能
        showErrorMessage('无法获取菜品销售数据: ' + error.message);
    }
}

// 更新页面上的餐厅信息
function updateRestaurantInfo() {
    try {
        const restaurantNameEl = document.querySelector('.restaurant-name');
        if (restaurantNameEl) {
            restaurantNameEl.textContent = `${restaurantInfo.name || '餐厅'} - 菜品销量分析`;
        }
        
        // 更新数据统计时间
        const timeRange = document.getElementById('timeRange')?.value || '30';
        const timeTextEl = document.querySelector('.restaurant-info p');
        if (timeTextEl) {
            // 计算日期范围
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - parseInt(timeRange));
            
            const formatDate = (date) => {
                return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            };
            
            timeTextEl.textContent = `数据统计时间: ${formatDate(startDate)} - ${formatDate(endDate)}`;
        }
        
        // 更新页脚更新时间
        const footerEl = document.querySelector('.footer p');
        if (footerEl && footerEl.textContent.includes('数据更新于:')) {
            const now = new Date();
            const updateTime = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            footerEl.textContent = `© 2023 美食送 - 餐馆数据分析系统 | 数据更新于: ${updateTime}`;
        }
    } catch (error) {
        console.error('更新餐厅信息时出错:', error);
    }
}

// 处理实际数据
function processData(data) {
    console.log('处理数据:', data);
    
    // 确保数据格式正确
    if (!Array.isArray(data)) {
        console.error('数据格式错误，期望数组但得到:', typeof data);
        salesData = [];
        return;
    }
    
    // 标准化数据格式 - 确保每个项目都有正确的字段
    const normalizedData = data.map((item, index) => {
        // 标准化字段名
        const sales = item.quantity || item.sales || 0;
        const revenue = item.revenue || (sales * (item.price || 0));
        
        return {
            ...item,
            name: item.name || item.dishName || `菜品${index + 1}`,
            sales: sales,
            quantity: sales, // 同时保留两个字段以兼容不同调用方
            price: item.price || 0,
            revenue: revenue,
            color: getColorByIndex(index)
        };
    });
    
    // 更新全局变量
    salesData = normalizedData;
    
    // 计算统计数据
    const totalItems = salesData.reduce((sum, item) => sum + item.sales, 0);
    const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
    
    // 更新统计信息
    updateStatistics(salesData, totalItems, totalRevenue);
    
    // 填充菜品表格
    populateDishesTable(salesData);
    
    // 渲染图表
    renderChart();
}

// 根据索引获取颜色
function getColorByIndex(index) {
    const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#6e7079'];
    return colors[index % colors.length];
}

// 填充菜品表格
function populateDishesTable(data) {
    try {
        const tableBody = document.getElementById('dishesTableBody');
        if (!tableBody) {
            console.warn('菜品表格不存在');
            return;
        }
        
        // 清空表格
        tableBody.innerHTML = '';
        
        // 按销量排序
        const sortedData = [...data].sort((a, b) => {
            const salesA = a.quantity || a.sales || 0;
            const salesB = b.quantity || b.sales || 0;
            return salesB - salesA;
        });
        
        // 计算总销量
        const totalSales = sortedData.reduce((sum, item) => sum + (item.quantity || item.sales || 0), 0);
        
        // 填充表格行
        sortedData.forEach((dish, index) => {
            const sales = dish.quantity || dish.sales || 0;
            const price = dish.price || 0;
            const percentage = totalSales > 0 ? ((sales / totalSales) * 100).toFixed(1) : '0.0';
            const color = dish.color || getColorByIndex(index);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="rank ${index < 3 ? 'rank-' + (index + 1) : ''}">${index + 1}</span></td>
                <td>${dish.name || '未知菜品'}</td>
                <td>¥${price.toFixed(2)}</td>
                <td>${sales}</td>
                <td>
                    ${percentage}%
                    <div class="sales-bar">
                        <div class="sales-progress" style="width: ${percentage}%; background-color: ${color}"></div>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('填充菜品表格时出错:', error);
    }
}

// 显示错误信息
function showErrorMessage(message) {
    console.error(message);
    // 可以添加UI提示
    if (chart && !chart.isDisposed()) {
        chart.setOption({
            title: {
                text: message,
                left: 'center',
                textStyle: {
                    color: '#ff6b6b'
                }
            }
        });
    }
}

// 使用mock数据
function useMockData(timeRange) {
    console.log('使用mock数据，时间范围:', timeRange);
    
    // 设置mock餐厅信息
    restaurantInfo = {
        name: '示例餐厅',
        address: '示例地址',
        phone: '1234567890'
    };
    
    // 更新页面上的餐厅信息
    updateRestaurantInfo();
    
    // 生成mock销售数据
    const mockDishes = [
        { name: '麻婆豆腐', price: 28, sales: Math.floor(Math.random() * 100) + 50, dishId: 1 },
        { name: '宫保鸡丁', price: 32, sales: Math.floor(Math.random() * 100) + 50, dishId: 2 },
        { name: '水煮鱼', price: 88, sales: Math.floor(Math.random() * 80) + 40, dishId: 3 },
        { name: '回锅肉', price: 42, sales: Math.floor(Math.random() * 90) + 45, dishId: 4 },
        { name: '鱼香肉丝', price: 36, sales: Math.floor(Math.random() * 95) + 48, dishId: 5 },
        { name: '青椒土豆丝', price: 18, sales: Math.floor(Math.random() * 120) + 60, dishId: 6 },
        { name: '红烧肉', price: 58, sales: Math.floor(Math.random() * 70) + 35, dishId: 7 },
        { name: '糖醋排骨', price: 68, sales: Math.floor(Math.random() * 60) + 30, dishId: 8 },
        { name: '西红柿鸡蛋汤', price: 22, sales: Math.floor(Math.random() * 85) + 42, dishId: 9 },
        { name: '担担面', price: 16, sales: Math.floor(Math.random() * 110) + 55, dishId: 10 }
    ];
    
    // 计算收入
    mockDishes.forEach(dish => {
        dish.revenue = dish.price * dish.sales;
    });
    
    // 处理数据
    processData(mockDishes);
}

// 更新统计信息
function updateStatistics(dishData, totalItems, totalRevenue) {
    try {
        // 计算平均价格
        const avgPrice = totalItems > 0 ? (totalRevenue / totalItems).toFixed(2) : '0.00';
        
        // 获取销售最多的菜品
        let topSellingDish = '';
        let maxSales = 0;
        
        dishData.forEach(item => {
            const sales = item.sales;
            if (sales > maxSales) {
                maxSales = sales;
                topSellingDish = item.name;
            }
        });
        
        // 计算并更新平均每日销量
        const timeRange = document.getElementById('timeRange')?.value || '30';
        const days = parseInt(timeRange) || 30;
        const avgDaily = Math.round(totalItems / days);
        
        // 更新统计卡片数据
        // 总销量
        const totalSalesEl = document.getElementById('total-sales');
        if (totalSalesEl) {
            totalSalesEl.textContent = totalItems.toLocaleString();
        }
        
        // 总销售额
        const totalRevenueEl = document.getElementById('total-revenue');
        if (totalRevenueEl) {
            totalRevenueEl.textContent = totalRevenue.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }).replace('CN¥', '¥');
        }
        
        // 平均价格
        const avgPriceEl = document.getElementById('avg-price');
        if (avgPriceEl) {
            avgPriceEl.textContent = '¥' + avgPrice; // 确保显示货币符号
        }
        
        // 最受欢迎菜品
        const topDishEl = document.getElementById('top-dish');
        if (topDishEl) {
            topDishEl.textContent = topSellingDish || '无数据';
        }
        
        // 平均每日销量
        const avgDailyEl = document.getElementById('avg-daily');
        if (avgDailyEl) {
            avgDailyEl.textContent = avgDaily;
        }
        
    } catch (error) {
        console.error('更新统计数据时出错:', error);
        
        // 显示默认值
        document.getElementById('total-sales')?.textContent = '0';
        document.getElementById('total-revenue')?.textContent = '¥0';
        document.getElementById('avg-price')?.textContent = '¥0.00';
        document.getElementById('top-dish')?.textContent = '无数据';
        document.getElementById('avg-daily')?.textContent = '0';
    }
}

// 渲染图表
function renderChart(chartTypeParam) {
    console.log('开始渲染图表');
    
    // 设置当前图表类型（从参数或UI状态获取）
    let currentChartType = chartTypeParam || 'pie';
    if (!chartTypeParam) {
        // 从UI状态获取当前图表类型
        if (document.getElementById('viewBar') && document.getElementById('viewBar').classList.contains('active')) {
            currentChartType = 'bar';
        }
    }
    
    // 确保图表实例存在
    if (!chart || chart.isDisposed()) {
        initChart();
    }
    
    // 确保有数据
    if (!salesData || salesData.length === 0) {
        console.warn('没有销售数据可供渲染');
        chart.setOption({
            title: {
                text: '暂无数据',
                left: 'center',
                textStyle: {
                    color: '#999'
                }
            }
        });
        return;
    }
    
    // 根据排序方式对数据进行排序
    let sortedData = [...salesData];
    const sortBy = document.getElementById('sortBy')?.value || 'quantity';
    
    if (sortBy === 'quantity' || sortBy === 'sales') {
        sortedData.sort((a, b) => {
            const salesA = a.quantity || a.sales || 0;
            const salesB = b.quantity || b.sales || 0;
            return salesB - salesA;
        });
    } else if (sortBy === 'name') {
        sortedData.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'revenue') {
        sortedData.sort((a, b) => {
            const revA = a.revenue || (a.quantity || a.sales || 0) * (a.price || 0);
            const revB = b.revenue || (b.quantity || b.sales || 0) * (b.price || 0);
            return revB - revA;
        });
    }
    
    // 准备图表数据
    const chartData = sortedData.map(item => ({
        name: item.name || '未知菜品',
        value: item.quantity || item.sales || 0,
        itemStyle: {
            color: item.color || getColorByIndex(0)
        },
        // 添加额外信息用于tooltip
        price: item.price || 0,
        revenue: item.revenue || 0
    }));
    
    // 图表配置
    let option = {
        title: {
            text: currentChartType === 'pie' ? '菜品销量分布' : '菜品销量排行',
            left: 'center',
            textStyle: {
                fontSize: 18,
                fontWeight: 'bold'
            }
        },
        tooltip: {
            trigger: currentChartType === 'pie' ? 'item' : 'axis',
            formatter: function(params) {
                if (currentChartType === 'pie') {
                    // 饼图tooltip
                    const data = params.data;
                    const totalRevenue = data.revenue > 0 ? data.revenue : (data.value * data.price);
                    return `${data.name}<br/>销量: ${data.value}<br/>单价: ¥${data.price.toFixed(2)}<br/>销售额: ¥${totalRevenue.toLocaleString()}<br/>占比: ${params.percent}%`;
                } else {
                    // 柱状图tooltip
                    return `${params[0].name}<br/>销量: ${params[0].value}`;
                }
            }
        },
        legend: {
            show: currentChartType === 'pie',
            orient: 'vertical',
            right: 10,
            top: 'center',
            type: 'scroll',
            pageTextStyle: {
                color: '#333'
            },
            textStyle: {
                fontSize: 12
            }
        },
        grid: {
            show: currentChartType !== 'pie',
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: currentChartType !== 'pie' ? {
            type: 'value',
            axisLabel: {
                formatter: '{value}'
            }
        } : {},
        yAxis: currentChartType !== 'pie' ? {
            type: 'category',
            data: chartData.slice(0, 10).map(item => item.name),
            axisLabel: {
                fontSize: 12,
                interval: 0
            }
        } : {},
        series: []
    };
    
    // 根据图表类型添加series
    if (currentChartType === 'pie') {
        option.series.push({
            name: '销量',
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
            data: chartData
        });
    } else {
        // 柱状图，按销量排序并只显示前10个
        const barData = [...chartData].sort((a, b) => b.value - a.value).slice(0, 10);
        option.series.push({
            name: '销量',
            type: 'bar',
            data: barData.map(item => item.value),
            itemStyle: {
                color: function(params) {
                    return barData[params.dataIndex].itemStyle.color;
                }
            },
            label: {
                show: true,
                position: 'right',
                formatter: '{c}'
            },
            barWidth: '60%'
        });
    }
    
    // 应用图表配置
    chart.setOption(option, true);
    console.log('图表渲染完成');
}