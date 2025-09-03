package org.example.deliver_dish_backend.repository;

import org.example.deliver_dish_backend.model.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
//    List<OrderItem> findByOrderOrderId(Long orderId);
    List<OrderItem> findByOrder_OrderId(Long orderId);
    
    // 根据餐厅ID查找所有订单项
    List<OrderItem> findByOrder_Restaurant_RestaurantId(Long restaurantId);
}
