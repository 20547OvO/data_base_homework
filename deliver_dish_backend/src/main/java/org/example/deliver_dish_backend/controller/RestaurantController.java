package org.example.deliver_dish_backend.controller;

import org.apache.tomcat.util.json.JSONParser;
import org.example.deliver_dish_backend.model.dto.ApiResponse;
import org.example.deliver_dish_backend.model.dto.RestaurantRequest;
import org.example.deliver_dish_backend.model.entity.Restaurant;
import org.example.deliver_dish_backend.service.RestaurantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = "http://127.0.0.1:8848") //跨域问题
public class RestaurantController {
    @Autowired
    private RestaurantService restaurantService;

    @GetMapping
    public ResponseEntity<?> getAllRestaurants() {
        List<Restaurant> restaurants = restaurantService.getAllRestaurants();
        System.out.println("aaaastartforresturant");
        return ResponseEntity.ok(ApiResponse.success("获取成功", restaurants));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRestaurantById(@PathVariable Long id) {
        System.out.println("aaaaaastartresturant1");
        Optional<Restaurant> restaurant = restaurantService.getRestaurantById(id);
        if (restaurant.isPresent()) {
            System.out.println("aaaaaastartresturant");
            return ResponseEntity.ok(ApiResponse.success("获取成功", restaurant.get()));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("餐厅不存在"));
        }
    }

    // 新增接口：通过 ownerId 查询餐厅
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<?> getRestaurantsByOwnerId(@PathVariable Long ownerId) {
        List<Restaurant> restaurants = restaurantService.getRestaurantsByOwnerId(ownerId);
        if (!restaurants.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success("查询成功", restaurants));
        } else {
            return ResponseEntity.ok(ApiResponse.success("该用户暂无餐厅", Collections.emptyList()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchRestaurants(@RequestParam String keyword) {
        List<Restaurant> restaurants = restaurantService.searchRestaurants(keyword);
        return ResponseEntity.ok(ApiResponse.success("搜索成功", restaurants));
    }

    @PostMapping
    public ResponseEntity<?> createRestaurant(@RequestBody RestaurantRequest request) {
        try {
            System.out.println("aaaacreaterestaurant"+ request);
            System.out.println("aaaacreaterestaurant - name: " + request.getName());
            System.out.println("aaaacreaterestaurant - address: " + request.getAddress());
            System.out.println("aaaacreaterestaurant - phone: " + request.getPhone());
            System.out.println("aaaacreaterestaurant - description: " + request.getDescription());
            System.out.println("aaaacreaterestaurant - ownerId: " + request.getOwnerId());
            Restaurant newRestaurant = restaurantService.createRestaurant(request);
            System.out.println("aaaacreaterestaurantsuccess");
            return ResponseEntity.ok(ApiResponse.success("创建成功", newRestaurant));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("创建失败: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRestaurant(@PathVariable Long id, @RequestBody Restaurant restaurant) {
        Restaurant updatedRestaurant = restaurantService.updateRestaurant(id, restaurant);
        if (updatedRestaurant != null) {
            return ResponseEntity.ok(ApiResponse.success("更新成功", updatedRestaurant));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("餐厅不存在"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRestaurant(@PathVariable Long id) {
        boolean deleted = restaurantService.deleteRestaurant(id);
        if (deleted) {
            return ResponseEntity.ok(ApiResponse.success("删除成功"));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("餐厅不存在"));
        }
    }
}