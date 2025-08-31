package org.example.deliver_dish_backend.service;

import org.example.deliver_dish_backend.model.dto.DishDTO;
import org.example.deliver_dish_backend.model.entity.Dish;
import org.example.deliver_dish_backend.model.entity.Restaurant;
import org.example.deliver_dish_backend.repository.DishRepository;
import org.example.deliver_dish_backend.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class DishService {
    @Autowired
    private DishRepository dishRepository;
    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private FileStorageService fileStorageService;

    public List<Dish> getAllDishes() {
        return dishRepository.findAll();
    }

    public Optional<Dish> getDishById(Long id) {
        return dishRepository.findById(id);
    }

    public List<Dish> getDishesByRestaurantId(Long restaurantId) {
        return dishRepository.findByRestaurantRestaurantId(restaurantId);
    }

    public Dish createDish(DishDTO dishDTO, MultipartFile imageFile) throws IOException {
        Optional<Restaurant> restaurantOptional = restaurantRepository.findById(dishDTO.getRestaurantId());
        if (restaurantOptional.isEmpty()) {
            throw new RuntimeException("餐厅不存在，ID: " + dishDTO.getRestaurantId());
        }

        Restaurant restaurant = restaurantOptional.get();
        Dish dish = new Dish();
        dish.setName(dishDTO.getName());
        dish.setPrice(dishDTO.getPrice());
        dish.setRestaurant(restaurant);
        dish.setStock(dishDTO.getStock());

        // 处理图片上传
        if (imageFile != null && !imageFile.isEmpty()) {
            String imagePath = fileStorageService.storeFile(imageFile);
            dish.setSrc(imagePath);
        }

        return dishRepository.save(dish);
    }

    public Dish updateDishImage(Long dishId, MultipartFile imageFile) throws IOException {
        return dishRepository.findById(dishId).map(dish -> {
            try {
                // 删除旧图片
                if (dish.getSrc() != null) {
                    fileStorageService.deleteFile(dish.getSrc());
                }

                // 上传新图片
                String imagePath = fileStorageService.storeFile(imageFile);
                dish.setSrc(imagePath);

                return dishRepository.save(dish);
            } catch (IOException e) {
                throw new RuntimeException("图片上传失败: " + e.getMessage());
            }
        }).orElseThrow(() -> new RuntimeException("菜品不存在"));
    }

    // 修改updateDish方法以支持图片更新
    public Dish updateDish(Long id, Dish dishDetails, MultipartFile imageFile) throws IOException {
        return dishRepository.findById(id).map(dish -> {
            dish.setName(dishDetails.getName());
            dish.setPrice(dishDetails.getPrice());
            dish.setStock(dishDetails.getStock());

            // 如果有新图片，更新图片
            if (imageFile != null && !imageFile.isEmpty()) {
                try {
                    // 删除旧图片
                    if (dish.getSrc() != null) {
                        fileStorageService.deleteFile(dish.getSrc());
                    }

                    // 上传新图片
                    String imagePath = fileStorageService.storeFile(imageFile);
                    dish.setSrc(imagePath);
                } catch (IOException e) {
                    throw new RuntimeException("图片上传失败: " + e.getMessage());
                }
            }

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
