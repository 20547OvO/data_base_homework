package org.example.deliver_dish_backend.repository;


<<<<<<< HEAD
import org.example.deliver_dish_backend.entity.User;
=======
import org.example.deliver_dish_backend.model.entity.User;
>>>>>>> 7147365 (8.28)
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
}
