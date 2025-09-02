package org.example.deliver_dish_backend.controller;

import org.example.deliver_dish_backend.model.dto.ApiResponse;
import org.example.deliver_dish_backend.model.dto.ReviewDTO;
import org.example.deliver_dish_backend.model.entity.Review;
import org.example.deliver_dish_backend.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://127.0.0.1:8848")
public class ReviewController {
    @Autowired
    private ReviewService reviewService;

    @GetMapping
    public ResponseEntity<?> getAllReviews() {
        List<Review> reviews = reviewService.getAllReviews();
        return ResponseEntity.ok(ApiResponse.success("获取成功", reviews));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getReviewById(@PathVariable Long id) {
        Review review = reviewService.getReviewById(id);
        if (review != null) {
            return ResponseEntity.ok(ApiResponse.success("获取成功", review));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("评价不存在"));
        }
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<?> getReviewsByRestaurantId(@PathVariable Long restaurantId) {
        List<Review> reviews = reviewService.getReviewsByRestaurantId(restaurantId);
        return ResponseEntity.ok(ApiResponse.success("获取成功", reviews));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getReviewsByUserId(@PathVariable Long userId) {
        List<Review> reviews = reviewService.getReviewsByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("获取成功", reviews));
    }

    @GetMapping("/target/{targetType}/{targetId}")
    public ResponseEntity<?> getReviewsByTarget(
            @PathVariable String targetType,
            @PathVariable Long targetId) {
        try {
            Review.TargetType type = Review.TargetType.valueOf(targetType.toUpperCase());
            List<Review> reviews = reviewService.getReviewsByTarget(type, targetId);
            return ResponseEntity.ok(ApiResponse.success("获取成功", reviews));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("无效的目标类型"));
        }
    }

    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody ReviewDTO reviewDTO) {
        System.out.println("开始评价了");
        try {
            Review newReview = reviewService.createReview(reviewDTO);
            return ResponseEntity.ok(ApiResponse.success("评价成功", newReview));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReview(@PathVariable Long id, @RequestBody ReviewDTO reviewDTO) {
        try {
            Review updatedReview = reviewService.updateReview(id, reviewDTO);
            return ResponseEntity.ok(ApiResponse.success("更新成功", updatedReview));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        try {
            reviewService.deleteReview(id);
            return ResponseEntity.ok(ApiResponse.success("删除成功", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}