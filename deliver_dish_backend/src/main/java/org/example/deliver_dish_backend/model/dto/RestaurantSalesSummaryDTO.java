package org.example.deliver_dish_backend.model.dto;

import java.math.BigDecimal;
import java.util.Map;

/**
 * 餐厅销售统计摘要DTO
 */
public class RestaurantSalesSummaryDTO {
    private int totalQuantity;         // 总销售数量
    private BigDecimal totalRevenue;   // 总销售额
    private Map<String, Object> bestSellingDish; // 最畅销菜品
    private int dishCount;             // 销售的菜品种类数
    
    // 构造方法
    public RestaurantSalesSummaryDTO(int totalQuantity, BigDecimal totalRevenue, 
                                    Map<String, Object> bestSellingDish, int dishCount) {
        this.totalQuantity = totalQuantity;
        this.totalRevenue = totalRevenue;
        this.bestSellingDish = bestSellingDish;
        this.dishCount = dishCount;
    }
    
    // Getter和Setter方法
    public int getTotalQuantity() {
        return totalQuantity;
    }
    
    public void setTotalQuantity(int totalQuantity) {
        this.totalQuantity = totalQuantity;
    }
    
    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }
    
    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }
    
    public Map<String, Object> getBestSellingDish() {
        return bestSellingDish;
    }
    
    public void setBestSellingDish(Map<String, Object> bestSellingDish) {
        this.bestSellingDish = bestSellingDish;
    }
    
    public int getDishCount() {
        return dishCount;
    }
    
    public void setDishCount(int dishCount) {
        this.dishCount = dishCount;
    }
}