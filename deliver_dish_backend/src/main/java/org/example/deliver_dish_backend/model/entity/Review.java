package org.example.deliver_dish_backend.model.entity;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "review")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reviewId;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false)
    private TargetType targetType;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    private Integer rating;

    private String comment;

    @Column(updatable = false)
    private LocalDateTime createTime;

    public enum TargetType {
        RESTAURANT, RIDER, CUSTOMER
    }

    // 构造方法
    public Review() {}

    public Review(Order order, User reviewer, TargetType targetType, Long targetId, Integer rating, String comment) {
        this.order = order;
        this.reviewer = reviewer;
        this.targetType = targetType;
        this.targetId = targetId;
        this.rating = rating;
        this.comment = comment;
    }

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
    }

    // Getter和Setter方法
    public Long getReviewId() { return reviewId; }
    public void setReviewId(Long reviewId) { this.reviewId = reviewId; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public User getReviewer() { return reviewer; }
    public void setReviewer(User reviewer) { this.reviewer = reviewer; }

    public TargetType getTargetType() { return targetType; }
    public void setTargetType(TargetType targetType) { this.targetType = targetType; }

    public Long getTargetId() { return targetId; }
    public void setTargetId(Long targetId) { this.targetId = targetId; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
}
