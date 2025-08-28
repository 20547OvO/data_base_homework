package org.example.deliver_dish_backend.model.entity;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_item")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long itemId;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne
    @JoinColumn(name = "dish_id", nullable = false)
    private Dish dish;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    // 构造方法
    public OrderItem() {}

    public OrderItem(Order order, Dish dish, Integer quantity, BigDecimal price) {
        this.order = order;
        this.dish = dish;
        this.quantity = quantity;
        this.price = price;
    }

    // Getter和Setter方法
    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public Dish getDish() { return dish; }
    public void setDish(Dish dish) { this.dish = dish; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
}