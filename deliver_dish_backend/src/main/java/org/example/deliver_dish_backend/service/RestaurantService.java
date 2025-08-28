package org.example.deliver_dish_backend.service;

import org.example.deliver_dish_backend.model.entity.Restaurant;
import org.example.deliver_dish_backend.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RestaurantService {
    @Autowired
    private RestaurantRepository restaurantRepository;

    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    public List<Restaurant> searchRestaurants(String keyword) {
        return restaurantRepository.findByNameContaining(keyword);
    }

    public Optional<Restaurant> getRestaurantById(Long id) {
        return restaurantRepository.findById(id);
    }

    public Restaurant createRestaurant(Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }

    public Restaurant updateRestaurant(Long id, Restaurant restaurantDetails) {
        return restaurantRepository.findById(id).map(restaurant -> {
            restaurant.setName(restaurantDetails.getName());
            restaurant.setAddress(restaurantDetails.getAddress());
            restaurant.setPhone(restaurantDetails.getPhone());
            restaurant.setOwner(restaurantDetails.getOwner());
            return restaurantRepository.save(restaurant);
        }).orElse(null);
    }

    public boolean deleteRestaurant(Long id) {
        if (restaurantRepository.existsById(id)) {
            restaurantRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
