package org.example.deliver_dish_backend.model.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    private String username;
    private String password;
    private String phone;

    @Enumerated(EnumType.STRING)
    private Role role;

    public enum Role {
        customer, rider, admin,owner
    }
}
