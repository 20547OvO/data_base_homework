package org.example.deliver_dish_backend.controller;

import org.example.deliver_dish_backend.model.entity.User;
import org.example.deliver_dish_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

// 允许特定来源的请求
@CrossOrigin(origins = "http://127.0.0.1:8848")
@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // 获取用户信息接口
    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        System.out.println("THISUSERGETAAAA"+userOptional.get());
        return ResponseEntity.ok(userOptional.get());
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody User loginUser) {
        User user = userRepository.findByUsername(loginUser.getUsername());
        if (user == null || !user.getPassword().equals(loginUser.getPassword())) {
            return ResponseEntity.badRequest().body("用户名或密码错误");
        }
        return ResponseEntity.ok(user);
    }

    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()) != null) {
            return ResponseEntity.badRequest().body("{\"message\": \"用户名已存在\", \"success\": false}");
        }

        if (user.getRole() == null) {
            user.setRole(User.Role.customer);
        }

        userRepository.save(user);
        return ResponseEntity.ok()
                .body("{\"message\": \"注册成功\", \"success\": true}");
    }
}