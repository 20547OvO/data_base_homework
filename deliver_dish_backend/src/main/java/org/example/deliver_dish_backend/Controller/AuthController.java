package org.example.deliver_dish_backend.Controller;

import org.example.deliver_dish_backend.entity.User;
import org.example.deliver_dish_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// 允许特定来源的请求
@CrossOrigin(origins = "http://127.0.0.1:8848") //跨域问题
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginUser) {
        User user = userRepository.findByUsername(loginUser.getUsername());
        if (user == null || !user.getPassword().equals(loginUser.getPassword())) {
            return ResponseEntity.badRequest().body("用户名或密码错误");
        }
        // 简单返回用户信息（可改为 JWT Token）
        return ResponseEntity.ok(user);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        // 检查用户名是否已存在
        if (userRepository.findByUsername(user.getUsername()) != null) {
            return ResponseEntity.badRequest().body("用户名已存在");
        }

        // 设置默认角色（如果前端没有传递）
        if (user.getRole() == null) {
            user.setRole(User.Role.customer);
        }

        // 在实际应用中，这里应该对密码进行加密
        // user.setPassword(passwordEncoder.encode(user.getPassword()));

        // 保存用户
        userRepository.save(user);

        return ResponseEntity.ok()
                .body("{\"message\": \"注册成功\", \"success\": true}");
    }
}
