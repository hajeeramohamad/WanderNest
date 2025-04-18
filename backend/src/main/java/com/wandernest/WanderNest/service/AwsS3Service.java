package com.wandernest.WanderNest.service;


import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.wandernest.WanderNest.exception.OurException;
import org.apache.commons.codec.binary.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@Service
public class AwsS3Service {

    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Value("${aws.s3.access.key}")
    private String awsS3AccessKey;

    @Value("${aws.s3.secret.key}")
    private String awsS3SecretKey;

    @Value("${aws.region}")
    private String awsRegion;  // Fetch region from application.properties

    // Combined function to handle both AWS S3 upload or Base64 fallback
    public String saveImageToS3(MultipartFile photo) {
        try {
            // Check if we are using fake keys
            if (awsS3AccessKey.equals("fake-key") && awsS3SecretKey.equals("fake-secret")) {
                // If fake keys, save image as Base64
                InputStream inputStream = photo.getInputStream();
                byte[] imageBytes = inputStream.readAllBytes();
                String base64Image = Base64.encodeBase64String(imageBytes);
                return "data:image/jpeg;base64," + base64Image;
            } else {
                // If real keys, upload image to AWS S3
                String s3Filename = photo.getOriginalFilename();

                BasicAWSCredentials awsCredentials = new BasicAWSCredentials(awsS3AccessKey, awsS3SecretKey);

                // Dynamically set the region based on application.properties
                AmazonS3 s3Client = AmazonS3ClientBuilder.standard()
                        .withCredentials(new AWSStaticCredentialsProvider(awsCredentials))
                        .withRegion(Regions.US_EAST_2)  // Set the region dynamically here
                        .build();

                InputStream inputStream = photo.getInputStream();
                ObjectMetadata metadata = new ObjectMetadata();
                metadata.setContentType("image/jpeg");

                PutObjectRequest putObjectRequest = new PutObjectRequest(bucketName, s3Filename, inputStream, metadata);
                s3Client.putObject(putObjectRequest);

                return "https://" + bucketName + ".s3.amazonaws.com/" + s3Filename;
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new OurException("Unable to upload or encode image: " + e.getMessage());
        }
    }
}


















