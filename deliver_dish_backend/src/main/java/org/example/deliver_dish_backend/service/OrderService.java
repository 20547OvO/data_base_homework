package org.example.deliver_dish_backend.service;

import org.example.deliver_dish_backend.model.dto.OrderDTO;
import org.example.deliver_dish_backend.model.dto.OrderItemDTO;
import org.example.deliver_dish_backend.model.entity.*;
import org.example.deliver_dish_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
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
            dto.setStatus(order.getStatus().name());
            dto.setRestaurantName(order.getRestaurant().getName());
            dto.setCustomerId(order.getCustomer().getUserId());
            dto.setTotalPrice(order.getTotalPrice());
            dto.setCreateTime(LocalDateTime.now());
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

    public List<Order> getOrdersByRestaurantId(Long restaurantId) {
        return orderRepository.findByRestaurant_RestaurantId(restaurantId);
    }

    public List<OrderDTO> getOrdersByRiderId(Long riderId) {
        List<Order> orders=orderRepository.findByRider_UserId(riderId);
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