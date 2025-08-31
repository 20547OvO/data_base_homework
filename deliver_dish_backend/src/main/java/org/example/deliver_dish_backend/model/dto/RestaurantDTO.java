package org.example.deliver_dish_backend.model.dto;

public class RestaurantDTO {
    private Long restaurantId;
    private String name;
    private String address;
    private String phone;
    private Double rating;
    private Integer minOrderPrice;
    private String src;



    // 构造方法
    public RestaurantDTO() {}

    public String getSrc() {
        return src;
    }

    public void setSrc(String src) {
        this.src = src;
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

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getMinOrderPrice() { return minOrderPrice; }
    public void setMinOrderPrice(Integer minOrderPrice) { this.minOrderPrice = minOrderPrice; }
}
