package org.example.deliver_dish_backend.service;

import org.example.deliver_dish_backend.model.dto.DishDTO;
import org.example.deliver_dish_backend.model.entity.Dish;
import org.example.deliver_dish_backend.model.entity.Restaurant;
import org.example.deliver_dish_backend.repository.DishRepository;
import org.example.deliver_dish_backend.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DishService {
    @Autowired
    private DishRepository dishRepository;
    @Autowired
    private RestaurantRepository restaurantRepository;

    public List<Dish> getAllDishes() {
        return dishRepository.findAll();
    }

    public Optional<Dish> getDishById(Long id) {
        return dishRepository.findById(id);
    }

    public List<Dish> getDishesByRestaurantId(Long restaurantId) {
        return dishRepository.findByRestaurantRestaurantId(restaurantId);
    }

    public Dish createDish(DishDTO dish) {
        Optional<Restaurant> restaurantOptional = restaurantRepository.findById(dish.getRestaurantId());

        if (restaurantOptional.isEmpty()) {
            throw new RuntimeException("餐厅不存在，ID: " + dish.getRestaurantId());
        }

        Restaurant restaurant = restaurantOptional.get();
        Dish dish1=new Dish();
        dish1.setName(dish.getName());
        dish1.setPrice(dish.getPrice());
        dish1.setRestaurant(restaurant);
        dish1.setStock(dish.getStock());
        return dishRepository.save(dish1);
    }

    public Dish updateDish(Long id, Dish dishDetails) {
        return dishRepository.findById(id).map(dish -> {
            dish.setName(dishDetails.getName());
            dish.setPrice(dishDetails.getPrice());
            dish.setStock(dishDetails.getStock());
            dish.setRestaurant(dishDetails.getRestaurant());
            return dishRepository.save(dish);
        }).orElse(null);
    }

    public Dish updateStock(Long id, Integer stock) {
        return dishRepository.findById(id).map(dish -> {
            dish.setStock(stock);
            return dishRepository.save(dish);
        }).orElse(null);
    }

    public boolean deleteDish(Long id) {
        if (dishRepository.existsById(id)) {
            dishRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
