-- MySQL dump 10.13  Distrib 5.7.29, for Linux (x86_64)
--
-- Host: localhost    Database: amigo
-- ------------------------------------------------------
-- Server version	5.7.29-0ubuntu0.18.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ads`
--

DROP TABLE IF EXISTS `ads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ads` (
  `adId` int(11) NOT NULL AUTO_INCREMENT,
  `businessId` int(11) NOT NULL,
  `adName` varchar(40) NOT NULL,
  `adDesc` varchar(100) NOT NULL,
  `adImage1` varchar(255) DEFAULT NULL,
  `adImage2` varchar(255) DEFAULT NULL,
  `adImage3` varchar(255) DEFAULT NULL,
  `adImage4` varchar(255) DEFAULT NULL,
  `adVideo` varchar(255) DEFAULT NULL,
  `approve` tinyint(1) DEFAULT '0',
  `createdOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`adId`),
  KEY `businessId` (`businessId`),
  CONSTRAINT `ads_ibfk_1` FOREIGN KEY (`businessId`) REFERENCES `business` (`businessId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ads`
--

LOCK TABLES `ads` WRITE;
/*!40000 ALTER TABLE `ads` DISABLE KEYS */;
/*!40000 ALTER TABLE `ads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business`
--

DROP TABLE IF EXISTS `business`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `business` (
  `businessId` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `storeName` varchar(50) NOT NULL,
  `storeDesc` varchar(100) NOT NULL,
  `storeContact` char(11) NOT NULL,
  `storeAddress` varchar(200) NOT NULL,
  `storeCity` varchar(50) NOT NULL,
  `rating` decimal(2,1) DEFAULT '0.0',
  `lat` decimal(10,8) NOT NULL,
  `lng` decimal(11,8) NOT NULL,
  `image1` varchar(255) NOT NULL,
  `image2` varchar(255) DEFAULT NULL,
  `image3` varchar(255) DEFAULT NULL,
  `approve` tinyint(1) DEFAULT '0',
  `categoryId` int(11) NOT NULL,
  `subCategoryId` int(11) NOT NULL,
  `createdOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`businessId`),
  KEY `userId` (`userId`),
  KEY `categoryId` (`categoryId`),
  KEY `subCategoryId` (`subCategoryId`),
  CONSTRAINT `business_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`) ON DELETE CASCADE,
  CONSTRAINT `business_ibfk_2` FOREIGN KEY (`categoryId`) REFERENCES `category` (`categoryId`) ON DELETE CASCADE,
  CONSTRAINT `business_ibfk_3` FOREIGN KEY (`subCategoryId`) REFERENCES `subCategory` (`subCategoryId`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business`
--

LOCK TABLES `business` WRITE;
/*!40000 ALTER TABLE `business` DISABLE KEYS */;
INSERT INTO `business` VALUES (1,1,'My Fav Store','Some fancy store with all the things you might ever need  come discover us','7756097366','A/p Shrirampur, Anagar, Mah','Shrirampur',0.0,0.00000000,0.00000000,'./serverData/business/1/1592917504/image_1.jpg','./serverData/business/1/1592917504/image_2.jpg','./serverData/business/1/1592917504/image_3.jpg',1,1,2,'2020-06-23 13:05:04');
/*!40000 ALTER TABLE `business` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `category` (
  `categoryId` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(40) NOT NULL,
  `createdOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`categoryId`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'General Stores','2020-06-23 12:50:04'),(2,'Medicine','2020-06-23 12:52:20'),(3,'Clothing','2020-06-23 12:52:20'),(4,'Electronics','2020-06-23 12:52:20'),(5,'Entertainment','2020-06-23 12:52:20'),(6,'Food','2020-06-23 12:52:20'),(7,'Pets','2020-06-23 12:52:20'),(8,'Religion and spirituality','2020-06-23 12:52:20'),(9,'Books','2020-06-23 12:52:20'),(10,'Fashion','2020-06-23 12:52:20'),(11,'Furnitures','2020-06-23 12:52:20'),(12,'Jewellery','2020-06-23 12:52:20'),(13,'Sports and outdoors','2020-06-23 12:52:20'),(14,'Automobile','2020-06-23 12:52:20'),(15,'Others','2020-06-23 12:52:21');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comments` (
  `commentId` int(11) NOT NULL AUTO_INCREMENT,
  `postId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `userName` varchar(50) NOT NULL,
  `text` varchar(100) NOT NULL,
  `createdOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`commentId`),
  KEY `userId` (`userId`),
  KEY `postId` (`postId`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`postId`) REFERENCES `post` (`postId`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,1,1,'Atul Patare','First comment','2020-06-23 15:31:20');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER upd_post_on_new_comment AFTER INSERT ON comments
       FOR EACH ROW
       BEGIN
           UPDATE post SET comments = comments + 1 WHERE postId = NEW.postId;
       END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `contest`
--

DROP TABLE IF EXISTS `contest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contest` (
  `contestId` int(11) NOT NULL AUTO_INCREMENT,
  `contestName` varchar(50) NOT NULL,
  `contestDesc` varchar(100) NOT NULL,
  `prizes` varchar(50) NOT NULL,
  `active` tinyint(1) DEFAULT '1',
  `createdOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`contestId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contest`
--

LOCK TABLES `contest` WRITE;
/*!40000 ALTER TABLE `contest` DISABLE KEYS */;
/*!40000 ALTER TABLE `contest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contestAnswers`
--

DROP TABLE IF EXISTS `contestAnswers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contestAnswers` (
  `answerId` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `contestId` int(11) NOT NULL,
  `answerType` varchar(20) NOT NULL,
  `answerText` varchar(100) NOT NULL,
  `answerImage` varchar(255) NOT NULL,
  `answerVideo` varchar(255) NOT NULL,
  `createdOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`userId`,`contestId`),
  UNIQUE KEY `answerId` (`answerId`),
  CONSTRAINT `contestAnswers_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contestAnswers`
--

LOCK TABLES `contestAnswers` WRITE;
/*!40000 ALTER TABLE `contestAnswers` DISABLE KEYS */;
/*!40000 ALTER TABLE `contestAnswers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feedback`
--

DROP TABLE IF EXISTS `feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `feedback` (
  `feedbackId` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `message` varchar(100) NOT NULL,
  `createdOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`feedbackId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedback`
--

LOCK TABLES `feedback` WRITE;
/*!40000 ALTER TABLE `feedback` DISABLE KEYS */;
/*!40000 ALTER TABLE `feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `likes` (
  `likeId` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `postId` int(11) NOT NULL,
  `createdOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`postId`,`userId`),
  UNIQUE KEY `likeId` (`likeId`),
  KEY `userId` (`userId`),
  CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`) ON DELETE CASCADE,
  CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`postId`) REFERENCES `post` (`postId`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likes`
--

LOCK TABLES `likes` WRITE;
/*!40000 ALTER TABLE `likes` DISABLE KEYS */;
INSERT INTO `likes` VALUES (1,1,1,'2020-06-23 13:57:38');
/*!40000 ALTER TABLE `likes` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER upd_post_on_new_like AFTER INSERT ON likes
       FOR EACH ROW
       BEGIN
           UPDATE post SET likes = likes + 1 WHERE postId = NEW.postId;
       END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `offers`
--

DROP TABLE IF EXISTS `offers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `offers` (
  `offerId` int(11) NOT NULL AUTO_INCREMENT,
  `businessId` int(11) NOT NULL,
  `productId` int(11) DEFAULT NULL,
  `offerName` varchar(40) NOT NULL,
  `offerDesc` varchar(100) DEFAULT NULL,
  `offerImage1` varchar(255) DEFAULT NULL,
  `offerImage2` varchar(255) DEFAULT NULL,
  `offerImage3` varchar(255) DEFAULT NULL,
  `offerImage4` varchar(255) DEFAULT NULL,
  `offerVideo` varchar(255) DEFAULT NULL,
  `approve` tinyint(1) DEFAULT '0',
  `createdOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`offerId`),
  KEY `businessId` (`businessId`),
  KEY `productId` (`productId`),
  CONSTRAINT `offers_ibfk_1` FOREIGN KEY (`businessId`) REFERENCES `business` (`businessId`) ON DELETE CASCADE,
  CONSTRAINT `offers_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `product` (`productId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `offers`
--

LOCK TABLES `offers` WRITE;
/*!40000 ALTER TABLE `offers` DISABLE KEYS */;
/*!40000 ALTER TABLE `offers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post`
--

DROP TABLE IF EXISTS `post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `post` (
  `postId` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `postDesc` varchar(200) NOT NULL,
  `postImage1` varchar(255) DEFAULT NULL,
  `postImage2` varchar(255) DEFAULT NULL,
  `postImage3` varchar(255) DEFAULT NULL,
  `postImage4` varchar(255) DEFAULT NULL,
  `postVideo` varchar(255) DEFAULT NULL,
  `approve` tinyint(1) DEFAULT '0',
  `views` int(11) DEFAULT '0',
  `likes` int(11) DEFAULT '0',
  `comments` int(11) DEFAULT '0',
  `createdOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`postId`),
  KEY `userId` (`userId`),
  CONSTRAINT `post_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post`
--

LOCK TABLES `post` WRITE;
/*!40000 ALTER TABLE `post` DISABLE KEYS */;
INSERT INTO `post` VALUES (1,1,'My first post','./serverData/posts/1/1592918157/image_1.jpg','./serverData/posts/1/1592918157/image_2.jpg','./serverData/posts/1/1592918157/image_3.jpg','./serverData/posts/1/1592918157/image_4.jpg','posts/video/1592918146161/video.mp4',1,0,1,1,'2020-06-23 13:15:57');
/*!40000 ALTER TABLE `post` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product` (
  `productId` int(11) NOT NULL AUTO_INCREMENT,
  `businessId` int(11) NOT NULL,
  `categoryId` int(11) NOT NULL,
  `subCategoryId` int(11) DEFAULT NULL,
  `productName` varchar(40) NOT NULL,
  `productPrice` decimal(10,2) DEFAULT NULL,
  `gst` decimal(10,2) DEFAULT NULL,
  `productImage1` varchar(255) NOT NULL,
  `productImage2` varchar(255) DEFAULT NULL,
  `productImage3` varchar(255) DEFAULT NULL,
  `productImage4` varchar(255) DEFAULT NULL,
  `productVideo` varchar(255) DEFAULT NULL,
  `productDesc` varchar(100) DEFAULT NULL,
  `approve` tinyint(1) DEFAULT '0',
  `createdOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`productId`),
  KEY `businessId` (`businessId`),
  KEY `categoryId` (`categoryId`),
  KEY `subCategoryId` (`subCategoryId`),
  CONSTRAINT `product_ibfk_1` FOREIGN KEY (`businessId`) REFERENCES `business` (`businessId`) ON DELETE CASCADE,
  CONSTRAINT `product_ibfk_2` FOREIGN KEY (`categoryId`) REFERENCES `category` (`categoryId`) ON DELETE CASCADE,
  CONSTRAINT `product_ibfk_3` FOREIGN KEY (`subCategoryId`) REFERENCES `subCategory` (`subCategoryId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refers`
--

DROP TABLE IF EXISTS `refers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `refers` (
  `referId` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `newUserId` int(11) NOT NULL,
  `status` tinyint(1) DEFAULT '0',
  `createdOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`referId`),
  KEY `userId` (`userId`),
  KEY `newUserId` (`newUserId`),
  CONSTRAINT `refers_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`) ON DELETE CASCADE,
  CONSTRAINT `refers_ibfk_2` FOREIGN KEY (`newUserId`) REFERENCES `user` (`userId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refers`
--

LOCK TABLES `refers` WRITE;
/*!40000 ALTER TABLE `refers` DISABLE KEYS */;
/*!40000 ALTER TABLE `refers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reviews` (
  `reviewId` int(11) NOT NULL AUTO_INCREMENT,
  `businessId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `rating` decimal(2,1) DEFAULT '0.0',
  `text` varchar(100) NOT NULL,
  `createdOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`userId`,`businessId`),
  UNIQUE KEY `reviewId` (`reviewId`),
  KEY `businessId` (`businessId`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`businessId`) REFERENCES `business` (`businessId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER upd_business_on_new_review AFTER INSERT ON reviews
       FOR EACH ROW
       BEGIN
            DECLARE newRating DECIMAL(2, 1);
            DECLARE oldRating DECIMAL(2, 1);
            DECLARE calRating DECIMAL(2, 1);
            
            SET @newRating := NEW.rating;
            SET @oldRating := (SELECT rating FROM business WHERE businessId = NEW.businessId);

            SET @calRating := @newRating + @oldRating;
            UPDATE business SET rating = @calRating WHERE businessId = NEW.businessId;
       END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `services` (
  `serviceId` int(11) NOT NULL AUTO_INCREMENT,
  `businessId` int(11) NOT NULL,
  `categoryId` int(11) NOT NULL,
  `subCategoryId` int(11) DEFAULT NULL,
  `serviceName` varchar(40) NOT NULL,
  `serviceDesc` varchar(100) DEFAULT NULL,
  `serviceImage1` varchar(255) DEFAULT NULL,
  `serviceImage2` varchar(255) DEFAULT NULL,
  `serviceImage3` varchar(255) DEFAULT NULL,
  `serviceImage4` varchar(255) DEFAULT NULL,
  `serviceVideo` varchar(255) DEFAULT NULL,
  `servicePrice` decimal(10,2) DEFAULT NULL,
  `approve` tinyint(1) DEFAULT '0',
  `createdOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`serviceId`),
  KEY `businessId` (`businessId`),
  KEY `categoryId` (`categoryId`),
  KEY `subCategoryId` (`subCategoryId`),
  CONSTRAINT `services_ibfk_1` FOREIGN KEY (`businessId`) REFERENCES `business` (`businessId`) ON DELETE CASCADE,
  CONSTRAINT `services_ibfk_2` FOREIGN KEY (`categoryId`) REFERENCES `category` (`categoryId`) ON DELETE CASCADE,
  CONSTRAINT `services_ibfk_3` FOREIGN KEY (`subCategoryId`) REFERENCES `subCategory` (`subCategoryId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subCategory`
--

DROP TABLE IF EXISTS `subCategory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subCategory` (
  `subCategoryId` int(11) NOT NULL AUTO_INCREMENT,
  `categoryId` int(11) NOT NULL,
  `title` varchar(40) NOT NULL,
  `createdOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`subCategoryId`),
  KEY `categoryId` (`categoryId`),
  CONSTRAINT `subCategory_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `category` (`categoryId`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subCategory`
--

LOCK TABLES `subCategory` WRITE;
/*!40000 ALTER TABLE `subCategory` DISABLE KEYS */;
INSERT INTO `subCategory` VALUES (1,1,'Accessories','2020-06-23 12:54:18'),(2,1,'Daily Needs','2020-06-23 12:54:18'),(3,1,'Kirana Stores','2020-06-23 12:54:19'),(4,1,'Others','2020-06-23 12:54:20'),(5,2,'Pharmaceuticals','2020-06-23 12:54:52'),(6,2,'Ayurvedic','2020-06-23 12:54:52'),(7,2,'Others','2020-06-23 12:54:53'),(8,3,'Clothing','2020-06-23 12:56:15'),(9,3,'Shoes','2020-06-23 12:56:15'),(10,3,'Accessories','2020-06-23 12:56:16'),(11,3,'Others','2020-06-23 12:56:16'),(12,4,'Computers','2020-06-23 12:56:16'),(13,4,'Repairing','2020-06-23 12:56:16'),(14,4,'Mobiles','2020-06-23 12:56:16'),(15,4,'Watches','2020-06-23 12:56:16'),(16,4,'Gadgets','2020-06-23 12:56:16'),(17,4,'Others','2020-06-23 12:56:17'),(18,5,'Theatres','2020-06-23 12:57:07'),(19,5,'Movies','2020-06-23 12:57:07'),(20,5,'Musics','2020-06-23 12:57:07'),(21,5,'Studios','2020-06-23 12:57:07'),(22,5,'Galleries','2020-06-23 12:57:07'),(23,5,'Others','2020-06-23 12:57:08'),(24,6,'Hotels','2020-06-23 12:58:15'),(25,6,'Bars','2020-06-23 12:58:15'),(26,6,'Snack stores','2020-06-23 12:58:15'),(27,6,'Others','2020-06-23 12:58:16'),(28,7,'Animals','2020-06-23 12:58:16'),(29,7,'Accessories','2020-06-23 12:58:16'),(30,7,'Others','2020-06-23 12:58:17'),(31,8,'Artifacts','2020-06-23 12:59:38'),(32,8,'Books','2020-06-23 12:59:38'),(33,8,'Idols','2020-06-23 12:59:38'),(34,8,'Others','2020-06-23 12:59:38'),(35,9,'Curriculum','2020-06-23 12:59:38'),(36,9,'Novels','2020-06-23 12:59:38'),(37,9,'Religious','2020-06-23 12:59:38'),(38,9,'Others','2020-06-23 12:59:39'),(39,10,'Makeups','2020-06-23 13:02:53'),(40,10,'Salons','2020-06-23 13:02:53'),(41,10,'Beauty','2020-06-23 13:02:54'),(42,10,'Others','2020-06-23 13:02:54'),(43,11,'Home Appliances','2020-06-23 13:02:54'),(44,11,'Electricals','2020-06-23 13:02:54'),(45,11,'Tiles and Marbles','2020-06-23 13:02:54'),(46,11,'Others','2020-06-23 13:02:54'),(47,12,'Gold and Silver','2020-06-23 13:02:54'),(48,12,'Diamonds and Platinium','2020-06-23 13:02:54'),(49,12,'All','2020-06-23 13:02:54'),(50,12,'Others','2020-06-23 13:02:54'),(51,13,'Sport Equipments','2020-06-23 13:02:54'),(52,13,'Manufactures','2020-06-23 13:02:54'),(53,13,'Custom','2020-06-23 13:02:54'),(54,13,'Others','2020-06-23 13:02:54'),(55,14,'Cars','2020-06-23 13:02:54'),(56,14,'Bikes','2020-06-23 13:02:54'),(57,14,'Cycles','2020-06-23 13:02:54'),(58,14,'Trucks And Loaders','2020-06-23 13:02:54'),(59,14,'Others','2020-06-23 13:02:55');
/*!40000 ALTER TABLE `subCategory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `userId` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `dob` date NOT NULL,
  `doa` date DEFAULT NULL,
  `address` varchar(200) NOT NULL,
  `city` varchar(50) NOT NULL,
  `phone` char(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `profileImage` varchar(255) DEFAULT NULL,
  `referCode` char(10) NOT NULL,
  `jwtToken` text NOT NULL,
  `notificationToken` text NOT NULL,
  `points` int(11) DEFAULT '0',
  `approve` tinyint(1) DEFAULT '0',
  `createdOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Atul Patare','1999-02-24','1999-02-24','A/p Bhokar, Tal. Shrirampur. Dist. A.nagar','Shrirampur','7756097366','atulpatare99@gmail.com','atul',NULL,'U2Z94T','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYXR1bHBhdGFyZTk5QGdtYWlsLmNvbSIsImlhdCI6MTU5MjkxNTc1M30.B-X7GkOulIH7HbwpIGQFNkzgERzQ35aZOxPitOJ9Ov4','e6EZelVA-Mk:APA91bE045CRnqh7vIdFtsB-if9BiUOmZr7XiMnly5T03FJp348oh5uBF07qNgKlXm-wgoAnDcN76NMP4LXpZr1SxenT3NNahNKUQWo83FXCyasMFExz_Jdl1pERFyScqf-Mw5JA4GQB',0,1,'2020-06-23 12:35:53');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendorTransaction`
--

DROP TABLE IF EXISTS `vendorTransaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vendorTransaction` (
  `transactionId` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `businessId` int(11) NOT NULL,
  `months` int(11) DEFAULT '1',
  `amountPaid` decimal(10,2) NOT NULL,
  `createdOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expiryOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transactionId`),
  KEY `userId` (`userId`),
  KEY `businessId` (`businessId`),
  CONSTRAINT `vendorTransaction_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`) ON DELETE CASCADE,
  CONSTRAINT `vendorTransaction_ibfk_2` FOREIGN KEY (`businessId`) REFERENCES `business` (`businessId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendorTransaction`
--

LOCK TABLES `vendorTransaction` WRITE;
/*!40000 ALTER TABLE `vendorTransaction` DISABLE KEYS */;
/*!40000 ALTER TABLE `vendorTransaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `viewers`
--

DROP TABLE IF EXISTS `viewers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `viewers` (
  `viewerId` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `businessId` int(11) NOT NULL,
  `createdOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`userId`,`businessId`),
  UNIQUE KEY `viewerId` (`viewerId`),
  UNIQUE KEY `userId` (`userId`),
  KEY `businessId` (`businessId`),
  CONSTRAINT `viewers_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`) ON DELETE CASCADE,
  CONSTRAINT `viewers_ibfk_2` FOREIGN KEY (`businessId`) REFERENCES `business` (`businessId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `viewers`
--

LOCK TABLES `viewers` WRITE;
/*!40000 ALTER TABLE `viewers` DISABLE KEYS */;
/*!40000 ALTER TABLE `viewers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `views`
--

DROP TABLE IF EXISTS `views`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `views` (
  `viewId` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `postId` int(11) NOT NULL,
  `createdOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`userId`,`postId`),
  UNIQUE KEY `viewId` (`viewId`),
  KEY `postId` (`postId`),
  CONSTRAINT `views_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`) ON DELETE CASCADE,
  CONSTRAINT `views_ibfk_2` FOREIGN KEY (`postId`) REFERENCES `post` (`postId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `views`
--

LOCK TABLES `views` WRITE;
/*!40000 ALTER TABLE `views` DISABLE KEYS */;
/*!40000 ALTER TABLE `views` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER upd_post_on_new_views AFTER INSERT ON views
       FOR EACH ROW
       BEGIN
           UPDATE post SET views = views + 1 WHERE postId = NEW.postId;
       END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `wishes`
--

DROP TABLE IF EXISTS `wishes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `wishes` (
  `wishId` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `senderId` int(11) NOT NULL,
  `createdOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`userId`,`senderId`),
  UNIQUE KEY `wishId` (`wishId`),
  KEY `senderId` (`senderId`),
  CONSTRAINT `wishes_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`) ON DELETE CASCADE,
  CONSTRAINT `wishes_ibfk_2` FOREIGN KEY (`senderId`) REFERENCES `user` (`userId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishes`
--

LOCK TABLES `wishes` WRITE;
/*!40000 ALTER TABLE `wishes` DISABLE KEYS */;
/*!40000 ALTER TABLE `wishes` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-06-24  9:56:57
