package org.example.deliver_dish_backend.service;

import org.example.deliver_dish_backend.model.dto.RestaurantRequest;
import org.example.deliver_dish_backend.model.entity.Restaurant;
import org.example.deliver_dish_backend.model.entity.User;
import org.example.deliver_dish_backend.repository.RestaurantRepository;
import org.example.deliver_dish_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RestaurantService {
    @Autowired
    private RestaurantRepository restaurantRepository;
    @Autowired  // 添加这个注解
    private UserRepository userRepository;

    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    public List<Restaurant> searchRestaurants(String keyword) {
        return restaurantRepository.findByNameContaining(keyword);
    }

    public Optional<Restaurant> getRestaurantById(Long id) {
        return restaurantRepository.findById(id);
    }

    public List<Restaurant> getRestaurantsByOwnerId(Long ownerId) {
        // 方法1：使用 findByOwnerUserId
        return restaurantRepository.findByOwnerUserId(ownerId);

        // 方法2：先获取 User 对象，再使用 findByOwner
        // Optional<User> owner = userService.getUserById(ownerId);
        // return owner.map(restaurantRepository::findByOwner).orElse(Collections.emptyList());
    }
    public Restaurant createRestaurant(RestaurantRequest request) {
        // 根据 ownerId 查找用户
        System.out.println("ownerisstart"+request.getOwnerId());
        User owner = userRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        System.out.println("owneris"+owner);
        // 创建餐厅对象
        Restaurant restaurant = new Restaurant();
        restaurant.setName(request.getName());
        restaurant.setAddress(request.getAddress());
        restaurant.setPhone(request.getPhone());
        restaurant.setOwner(owner);
        // description 字段在您的实体类中不存在，如果需要可以添加到实体类中

        return restaurantRepository.save(restaurant);
    }
    public Restaurant updateRestaurant(Long id, Restaurant restaurantDetails) {
        return restaurantRepository.findById(id).map(restaurant -> {
            restaurant.setName(restaurantDetails.getName());
            restaurant.setAddress(restaurantDetails.getAddress());
            restaurant.setPhone(restaurantDetails.getPhone());
            restaurant.setOwner(restaurantDetails.getOwner());
            return restaurantRepository.save(restaurant);
        }).orElse(null);
    }

    public boolean deleteRestaurant(Long id) {
        if (restaurantRepository.existsById(id)) {
            restaurantRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
