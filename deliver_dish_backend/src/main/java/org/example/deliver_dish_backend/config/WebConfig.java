package org.example.deliver_dish_backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${image.upload.path}")
    private String uploadPath;

    @Value("${image.access.path}")
    private String accessPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 映射上传路径到URL
        registry.addResourceHandler(accessPath + "**")
                .addResourceLocations("file:" + uploadPath);
    }
}
