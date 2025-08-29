package org.example.deliver_dish_backend.repository;

import org.example.deliver_dish_backend.model.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomer_UserId(Long userId);
    List<Order> findByCustomer_UserIdAndStatusIn(Long userId, List<Order.OrderStatus> statuses);
    List<Order> findByRestaurant_RestaurantId(Long restaurantId);
    List<Order> findByRider_UserId(Long riderId);
    // 确保 OrderRepository 包含以下方法
    List<Order> findByStatus(Order.OrderStatus status);
}