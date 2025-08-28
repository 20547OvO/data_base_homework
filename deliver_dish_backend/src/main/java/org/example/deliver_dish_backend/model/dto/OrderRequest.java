package org.example.deliver_dish_backend.model.dto;

import java.util.List;

public class OrderRequest {
    private Long restaurantId;
    private List<OrderItemRequest> items;

    // 构造方法
    public OrderRequest() {}

    // Getter和Setter方法
    public Long getRestaurantId() { return restaurantId; }
    public void setRestaurantId(Long restaurantId) { this.restaurantId = restaurantId; }

    public List<OrderItemRequest> getItems() { return items; }
    public void setItems(List<OrderItemRequest> items) { this.items = items; }

    public static class OrderItemRequest {
        private Long dishId;
        private Integer quantity;

        // 构造方法
        public OrderItemRequest() {}

        // Getter和Setter方法
        public Long getDishId() { return dishId; }
        public void setDishId(Long dishId) { this.dishId = dishId; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
}
