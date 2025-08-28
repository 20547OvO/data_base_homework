package org.example.deliver_dish_backend.controller;

import org.example.deliver_dish_backend.model.dto.ApiResponse;
import org.example.deliver_dish_backend.model.entity.Dish;
import org.example.deliver_dish_backend.service.DishService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/dishes")
@CrossOrigin(origins = "http://127.0.0.1:8848") //跨域问题
public class DishController {
    @Autowired
    private DishService dishService;

    @GetMapping
    public ResponseEntity<?> getAllDishes() {
        List<Dish> dishes = dishService.getAllDishes();
        return ResponseEntity.ok(ApiResponse.success("获取成功", dishes));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDishById(@PathVariable Long id) {
        Optional<Dish> dish = dishService.getDishById(id);
        if (dish.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success("获取成功", dish.get()));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("菜品不存在"));
        }
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<?> getDishesByRestaurantId(@PathVariable Long restaurantId) {
        System.out.println("yyyyystartfordish"+restaurantId);
        List<Dish> dishes = dishService.getDishesByRestaurantId(restaurantId);
        return ResponseEntity.ok(ApiResponse.success("获取成功", dishes));
    }

    @PostMapping
    public ResponseEntity<?> createDish(@RequestBody Dish dish) {
        Dish newDish = dishService.createDish(dish);
        return ResponseEntity.ok(ApiResponse.success("菜品创建成功", newDish));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDish(@PathVariable Long id, @RequestBody Dish dish) {
        Dish updatedDish = dishService.updateDish(id, dish);
        if (updatedDish != null) {
            return ResponseEntity.ok(ApiResponse.success("菜品更新成功", updatedDish));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("菜品不存在"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDish(@PathVariable Long id) {
        boolean deleted = dishService.deleteDish(id);
        if (deleted) {
            return ResponseEntity.ok(ApiResponse.success("菜品删除成功"));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("菜品不存在"));
        }
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<?> updateStock(@PathVariable Long id, @RequestParam Integer stock) {
        Dish updatedDish = dishService.updateStock(id, stock);
        if (updatedDish != null) {
            return ResponseEntity.ok(ApiResponse.success("库存更新成功", updatedDish));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("菜品不存在"));
        }
    }
}
