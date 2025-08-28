package org.example.deliver_dish_backend.repository;







import org.example.deliver_dish_backend.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
}
