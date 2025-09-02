package org.example.deliver_dish_backend.repository;

import org.example.deliver_dish_backend.model.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByReviewer_UserId(Long userId);
    List<Review> findByTargetTypeAndTargetId(Review.TargetType targetType, Long targetId);
    boolean existsByReviewer_UserIdAndTargetTypeAndTargetId(Long userId, Review.TargetType targetType, Long targetId);
    List<Review> findByOrder_OrderId(Long orderId);
}