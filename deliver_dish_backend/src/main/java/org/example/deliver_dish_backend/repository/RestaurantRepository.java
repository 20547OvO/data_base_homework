package org.example.deliver_dish_backend.repository;

import org.example.deliver_dish_backend.model.entity.Restaurant;
import org.example.deliver_dish_backend.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findByNameContaining(String name);
    List<Restaurant> findByOwner(User owner); // 根据 User 对象查询
    List<Restaurant> findByOwnerUserId(Long ownerId); // 或者根据 owner 的 ID 查询
}
