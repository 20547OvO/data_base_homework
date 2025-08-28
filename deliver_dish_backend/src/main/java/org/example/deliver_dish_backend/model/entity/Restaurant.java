//餐馆实体类
package org.example.deliver_dish_backend.model.entity;


import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "restaurant")
public class Restaurant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long restaurantId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    private String phone;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    @Column(updatable = false)
    private LocalDateTime createTime;

    // 构造方法
    public Restaurant() {}

    public Restaurant(String name, String address, String phone, User owner) {
        this.name = name;
        this.address = address;
        this.phone = phone;
        this.owner = owner;
    }

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
    }

    // Getter和Setter方法
    public Long getRestaurantId() { return restaurantId; }
    public void setRestaurantId(Long restaurantId) { this.restaurantId = restaurantId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }

    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
}
