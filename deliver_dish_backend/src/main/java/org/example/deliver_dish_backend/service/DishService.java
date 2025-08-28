package org.example.deliver_dish_backend.service;

import org.example.deliver_dish_backend.model.entity.Dish;
import org.example.deliver_dish_backend.repository.DishRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DishService {
    @Autowired
    private DishRepository dishRepository;

    public List<Dish> getAllDishes() {
        return dishRepository.findAll();
    }

    public Optional<Dish> getDishById(Long id) {
        return dishRepository.findById(id);
    }

    public List<Dish> getDishesByRestaurantId(Long restaurantId) {
        return dishRepository.findByRestaurantRestaurantId(restaurantId);
    }

    public Dish createDish(Dish dish) {
        return dishRepository.save(dish);
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
