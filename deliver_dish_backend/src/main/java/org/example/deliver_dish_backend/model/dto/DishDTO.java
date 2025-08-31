package org.example.deliver_dish_backend.model.dto;

import java.math.BigDecimal;

public class DishDTO {
    private Long dishId;
    private Long restaurantId;
    private String name;
    private BigDecimal price;
    private Integer stock;
    private String src;



    // 构造方法
    public DishDTO() {}
    public String getSrc() {
        return src;
    }

    public void setSrc(String src) {
        this.src = src;
    }
    // Getter和Setter方法
    public Long getDishId() { return dishId; }
    public void setDishId(Long dishId) { this.dishId = dishId; }

    public Long getRestaurantId() { return restaurantId; }
    public void setRestaurantId(Long restaurantId) { this.restaurantId = restaurantId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
}
