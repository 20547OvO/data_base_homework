package org.example.deliver_dish_backend.service;

import org.example.deliver_dish_backend.model.dto.RestaurantRequest;
import org.example.deliver_dish_backend.model.entity.Restaurant;
import org.example.deliver_dish_backend.model.entity.User;
import org.example.deliver_dish_backend.repository.RestaurantRepository;
import org.example.deliver_dish_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class RestaurantService {

    @Autowired
    private FileStorageService fileStorageService;
    @Autowired
    private RestaurantRepository restaurantRepository;
    @Autowired  // 添加这个注解
    private UserRepository userRepository;

    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    public List<Restaurant> searchRestaurants(String keyword) {
        return restaurantRepository.findByNameContaining(keyword);
    }

    public Optional<Restaurant> getRestaurantById(Long id) {
        return restaurantRepository.findById(id);
    }

    public List<Restaurant> getRestaurantsByOwnerId(Long ownerId) {
        // 方法1：使用 findByOwnerUserId
        return restaurantRepository.findByOwnerUserId(ownerId);

        // 方法2：先获取 User 对象，再使用 findByOwner
        // Optional<User> owner = userService.getUserById(ownerId);
        // return owner.map(restaurantRepository::findByOwner).orElse(Collections.emptyList());
    }
    public Restaurant createRestaurant(RestaurantRequest request, MultipartFile imageFile) {
        // 根据 ownerId 查找用户
        System.out.println("ownerisstart"+request.getOwnerId());
        User owner = userRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        System.out.println("owneris"+owner);

        // 处理图片上传
        String imagePath = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                imagePath = fileStorageService.storeFile(imageFile);
            } catch (IOException e) {
                System.out.println("imageuploadfail");
                throw new RuntimeException(e);
            }
        }
        // 创建餐厅对象
        Restaurant restaurant = new Restaurant();
        restaurant.setName(request.getName());
        restaurant.setAddress(request.getAddress());
        restaurant.setPhone(request.getPhone());
        restaurant.setOwner(owner);
        restaurant.setSrc(imagePath);
        // description 字段在您的实体类中不存在，如果需要可以添加到实体类中

        return restaurantRepository.save(restaurant);
    }

    // 添加更新图片的方法
    public Restaurant updateRestaurantImage(Long id, MultipartFile imageFile) throws IOException {
        return restaurantRepository.findById(id).map(restaurant -> {
            try {
                // 删除旧图片
                if (restaurant.getSrc() != null) {
                    fileStorageService.deleteFile(restaurant.getSrc());
                }

                // 上传新图片
                String imagePath = fileStorageService.storeFile(imageFile);
                restaurant.setSrc(imagePath);

                return restaurantRepository.save(restaurant);
            } catch (IOException e) {
                throw new RuntimeException("图片上传失败: " + e.getMessage());
            }
        }).orElseThrow(() -> new RuntimeException("餐厅不存在"));
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
