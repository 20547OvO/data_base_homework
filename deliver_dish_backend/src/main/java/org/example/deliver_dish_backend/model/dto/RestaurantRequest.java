package org.example.deliver_dish_backend.model.dto;

public class RestaurantRequest {
    private String name;
    private String address;
    private String phone;
    private String description;
    private Long ownerId;
    private String src;



    // 构造方法、Getter和Setter
    public RestaurantRequest() {}

    public RestaurantRequest(String name, String address, String phone, String description, Long ownerId,String src) {
        this.name = name;
        this.address = address;
        this.phone = phone;
        this.description = description;
        this.ownerId = ownerId;
        this.src = src;
    }
    public String getSrc() {
        return src;
    }

    public void setSrc(String src) {
        this.src = src;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
}
