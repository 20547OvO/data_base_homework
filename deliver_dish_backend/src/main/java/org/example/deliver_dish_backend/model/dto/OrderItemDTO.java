package org.example.deliver_dish_backend.model.dto;

import java.math.BigDecimal;

public class OrderItemDTO {
    private Long itemId;
    private Long dishId;
    private String dishName;
    private Integer quantity;
    private BigDecimal price;

    // 构造方法
    public OrderItemDTO() {}

    // Getter和Setter方法
    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }

    public Long getDishId() { return dishId; }
    public void setDishId(Long dishId) { this.dishId = dishId; }

    public String getDishName() { return dishName; }
    public void setDishName(String dishName) { this.dishName = dishName; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
}
