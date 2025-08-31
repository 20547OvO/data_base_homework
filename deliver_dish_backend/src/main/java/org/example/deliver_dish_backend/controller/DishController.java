package org.example.deliver_dish_backend.controller;

import org.example.deliver_dish_backend.model.dto.ApiResponse;
import org.example.deliver_dish_backend.model.dto.DishDTO;
import org.example.deliver_dish_backend.model.entity.Dish;
import org.example.deliver_dish_backend.service.DishService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> createDish(
            @RequestPart DishDTO dish,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) {
        try {
            Dish newDish = dishService.createDish(dish, imageFile);
            return ResponseEntity.ok(ApiResponse.success("菜品创建成功", newDish));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("图片上传失败: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("菜品创建失败: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/upload-image")
    public ResponseEntity<?> uploadDishImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile imageFile) {
        try {
            Dish updatedDish = dishService.updateDishImage(id, imageFile);
            return ResponseEntity.ok(ApiResponse.success("菜品图片上传成功", updatedDish));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("图片上传失败: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("更新失败: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDish(@PathVariable Long id, @RequestBody Dish dish, @RequestPart(value = "image", required = false) MultipartFile imageFile) {
        Dish updatedDish = null;
        try {
            updatedDish = dishService.updateDish(id, dish,imageFile);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
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
