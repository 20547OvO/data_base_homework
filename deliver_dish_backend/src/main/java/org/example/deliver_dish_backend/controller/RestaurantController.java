package org.example.deliver_dish_backend.controller;

import org.apache.tomcat.util.json.JSONParser;
import org.example.deliver_dish_backend.model.dto.ApiResponse;
import org.example.deliver_dish_backend.model.dto.RestaurantRequest;
import org.example.deliver_dish_backend.model.entity.Restaurant;
import org.example.deliver_dish_backend.service.RestaurantService;
import org.example.deliver_dish_backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = "http://127.0.0.1:8848") //跨域问题
public class RestaurantController {
    @Autowired
    private RestaurantService restaurantService;
    
    @Autowired
    private OrderService orderService;

    @GetMapping
    public ResponseEntity<?> getAllRestaurants() {
        List<Restaurant> restaurants = restaurantService.getAllRestaurants();
        System.out.println("aaaastartforresturant");
        return ResponseEntity.ok(ApiResponse.success("获取成功", restaurants));
    }

    // 添加文件上传接口
    @PostMapping("/{id}/upload-image")
    public ResponseEntity<?> uploadRestaurantImage(@PathVariable Long id,
                                                   @RequestParam("image") MultipartFile imageFile) {
        try {
            Restaurant updatedRestaurant = restaurantService.updateRestaurantImage(id, imageFile);
            return ResponseEntity.ok(ApiResponse.success("图片上传成功", updatedRestaurant));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("图片上传失败: " + e.getMessage()));
        }
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

    // 修改创建餐厅接口以支持图片上传
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createRestaurant(@RequestPart RestaurantRequest request,
                                              @RequestPart(value = "image", required = false) MultipartFile imageFile) {
        try {
            System.out.println("aaaacreaterestaurant"+ request);
            System.out.println("aaaacreaterestaurant - name: " + request.getName());
            System.out.println("aaaacreaterestaurant - address: " + request.getAddress());
            System.out.println("aaaacreaterestaurant - phone: " + request.getPhone());
            System.out.println("aaaacreaterestaurant - description: " + request.getDescription());
            System.out.println("aaaacreaterestaurant - ownerId: " + request.getOwnerId());

            Restaurant newRestaurant = restaurantService.createRestaurant(request, imageFile);
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
    
    /**
     * 获取餐厅菜品销售统计数据
     * @param restaurantId 餐厅ID
     * @param days 天数范围（可选，默认30天）
     * @return 菜品销售统计数据
     */
    @GetMapping("/{restaurantId}/dish-sales")
    public ResponseEntity<?> getDishSalesStatistics(
            @PathVariable Long restaurantId,
            @RequestParam(defaultValue = "30") Integer days) {
        
        try {
            // 根据天数计算日期范围
            LocalDateTime end = LocalDateTime.now();
            LocalDateTime start = end.minusDays(days);
            
            // 调用服务层方法获取统计数据
            List<Map<String, Object>> statistics = orderService.getDishSalesStatistics(restaurantId, start, end);
            
            return ResponseEntity.ok(ApiResponse.success("获取菜品销售统计成功", statistics));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("获取菜品销售统计失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取餐厅菜品销售统计数据（兼容原始格式）
     * @param restaurantId 餐厅ID
     * @param startDate 开始日期（格式：yyyy-MM-dd HH:mm:ss）
     * @param endDate 结束日期（格式：yyyy-MM-dd HH:mm:ss）
     * @return 菜品销售统计数据
     */
    @GetMapping("/{restaurantId}/sales/statistics")
    public ResponseEntity<?> getDishSalesStatisticsWithDateRange(
            @PathVariable Long restaurantId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        try {
            // 格式化日期参数
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            LocalDateTime start = startDate != null ? LocalDateTime.parse(startDate, formatter) : null;
            LocalDateTime end = endDate != null ? LocalDateTime.parse(endDate, formatter) : null;
            
            // 调用服务层方法获取统计数据
            List<Map<String, Object>> statistics = orderService.getDishSalesStatistics(restaurantId, start, end);
            
            return ResponseEntity.ok(ApiResponse.success("获取菜品销售统计成功", statistics));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("获取菜品销售统计失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取餐厅销售统计摘要
     * @param restaurantId 餐厅ID
     * @param days 天数范围（可选，默认30天）
     * @return 销售统计摘要
     */
    @GetMapping("/{restaurantId}/sales/summary")
    public ResponseEntity<?> getSalesSummary(
            @PathVariable Long restaurantId,
            @RequestParam(defaultValue = "30") Integer days) {
        
        try {
            // 根据天数计算日期范围
            LocalDateTime end = LocalDateTime.now();
            LocalDateTime start = end.minusDays(days);
            
            // 调用服务层方法获取统计摘要
            Map<String, Object> summary = orderService.getSalesSummaryAsMap(restaurantId, start, end);
            
            return ResponseEntity.ok(ApiResponse.success("获取销售统计摘要成功", summary));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("获取销售统计摘要失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取餐厅销售统计摘要（兼容原始格式）
     * @param restaurantId 餐厅ID
     * @param startDate 开始日期（格式：yyyy-MM-dd HH:mm:ss）
     * @param endDate 结束日期（格式：yyyy-MM-dd HH:mm:ss）
     * @return 销售统计摘要
     */
    @GetMapping("/{restaurantId}/sales/summary/date-range")
    public ResponseEntity<?> getSalesSummaryWithDateRange(
            @PathVariable Long restaurantId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        try {
            // 格式化日期参数
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            LocalDateTime start = startDate != null ? LocalDateTime.parse(startDate, formatter) : null;
            LocalDateTime end = endDate != null ? LocalDateTime.parse(endDate, formatter) : null;
            
            // 调用服务层方法获取统计摘要
            Map<String, Object> summary = orderService.getSalesSummaryAsMap(restaurantId, start, end);
            
            return ResponseEntity.ok(ApiResponse.success("获取销售统计摘要成功", summary));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("获取销售统计摘要失败: " + e.getMessage()));
        }
    }
}