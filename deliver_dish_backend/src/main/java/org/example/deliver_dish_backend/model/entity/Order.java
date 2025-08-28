package org.example.deliver_dish_backend.model.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @ManyToOne
    @JoinColumn(name = "rider_id")
    private User rider;

    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.created;

    @Column(precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Column(updatable = false)
    private LocalDateTime createTime;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items;

    public enum OrderStatus {
        created, ACCEPTED, DELIVERING, COMPLETED, CANCELLED
    }

    // 构造方法
    public Order() {}

    public Order(User customer, Restaurant restaurant, OrderStatus status, BigDecimal totalPrice) {
        this.customer = customer;
        this.restaurant = restaurant;
        this.status = status;
        this.totalPrice = totalPrice;
    }

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
    }

    // Getter和Setter方法
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public User getCustomer() { return customer; }
    public void setCustomer(User customer) { this.customer = customer; }

    public Restaurant getRestaurant() { return restaurant; }
    public void setRestaurant(Restaurant restaurant) { this.restaurant = restaurant; }

    public User getRider() { return rider; }
    public void setRider(User rider) { this.rider = rider; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
}
