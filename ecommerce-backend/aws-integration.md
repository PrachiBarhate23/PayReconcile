# Adding AWS Services to PayReconcile

This document outlines how to powerfully upgrade this existing Spring Boot architecture by replacing local services (like local MongoDB and Gmail SMTP) with enterprise-grade AWS equivalents.

## 1. AWS RDS & DocumentDB (Database)
Currently, this application uses MongoDB Atlas (or local MongoDB). If you want to move entirely within the AWS VPC:
*   **Replacing MongoDB**: You can use **Amazon DocumentDB** (which is MongoDB-compatible).
*   **Replacing it with SQL/PostgreSQL**: If you prefer relational data constraints for financial ledgers, spin up an **Amazon RDS (PostgreSQL)** instance.
*   **Implementation Steps:** 
    1. Create an RDS/DocumentDB instance in AWS within your VPC.
    2. Ensure your Spring Boot EC2 instance's security group allows traffic to the database port (e.g., 27017 or 5432).
    3. Simply update your `application.properties`:
       ```properties
       spring.data.mongodb.uri=mongodb://username:password@your-doc-db-endpoint.amazonaws.com:27017/ecommerce
       ```

## 2. Amazon SNS (Replacing Twilio)
You can easily swap out Twilio for **Amazon Simple Notification Service (SNS)** to handle SMS messages globally.
*   **Implementation Steps:**
    1. Add the AWS SDK to your `pom.xml`:
       ```xml
       <dependency>
           <groupId>software.amazon.awssdk</groupId>
           <artifactId>sns</artifactId>
       </dependency>
       ```
    2. Create an `AwsSnsService.java`.
    3. Use the following logic to send an SMS:
       ```java
       SnsClient snsClient = SnsClient.builder().region(Region.AP_SOUTH_1).build();
       PublishRequest request = PublishRequest.builder()
               .message("Alert: A chargeback has been initiated...")
               .phoneNumber("+919422989616")
               .build();
       snsClient.publish(request);
       ```

## 3. Amazon SES (Replacing Gmail SMTP)
Gmail SMTP is strictly for local dev. In production, an app like this must use **Amazon Simple Email Service (SES)**.
*   **Implementation Steps:**
    1. Verify your sender domain (e.g., `payreconcile.com`) in the AWS SES Dashboard.
    2. Add the AWS SDK dependency for SES.
    3. You can either use the `SesClient` directly in Java, OR AWS SES provides standard SMTP credentials!
    4. To use SES via SMTP, you literally only change `application.properties`:
       ```properties
       spring.mail.host=email-smtp.ap-south-1.amazonaws.com
       spring.mail.port=587
       spring.mail.username=YOUR_SES_SMTP_USERNAME
       spring.mail.password=YOUR_SES_SMTP_PASSWORD
       spring.mail.properties.mail.smtp.auth=true
       spring.mail.properties.mail.smtp.starttls.enable=true
       ```

## 4. Amazon S3 (For Evidence Uploads)
When addressing chargebacks, admin users click "Add Evidence." Right now, the evidence is just a text string saved to MongoDB. In reality, evidence is usually PDFs, receipts, and images.
*   **Implementation Steps:**
    1. Create an AWS S3 Bucket (e.g., `payreconcile-dispute-evidence`).
    2. Modify `ChargebackManagementPage.tsx` to include an `<input type="file" />`.
    3. Modify `ChargebackController.java` to accept a `MultipartFile`.
    4. Use `S3Client.putObject()` to rapidly stream the receipt directly to your secure S3 bucket.
    5. Save the resulting S3 URL string (e.g., `https://s3.amazonaws/.../receipt.pdf`) into your MongoDB Chargeback document!

## 5. Deployment Architecture 
Once you have these services, here is the enterprise deployment flow:
1. Your frontend Next.js/Vite app is hosted on **Vercel** or **AWS Amplify**.
2. Your Spring Boot `.jar` backend is dockerized and deployed to **AWS Elastic Beanstalk** or **AWS ECS (Fargate)**.
3. Your database is **Amazon DocumentDB** running in a private subnet.
4. Alerts are fired completely invisibly via **AWS SNS** and **AWS SES**.
