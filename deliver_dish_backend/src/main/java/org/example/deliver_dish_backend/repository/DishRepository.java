package org.example.deliver_dish_backend.repository;

import org.example.deliver_dish_backend.model.entity.Dish;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DishRepository extends JpaRepository<Dish, Long> {
    List<Dish> findByRestaurantRestaurantId(Long restaurantId);
}