package org.example.deliver_dish_backend.service;

import org.example.deliver_dish_backend.model.dto.ReviewDTO;
import org.example.deliver_dish_backend.model.entity.Order;
import org.example.deliver_dish_backend.model.entity.Review;
import org.example.deliver_dish_backend.model.entity.User;
import org.example.deliver_dish_backend.repository.OrderRepository;
import org.example.deliver_dish_backend.repository.ReviewRepository;
import org.example.deliver_dish_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {
    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    public Review getReviewById(Long id) {
        return reviewRepository.findById(id).orElse(null);
    }

    public List<Review> getReviewsByRestaurantId(Long restaurantId) {
        return reviewRepository.findByTargetTypeAndTargetId(
                Review.TargetType.RESTAURANT, restaurantId);
    }

    public List<Review> getReviewsByUserId(Long userId) {
        return reviewRepository.findByReviewer_UserId(userId);
    }

    public List<Review> getReviewsByTarget(Review.TargetType targetType, Long targetId) {
        return reviewRepository.findByTargetTypeAndTargetId(targetType, targetId);
    }

    @Transactional
    public Review createReview(ReviewDTO reviewDTO) {
        // 验证评价者是否存在
        User reviewer = userRepository.findById(reviewDTO.getReviewerId())
                .orElseThrow(() -> new RuntimeException("用户不存在，ID: " + reviewDTO.getReviewerId()));
        System.out.println("评价进行到这了1");

        // 验证订单是否存在（如果提供了订单ID）
        Order order = null;
        if (reviewDTO.getOrderId() != null) {
            order = orderRepository.findById(reviewDTO.getOrderId())
                    .orElseThrow(() -> new RuntimeException("订单不存在，ID: " + reviewDTO.getOrderId()));
        }

        // 验证目标类型
        Review.TargetType targetType;
        try {
            targetType = Review.TargetType.valueOf(reviewDTO.getTargetType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("无效的目标类型: " + reviewDTO.getTargetType());
        }

//         检查用户是否已经评价过该目标
        boolean hasReviewed = reviewRepository.existsByReviewer_UserIdAndTargetTypeAndTargetId(
                reviewDTO.getReviewerId(), targetType, reviewDTO.getTargetId());

        if (hasReviewed) {
            throw new RuntimeException("您已经评价过该目标");
        }
        System.out.println("评价进行到这了");

        // 创建评价实体
        Review review = new Review();
        review.setOrder(order);
        review.setReviewer(reviewer);
        review.setTargetType(targetType);
        review.setTargetId(reviewDTO.getTargetId());
        review.setRating(reviewDTO.getRating());
        review.setComment(reviewDTO.getComment());
        System.out.println("不是这样还没成功吗"+review.getTargetId()+review.getTargetType()+review.getComment()+review.getReviewer().getUserId());
        return reviewRepository.save(review);
    }

    @Transactional
    public Review updateReview(Long id, ReviewDTO reviewDTO) {
        return reviewRepository.findById(id).map(review -> {
            if (reviewDTO.getRating() != null) {
                review.setRating(reviewDTO.getRating());
            }
            if (reviewDTO.getComment() != null) {
                review.setComment(reviewDTO.getComment());
            }
            return reviewRepository.save(review);
        }).orElseThrow(() -> new RuntimeException("评价不存在，ID: " + id));
    }

    @Transactional
    public void deleteReview(Long id) {
        if (reviewRepository.existsById(id)) {
            reviewRepository.deleteById(id);
        } else {
            throw new RuntimeException("评价不存在，ID: " + id);
        }
    }
}