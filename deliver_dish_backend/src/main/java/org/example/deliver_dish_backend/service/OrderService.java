package org.example.deliver_dish_backend.service;

import org.example.deliver_dish_backend.model.dto.OrderDTO;
import org.example.deliver_dish_backend.model.dto.OrderItemDTO;
import org.example.deliver_dish_backend.model.dto.RestaurantSalesSummaryDTO;
import org.example.deliver_dish_backend.model.entity.*;
import org.example.deliver_dish_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private DishRepository dishRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public List<Order> getOrdersByCustomerId(Long customerId) {
        return orderRepository.findByCustomer_UserId(customerId);
    }

    public List<OrderDTO> getCurrentOrdersByCustomerId(Long customerId) {
        List<Order> orders = orderRepository.findByCustomer_UserIdAndStatusIn(
                customerId,
                List.of(Order.OrderStatus.CREATED, Order.OrderStatus.ACCEPTED, Order.OrderStatus.DELIVERING)
        );

        return orders.stream().map(order -> {
            OrderDTO dto = new OrderDTO();
            dto.setOrderId(order.getOrderId());
            dto.setStatus(order.getStatus().name());
            dto.setRestaurantName(order.getRestaurant().getName());
            dto.setCustomerId(order.getCustomer().getUserId());
            dto.setTotalPrice(order.getTotalPrice());
            // ✅ 转换 OrderItem -> OrderItemDTO
            List<OrderItemDTO> itemDTOs = order.getItems().stream().map(item -> {
                OrderItemDTO itemDTO = new OrderItemDTO();
                itemDTO.setItemId(item.getItemId());
                itemDTO.setDishName(item.getDish().getName());
                itemDTO.setQuantity(item.getQuantity());
                itemDTO.setPrice(item.getPrice());
                return itemDTO;
            }).collect(Collectors.toList());

            dto.setItems(itemDTOs);
            return dto;
        }).collect(Collectors.toList());
    }


    public List<OrderDTO> getHistoryOrdersByCustomerId(Long customerId) {
        List<Order> orders = orderRepository.findByCustomer_UserIdAndStatusIn(
                customerId,
                List.of(Order.OrderStatus.COMPLETED, Order.OrderStatus.CANCELLED)
        );
        return orders.stream().map(order -> {
            OrderDTO dto = new OrderDTO();
            dto.setOrderId(order.getOrderId());
            dto.setRestaurantId(order.getRestaurant().getRestaurantId());
            System.out.println("本次设定的餐馆id为"+order.getRestaurant().getRestaurantId());
            dto.setStatus(order.getStatus().name());
            dto.setRestaurantName(order.getRestaurant().getName());
            dto.setCustomerId(order.getCustomer().getUserId());
            dto.setTotalPrice(order.getTotalPrice());
            dto.setCreateTime(order.getCreateTime());
            // ✅ 转换 OrderItem -> OrderItemDTO
            List<OrderItemDTO> itemDTOs = order.getItems().stream().map(item -> {
                OrderItemDTO itemDTO = new OrderItemDTO();
                itemDTO.setItemId(item.getItemId());
                itemDTO.setDishName(item.getDish().getName());
                itemDTO.setQuantity(item.getQuantity());
                itemDTO.setPrice(item.getPrice());
                return itemDTO;
            }).collect(Collectors.toList());

            dto.setItems(itemDTOs);
            return dto;
        }).collect(Collectors.toList());
    }
    public List<OrderDTO> getOrdersByStatus(Order.OrderStatus status) {
        List<Order> orders=orderRepository.findByStatus(status);
        return orders.stream().map(order -> {
            OrderDTO dto = new OrderDTO();
            dto.setOrderId(order.getOrderId());
            dto.setStatus(order.getStatus().name());
            dto.setRestaurantName(order.getRestaurant().getName());
            dto.setCustomerId(order.getCustomer().getUserId());
            dto.setTotalPrice(order.getTotalPrice());
            dto.setCreateTime(order.getCreateTime());
            dto.setDeliverAdd(order.getDeliverAdd());
            dto.setPhone(order.getPhone());
            dto.setDeliverName(order.getDeliverName());
            dto.setAddress(order.getRestaurant().getAddress());
            // ✅ 转换 OrderItem -> OrderItemDTO
            List<OrderItemDTO> itemDTOs = order.getItems().stream().map(item -> {
                OrderItemDTO itemDTO = new OrderItemDTO();
                itemDTO.setItemId(item.getItemId());
                itemDTO.setDishName(item.getDish().getName());
                itemDTO.setQuantity(item.getQuantity());
                itemDTO.setPrice(item.getPrice());
                return itemDTO;
            }).collect(Collectors.toList());

            dto.setItems(itemDTOs);
            return dto;
        }).collect(Collectors.toList());
//        return orderRepository.findByStatus(status);
    }

    public List<OrderDTO> getOrdersByRestaurantId(Long restaurantId) {
        System.out.println("这次寻找的餐馆id为"+restaurantId);
        List<Order> orders=orderRepository.findByRestaurant_RestaurantId(restaurantId);
        return orders.stream().map(order -> {
            OrderDTO dto = new OrderDTO();
            dto.setCustomerId(order.getCustomer().getUserId());
            dto.setOrderId(order.getOrderId());
            System.out.println("aaaacusid"+order.getCustomer().getUserId());
            dto.setStatus(order.getStatus().name());
            System.out.println("这次的订单转台为"+order.getStatus().name());
            dto.setOrderId(order.getOrderId());
            dto.setCreateTime(order.getCreateTime());
            dto.setStatus(order.getStatus().name());
            dto.setRestaurantName(order.getRestaurant().getName());
            dto.setCustomerId(order.getCustomer().getUserId());
            dto.setTotalPrice(order.getTotalPrice());
            // ✅ 转换 OrderItem -> OrderItemDTO
            List<OrderItemDTO> itemDTOs = order.getItems().stream().map(item -> {
                OrderItemDTO itemDTO = new OrderItemDTO();
                itemDTO.setItemId(item.getItemId());
                itemDTO.setDishName(item.getDish().getName());
                itemDTO.setQuantity(item.getQuantity());
                itemDTO.setPrice(item.getPrice());
                return itemDTO;
            }).collect(Collectors.toList());

            dto.setItems(itemDTOs);
            return dto;
        }).collect(Collectors.toList());
    }

    public List<OrderDTO> getOrdersByRiderId(Long riderId) {
        List<Order> orders=orderRepository.findByRider_UserId(riderId);
        return orders.stream().map(order -> {
            OrderDTO dto = new OrderDTO();
            dto.setDeliverAdd(order.getDeliverAdd());
            dto.setAddress(order.getRestaurant().getAddress());
            dto.setPhone(order.getPhone());
            dto.setDeliverName(order.getDeliverName());
            dto.setOrderId(order.getOrderId());
            dto.setStatus(order.getStatus().name());
            dto.setRestaurantName(order.getRestaurant().getName());
            dto.setCustomerId(order.getCustomer().getUserId());
            dto.setTotalPrice(order.getTotalPrice());
            dto.setCreateTime(order.getCreateTime());
            // ✅ 转换 OrderItem -> OrderItemDTO
            List<OrderItemDTO> itemDTOs = order.getItems().stream().map(item -> {
                OrderItemDTO itemDTO = new OrderItemDTO();
                itemDTO.setItemId(item.getItemId());
                itemDTO.setDishName(item.getDish().getName());
                itemDTO.setQuantity(item.getQuantity());
                itemDTO.setPrice(item.getPrice());
                return itemDTO;
            }).collect(Collectors.toList());

            dto.setItems(itemDTOs);
            return dto;
        }).collect(Collectors.toList());
    }

    public List<OrderItem> getOrderItemsByOrderId(Long orderId) {
        return orderItemRepository.findByOrder_OrderId(orderId);
    }

    @Transactional
    public Order createOrder(OrderDTO orderDTO, List<OrderItemDTO> itemDTOs) {
        // 获取客户
        User customer = userRepository.findById(orderDTO.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + orderDTO.getCustomerId()));

        // 获取餐厅
        Restaurant restaurant = restaurantRepository.findById(orderDTO.getRestaurantId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found with id: " + orderDTO.getRestaurantId()));

        // 计算总价
        BigDecimal totalPrice = BigDecimal.ZERO;

        // 创建订单实体
        Order order = new Order();
        order.setCustomer(customer);
        order.setRestaurant(restaurant);
        order.setStatus(Order.OrderStatus.CREATED);
        order.setCreateTime(LocalDateTime.now());
        order.setDeliverName(orderDTO.getDeliverName());
        order.setDeliverAdd(orderDTO.getDeliverAdd());
        order.setPhone(orderDTO.getPhone());

        // 保存订单（先保存订单以获取ID）
        Order savedOrder = orderRepository.save(order);

        // 处理订单项
        for (OrderItemDTO itemDTO : itemDTOs) {
            Dish dish = dishRepository.findById(itemDTO.getDishId())
                    .orElseThrow(() -> new RuntimeException("Dish not found with id: " + itemDTO.getDishId()));

            // 计算单项价格
            BigDecimal itemPrice = dish.getPrice().multiply(BigDecimal.valueOf(itemDTO.getQuantity()));
            totalPrice = totalPrice.add(itemPrice);

            // 创建订单项实体
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setDish(dish);
            orderItem.setQuantity(itemDTO.getQuantity());
            orderItem.setPrice(itemPrice);

            // 保存订单项
            orderItemRepository.save(orderItem);

            // 减少库存
            dish.setStock(dish.getStock() - itemDTO.getQuantity());
            dishRepository.save(dish);
        }

        // 更新订单总价
        savedOrder.setTotalPrice(totalPrice);
        return orderRepository.save(savedOrder);
    }
    public Order updateOrderStatus(Long orderId, Order.OrderStatus status, Long riderId) {
        return orderRepository.findById(orderId).map(order -> {
            order.setStatus(status);

            // 如果有 riderId，则更新骑手信息
            if (riderId != null) {
                // 查找骑手用户
                User rider = userRepository.findById(riderId)
                        .orElseThrow(() -> new RuntimeException("骑手不存在，ID: " + riderId));

                // 确保用户是骑手角色
                if (rider.getRole() != User.Role.rider) {
                    throw new RuntimeException("用户不是骑手，ID: " + riderId);
                }

                order.setRider(rider);
            }

            return orderRepository.save(order);
        }).orElse(null);
    }

    /**
     * 统计特定餐厅的菜品销售数量
     * @param restaurantId 餐厅ID
     * @param startDate 开始日期（可选）
     * @param endDate 结束日期（可选）
     * @return 包含菜品销售统计信息的Map列表
     */
    public List<Map<String, Object>> getDishSalesStatistics(Long restaurantId, LocalDateTime startDate, LocalDateTime endDate) {
        // 获取餐厅的所有订单项
        List<OrderItem> orderItems = orderItemRepository.findByOrder_Restaurant_RestaurantId(restaurantId);
        
        // 如果提供了日期范围，则过滤订单项
        if (startDate != null && endDate != null) {
            orderItems = orderItems.stream()
                .filter(item -> {
                    LocalDateTime orderTime = item.getOrder().getCreateTime();
                    return !orderTime.isBefore(startDate) && !orderTime.isAfter(endDate);
                })
                .collect(Collectors.toList());
        }
        
        // 按菜品ID分组并计算销售数量
        Map<Long, Map<String, Object>> dishSalesMap = new HashMap<>();
        
        for (OrderItem item : orderItems) {
            Long dishId = item.getDish().getDishId();
            String dishName = item.getDish().getName();
            BigDecimal dishPrice = item.getDish().getPrice();
            int quantity = item.getQuantity();
            
            // 计算该订单项的销售额
            BigDecimal itemRevenue = dishPrice.multiply(BigDecimal.valueOf(quantity));
            
            if (dishSalesMap.containsKey(dishId)) {
                // 已存在该菜品，累加数量和销售额
                Map<String, Object> dishInfo = dishSalesMap.get(dishId);
                int currentQuantity = (int) dishInfo.get("quantity");
                BigDecimal currentRevenue = (BigDecimal) dishInfo.get("revenue");
                
                dishInfo.put("quantity", currentQuantity + quantity);
                dishInfo.put("revenue", currentRevenue.add(itemRevenue));
            } else {
                // 不存在该菜品，创建新的统计记录
                Map<String, Object> dishInfo = new HashMap<>();
                dishInfo.put("dishId", dishId);
                dishInfo.put("dishName", dishName);
                dishInfo.put("price", dishPrice);
                dishInfo.put("quantity", quantity);
                dishInfo.put("revenue", itemRevenue);
                
                dishSalesMap.put(dishId, dishInfo);
            }
        }
        
        // 转换为列表并排序（按销售数量降序）
        return dishSalesMap.values().stream()
            .sorted((a, b) -> ((Integer) b.get("quantity")).compareTo((Integer) a.get("quantity")))
            .collect(Collectors.toList());
    }

    /**
     * 获取特定餐厅的销售统计摘要
     * @param restaurantId 餐厅ID
     * @param startDate 开始日期（可选）
     * @param endDate 结束日期（可选）
     * @return 包含销售摘要信息的DTO对象
     */
    public RestaurantSalesSummaryDTO getSalesSummary(Long restaurantId, LocalDateTime startDate, LocalDateTime endDate) {
        // 获取菜品销售统计
        List<Map<String, Object>> dishSales = getDishSalesStatistics(restaurantId, startDate, endDate);
        
        // 计算总销售数量和总销售额
        int totalQuantity = dishSales.stream()
            .mapToInt(item -> (int) item.get("quantity"))
            .sum();
        
        BigDecimal totalRevenue = dishSales.stream()
            .map(item -> (BigDecimal) item.get("revenue"))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // 找出最畅销的菜品
        Map<String, Object> bestSellingDish = dishSales.isEmpty() ? null : dishSales.get(0);
        
        // 创建并返回DTO对象
        return new RestaurantSalesSummaryDTO(totalQuantity, totalRevenue, bestSellingDish, dishSales.size());
    }
    
    /**
     * 获取特定餐厅的销售统计摘要（兼容旧版本，返回Map格式）
     * @param restaurantId 餐厅ID
     * @param startDate 开始日期（可选）
     * @param endDate 结束日期（可选）
     * @return 包含销售摘要信息的Map
     */
    public Map<String, Object> getSalesSummaryAsMap(Long restaurantId, LocalDateTime startDate, LocalDateTime endDate) {
        RestaurantSalesSummaryDTO summaryDTO = getSalesSummary(restaurantId, startDate, endDate);
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalQuantity", summaryDTO.getTotalQuantity());
        summary.put("totalRevenue", summaryDTO.getTotalRevenue());
        summary.put("bestSellingDish", summaryDTO.getBestSellingDish());
        summary.put("dishCount", summaryDTO.getDishCount());
        
        return summary;
    }

//    public Order assignRider(Long orderId, Long riderId) {
//        Optional<Order> orderOpt = orderRepository.findById(orderId);
//        Optional<User> riderOpt = userRepository.findById(riderId);
//
//        if (orderOpt.isPresent() && riderOpt.isPresent() &&
//                riderOpt.get().getRole() == User.UserRole.RIDER) {
//            Order order = orderOpt.get();
//            order.setRider(riderOpt.get());
//            return orderRepository.save(order);
//        }
//
//        return null;
//    }
}