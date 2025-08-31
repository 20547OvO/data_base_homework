package org.example.deliver_dish_backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${image.upload.path}")
    private String uploadPath;

    @Value("${image.access.path}")
    private String accessPath;

    public String storeFile(MultipartFile file) throws IOException {
        // 确保上传目录存在
        Path uploadDir = Paths.get(uploadPath);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        // 生成唯一文件名
        String originalFileName = file.getOriginalFilename();
        String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        String uniqueFileName = UUID.randomUUID().toString() + fileExtension;

        // 保存文件
        Path filePath = uploadDir.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), filePath);

        // 返回访问路径
        return accessPath + uniqueFileName;
    }

    public boolean deleteFile(String filePath) {
        try {
            if (filePath != null && filePath.startsWith(accessPath)) {
                String fileName = filePath.substring(accessPath.length());
                Path path = Paths.get(uploadPath + fileName);
                return Files.deleteIfExists(path);
            }
            return false;
        } catch (IOException e) {
            return false;
        }
    }
}
