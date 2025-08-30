package org.example.deliver_dish_backend.controller;

import org.example.deliver_dish_backend.model.dto.ApiResponse;
import org.example.deliver_dish_backend.model.dto.OrderDTO;
import org.example.deliver_dish_backend.model.entity.Order;
import org.example.deliver_dish_backend.model.entity.OrderItem;
import org.example.deliver_dish_backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.jaxb.SpringDataJaxb;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://127.0.0.1:8848") //跨域问题
public class OrderController {
    @Autowired
    private OrderService orderService;

    @GetMapping
    public ResponseEntity<?> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(ApiResponse.success("获取成功", orders));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getOrdersByStatus(@PathVariable String status) {
        try {
            // 将字符串转换为枚举，忽略大小写
            System.out.println("aaabbcccstatusstarta" + status);
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            //检测是否正确枚举值，已经拿到created的状态值
            System.out.println("aaaabbb111" + orderStatus);
            List<OrderDTO> orders = orderService.getOrdersByStatus(orderStatus);
            System.out.println("aaaabbb" + orders);
            return ResponseEntity.ok(ApiResponse.success("获取成功", orders));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("无效的订单状态"));
        }
    }

//    @GetMapping
//    public ResponseEntity<?> getOrders(@RequestParam(required = false) String status) {
//        List<Order> orders;
//        if ("created".equals(status)) {
////            orders = orderService.getOrdersByStatus(Order.OrderStatus.created);
//        } else {
//            orders = orderService.getAllOrders();
//        }
//        return ResponseEntity.ok(ApiResponse.success("获取成功", orders));
//    }


    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        Optional<Order> order = orderService.getOrderById(id);
        if (order.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success("获取成功", order.get()));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("订单不存在"));
        }
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<?> getOrdersByCustomerId(@PathVariable Long customerId) {
        List<Order> orders = orderService.getOrdersByCustomerId(customerId);
        return ResponseEntity.ok(ApiResponse.success("获取成功", orders));
    }

    @GetMapping("/customer/{customerId}/current")
    public ResponseEntity<?> getCurrentOrdersByCustomerId(@PathVariable Long customerId) {
        System.out.println("aaaastartuserresutrunt");
        List<OrderDTO> orders = orderService.getCurrentOrdersByCustomerId(customerId);
        System.out.println("aaaastartuserresutrunt11111");
        System.out.println(orders);
        return ResponseEntity.ok(ApiResponse.success("获取成功", orders));
    }

    @GetMapping("/customer/{customerId}/history")
    public ResponseEntity<?> getHistoryOrdersByCustomerId(@PathVariable Long customerId) {
        System.out.println("aaaastartuserresutrunt9999");
        List<OrderDTO> orders = orderService.getHistoryOrdersByCustomerId(customerId);
        System.out.println(orders);
        return ResponseEntity.ok(ApiResponse.success("获取成功", orders));
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<?> getOrdersByRestaurantId(@PathVariable Long restaurantId) {
        List<OrderDTO> orders = orderService.getOrdersByRestaurantId(restaurantId);
        System.out.println("thisorders"+orders);
        return ResponseEntity.ok(ApiResponse.success("获取成功", orders));
    }

    @GetMapping("/rider/{riderId}")
    public ResponseEntity<?> getOrdersByRiderId(@PathVariable Long riderId) {
        List<OrderDTO> orders = orderService.getOrdersByRiderId(riderId);
        System.out.println("aaaaariderstatrt" + orders);
        return ResponseEntity.ok(ApiResponse.success("获取成功", orders));
    }

    @GetMapping("/{orderId}/items")
    public ResponseEntity<?> getOrderItemsByOrderId(@PathVariable Long orderId) {
        List<OrderItem> items = orderService.getOrderItemsByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success("获取成功", items));
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderDTO order) {
        System.out.println("aaaaStartcreateorder");
        Order newOrder = orderService.createOrder(order, order.getItems());
        return ResponseEntity.ok(ApiResponse.success("创建成功", newOrder));
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam Order.OrderStatus status,
            @RequestParam(required = false) Long riderId // 可选的 riderId 参数
    ) {
        // 实现逻辑
        System.out.println("bbbbbaaaastartstatue");
        Order updatedOrder = orderService.updateOrderStatus(orderId, status, riderId);
        if (updatedOrder != null) {
            return ResponseEntity.ok(ApiResponse.success("状态更新成功", updatedOrder));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("订单不存在"));

        }


    }
}
