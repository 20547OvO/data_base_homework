// 全局变量
let restaurantId = null;
let chart = null;
let salesData = [];
let restaurantInfo = {};

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 获取餐馆ID
    restaurantId = localStorage.getItem('analytics_restaurant_id');
    
    if (!restaurantId) {
        console.error('未检测到餐馆ID');
        showErrorMessage('请先选择要查看的餐厅');
        return;
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
    chart = echarts.init(chartContainer);
    
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
        
        // 获取餐厅信息
        await fetchRestaurantInfo();
        
        // 获取菜品销售数据
        await fetchDishSalesData(timeRange);
        
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
            
            // 处理数据
            processData(data.data || []);
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
        
        orders.data.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    if (item.dish && item.dish.dishId) {
                        const dishId = item.dish.dishId;
                        if (!dishSalesMap[dishId]) {
                            dishSalesMap[dishId] = {
                                dishId: dishId,
                                name: item.dish.name,
                                price: item.dish.price,
                                sales: 0,
                                revenue: 0
                            };
                        }
                        
                        dishSalesMap[dishId].sales += item.quantity || 0;
                        dishSalesMap[dishId].revenue += (item.price || 0) * (item.quantity || 0);
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
        throw new Error('无法获取菜品销售数据: ' + error.message);
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
    console.log('处理数据');
    
    // 确保数据格式正确
    if (!Array.isArray(data)) {
        console.error('数据格式错误，期望数组但得到:', typeof data);
        salesData = [];
        return;
    }
    
    // 为每个菜品添加颜色
    const coloredData = data.map((item, index) => {
        return {
            ...item,
            color: getColorByIndex(index)
        };
    });
    
    // 更新全局变量
    salesData = coloredData;
    
    // 计算统计数据
    const totalItems = salesData.reduce((sum, item) => sum + (item.quantity || item.sales || 0), 0);
    const totalRevenue = salesData.reduce((sum, item) => sum + (item.revenue || (item.quantity || item.sales || 0) * (item.price || 0)), 0);
    
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

// 更新统计信息
function updateStatistics(dishData, totalItems, totalRevenue) {
    try {
        // 计算平均价格
        const avgPrice = totalItems > 0 ? (totalRevenue / totalItems).toFixed(2) : '0.00';
        
        // 获取销售最多的菜品
        let topSellingDish = '';
        let maxSales = 0;
        
        dishData.forEach(item => {
            const sales = item.quantity || item.sales || 0;
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
        const totalSalesEl = document.getElementById('total-sales') || document.getElementById('totalDishes');
        if (totalSalesEl) {
            totalSalesEl.textContent = totalItems.toLocaleString();
        }
        
        // 总销售额
        const totalRevenueEl = document.getElementById('total-revenue') || document.getElementById('totalRevenue');
        if (totalRevenueEl) {
            totalRevenueEl.textContent = totalRevenue.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }).replace('CN¥', '¥');
        }
        
        // 平均价格
        const avgPriceEl = document.getElementById('avg-price');
        if (avgPriceEl) {
            avgPriceEl.textContent = avgPrice;
        }
        
        // 最受欢迎菜品
        const topDishEl = document.getElementById('top-dish') || document.getElementById('topDish');
        if (topDishEl) {
            topDishEl.textContent = topSellingDish || '无数据';
        }
        
        // 平均每日销量
        const avgDailyEl = document.getElementById('avg-daily') || document.getElementById('avgDaily');
        if (avgDailyEl) {
            avgDailyEl.textContent = avgDaily;
        }
        
    } catch (error) {
        console.error('更新统计数据时出错:', error);
        
        // 显示默认值
        (document.getElementById('total-sales') || document.getElementById('totalDishes'))?.textContent = '0';
        (document.getElementById('total-revenue') || document.getElementById('totalRevenue'))?.textContent = '¥0';
        document.getElementById('avg-price')?.textContent = '0.00';
        (document.getElementById('top-dish') || document.getElementById('topDish'))?.textContent = '无数据';
        (document.getElementById('avg-daily') || document.getElementById('avgDaily'))?.textContent = '0';
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