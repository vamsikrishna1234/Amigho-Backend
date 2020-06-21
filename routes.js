const tokenVerification = require('./tokenVerify');
const jwt = require('jsonwebtoken');
const privateKey = require('./key');
const nodemailer = require('nodemailer');
const fs = require('fs');
const { time } = require('console');
const { on } = require('process');

// mailing agent
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'atulpatare99@gmail.com',
		pass: 'somepass'
	}
});

module.exports = (app, db) => {
	// all endpoints go here
	app.get('/User', (req, res) => {
		var sql = "SELECT * FROM user where userId = 10";

		db.query(sql, (err, result) => {
			if (err) {
				res.send(500);
				console.log("ERROR:", err.sqlMessage);
			} else {
				res.json(result);
			}
		})
	})

	//generate a refer code
	function genReferCode() {
		var length = 6;
		var result = '';
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}

	//save the image
	function saveImageToFile(base64Data, filePath) {
		if (!fs.existsSync(filePath))
			fs.mkdirSync(filePath, { recursive: true }, (err) => {
				if (err) {
					console.log("DIR CREATION ERROR:", err);
				} else {
					fs.writeFile(filePath, base64Data, 'base64', function (err) {
						if (err) console.log("ERROR" + err);
					});
				}
			});
	}

	// login user
	app.post('/loginUser', (req, res) => {
		var email = req.body.email;
		var password = req.body.password;
		var sql = "SELECT * FROM user WHERE email = ? AND password = ?";

		db.query(sql, [email, password], (err, result) => {
			if (err) {
				console.log("ERROR ::", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json(result[0]);
			}
		})
	})

	// reg
	app.post('/registerUser', (req, res) => {
		var name = req.body.name;
		var email = req.body.email;
		var password = req.body.password;
		var phone = req.body.phone;
		var doa = req.body.doa;
		var dob = req.body.dob;
		var address = req.body.address;
		var city = req.body.city;
		var notificationToken = req.body.notificationToken;
		var referCode = genReferCode();
		var sql = "INSERT INTO user(name, email, password, phone, address, city, notificationToken, dob, doa, jwtToken, referCode) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

		jwt.sign({ user: email }, privateKey, (err, token) => {
			if (err) {
				console.log("TOKEN GEN :: " + err);
				res.json({ message: "0" });
			} else {
				db.query(sql, [name, email, password, phone, address, city, notificationToken, dob, doa, token, referCode], (err, result) => {
					if (err) {
						console.log("REGISTER :: " + err.sqlMessage);
						res.status(500).json({ message: err.sqlMessage });
					} else {
						var newId = result.insertId;
						console.log(newId);
						var sql1 = "SELECT * FROM user WHERE userId = ?";
						db.query(sql1, [newId], (err1, result1) => {
							if (err1) {
								console.log("REGISTER ERR1:: " + err1.sqlMessage);
								res.status(500).json({ message: err1.sqlMessage });
							} else {
								res.status(200).json(result1[0]);
							}
						})
					}
				});
			}
		});
	})

	app.get('/checkApproveStatus/:userId', tokenVerification, (req, res) => {
		var userId = req.params.userId;
		var sql = "SELECT approve FROM user WHERE userId = ?";

		db.query(sql, [userId], (err, result) => {
			if (err) {
				console.log("APPROVE ERROR ::" + err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json(result[0].approve);
			}
		})
	})

	app.get('/getAllBusinessesOfUser/:userId', tokenVerification, (req, res) => {
		var userId = req.params.userId;
		var sql = "SELECT * FROM business WHERE userId = ?";

		db.query(sql, [userId], (err, result) => {
			if (err) {
				console.log("BUSINESS LIST ERROR ::", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json(result);
			}
		})
	})

	// get all catgeories
	app.get('/getAllCategories', tokenVerification, (req, res) => {
		var sql = "SELECT * FROM category";

		db.query(sql, (err, result) => {
			if (err) {
				console.log("CATEGORY ERROR ::" + err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json(result);
			}
		})
	})

	// get all sub catgeories for category
	app.get('/getSubCategoryForCategory/:categoryId', tokenVerification, (req, res) => {
		var categoryId = req.params.categoryId;
		var sql = "SELECT * FROM subCategory where categoryId = ?";

		db.query(sql, [categoryId], (err, result) => {
			if (err) {
				console.log("SUB CATEGORY ERROR ::" + err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json(result);
			}
		})
	})

	// add business
	app.post('/registerUserBusiness', tokenVerification, (req, res) => {
		var userId = req.body.userId;
		var storeName = req.body.storeName;
		var storeDesc = req.body.storeDesc;
		var storeAddress = req.body.storeAddress;
		var storeCity = req.body.storeCity;
		var storeContact = req.body.storeContact;
		var lat = req.body.lat;
		var lng = req.body.lng;
		var image1 = req.body.image1;
		var image2 = req.body.image2;
		var image3 = req.body.image3;
		var categoryId = req.body.categoryId;
		var subCategoryId = req.body.subCategoryId;

		var timeStamp = Math.floor(Date.now() / 1000);
		var storeImage1 = "./serverData/business/" + userId + "/" + timeStamp + "/image_1.jpg";
		var storeImage2 = "./serverData/business/" + userId + "/" + timeStamp + "/image_2.jpg";
		var storeImage3 = "./serverData/business/" + userId + "/" + timeStamp + "/image_3.jpg";

		saveImageToFile(image1, storeImage1);
		saveImageToFile(image2, storeImage2);
		saveImageToFile(image3, storeImage3);

		var sql = "INSERT INTO business(userId, storeName, storeDesc, storeContact, storeAddress, storeCity, image1, image2, image3, lat, lng, categoryId, subCategoryId) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
		db.query(sql, [userId, storeName, storeDesc, storeContact, storeAddress, storeCity, storeImage1, storeImage2, storeImage3, lat, lng, categoryId, subCategoryId], (err, result) => {
			if (err) {
				console.log("BUSINESS REG ERROR ::", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json("Done");
			}
		})
	})

	// get todays birthdays
	app.get('/getBirthDays', tokenVerification, (req, res) => {
		var sql = "SELECT * FROM user WHERE DATE(dob) = CURDATE() AND approve = 1";
		db.query(sql, (err, result) => {
			if (err) {
				console.log("BIRTHDAYS ERROR :: ", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json(result);
			}
		})
	})

	// get active contests
	app.get('/getContests', tokenVerification, (req, res) => {
		var sql = "SELECT * FROM contest WHERE active = 1";
		db.query(sql, (err, result) => {
			if (err) {
				console.log("CONTESTS ERROR :: ", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json(result);
			}
		})
	})

	// get todays birthdays
	app.get('/getPosts', tokenVerification, (req, res) => {
		var sql = "SELECT *.post, user.userId, user.name FROM post INNER JOIN user ON post.userId = user.userId WHERE createdOn >= DATE_SUB(NOW(), INTERVAL 15 DAY) AND approve = 1";
		db.query(sql, (err, result) => {
			if (err) {
				console.log("POSTS ERROR :: ", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json(result);
			}
		})
	})

	// get users posts
	app.get('/getUserPosts/:userId', (req, res) => {
		var userId = req.params.userId;
		var sql = "SELECT post.* FROM post WHERE userId = ?";

		db.query(sql, [userId], (err, result) => {
			if (err) {
				console.log("USER POSTS ERROR :: ", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json(result);
			}
		})
	})

	// get business offers by businessId
	app.get('/getUserOffers/:businessId', (req, res) => {
		var businessId = req.params.businessId;
		var sql = "SELECT * FROM offers WHERE businessId = ?";

		db.query(sql, [businessId], (err, result) => {
			if (err) {
				console.log("OFFERS ERROR :: ", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json(result);
			}
		})
	})

	// get business services by businessId
	app.get('/getUserServices/:businessId', (req, res) => {
		var businessId = req.params.businessId;
		var sql = "SELECT * FROM services WHERE businessId = ?";

		db.query(sql, [businessId], (err, result) => {
			if (err) {
				console.log("SERVICES ERROR :: ", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json(result);
			}
		})
	})

	// get business ads by businessId
	app.get('/getUserAds/:businessId', (req, res) => {
		var businessId = req.params.businessId;
		var sql = "SELECT * FROM ads WHERE businessId = ?";

		db.query(sql, [businessId], (err, result) => {
			if (err) {
				console.log("ADS ERROR :: ", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json(result);
			}
		})
	})

	// get business products by businessId
	app.get('/getUserProducts/:businessId', (req, res) => {
		var businessId = req.params.businessId;
		var sql = "SELECT * FROM product WHERE businessId = ?";

		db.query(sql, [businessId], (err, result) => {
			if (err) {
				console.log("PRODUCTS ERROR :: ", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json(result);
			}
		})
	})

	// get business reviews by businessId
	app.get('/getBusinessReviews/:businessId', (req, res) => {
		var businessId = req.params.businessId;
		var sql = "SELECT reviews.*, user.name FROM reviews INNER JOIN user ON reviews.userId = user.userId WHERE businessId = ?";

		db.query(sql, [businessId], (err, result) => {
			if (err) {
				console.log("REVIEWS ERROR :: ", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json(result);
			}
		})
	})

	// get business viewers by businessId
	app.get('/getBusinessViewers/:businessId', (req, res) => {
		var businessId = req.params.businessId;
		var sql = "SELECT user.* FROM user INNER JOIN viewers ON user.userId = viewer.userId WHERE businessId = ?";

		db.query(sql, [businessId], (err, result) => {
			if (err) {
				console.log("VIEWERS ERROR :: ", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json(result);
			}
		})
	})

	// get business profile
	app.get('/getBusinessProfile/:businessId', (req, res) => {
		var businessId = req.params.businessId;
		var sql = "SELECT * FROM business WHERE businessId = ?";

		db.query(sql, [businessId], (err, result) => {
			if (err) {
				console.log("BUSINESS PROFILE ERROR :: ", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json(result);
			}
		})
	})

	// upload video
	app.post('/uploadVideo/:path', (req, res) => {
		if (!req.files || Object.keys(req.files).length === 0) {
			return res.status(400).send('No files were uploaded.');
		}

		let video = req.files.video;
		var filePath = "./serverData/" + req.params.path;

		video.mv(filePath, function (err) {
			if (err) {
				console.log("MOVING FILE ERROR" + err);
				return res.status(500).send(err);
			}

			res.json({
				success: true,
				message: "Done"
			})
		});
	})

	// create new post
	app.post('/createNewPost', (req, res) => {
		var userId = req.body.userId;
		var postDesc = req.body.postDesc;
		var postImage1 = req.body.postImage1;
		var postImage2 = req.body.postImage2;
		var postImage3 = req.body.postImage3;
		var postImage4 = req.body.postImage4;
		var postVideo = req.body.postVideo;

		var timestamp = Math.floor(Date.now() / 1000);
		var finalPostImage1 = "./serverData/posts/" + userId + "/" + timestamp + "/image_1.jpg";
		var finalPostImage2 = "./serverData/posts/" + userId + "/" + timestamp + "/image_2.jpg";
		var finalPostImage3 = "./serverData/posts/" + userId + "/" + timestamp + "/image_3.jpg";
		var finalPostImage4 = "./serverData/posts/" + userId + "/" + timestamp + "/image_4.jpg";

		saveImageToFile(postImage1, finalPostImage1);
		saveImageToFile(postImage2, finalPostImage2);
		saveImageToFile(postImage3, finalPostImage3);
		saveImageToFile(postImage4, finalPostImage4);

		var sql = "INSERT INTO post(userId, postDesc, postImage1, postImage2, postImage3, postImage4, postVideo) VALUES(?, ?, ?, ?, ?, ?, ?)";

		db.query(sql, [userId, postDesc, finalPostImage1, finalPostImage2, finalPostImage3, finalPostImage4, postVideo], (err, result) => {
			if(err){
				console.log("NEW PSOT :: ", err);
				res.sendStatus(500);
			}else{
				res.status(200).json({
					success : true,
					message : "Done"
				})
			}
		})
	})

	// create new offer
	app.post('/createNewOffer', (req, res) => {
		var businessId = req.body.businessId;
		var productId = req.body.productId;
		var offerName = req.body.offerName;
		var offerDesc = req.body.offerDesc;
		var offerImage1 = req.body.offerImage1;
		var offerImage2 = req.body.offerImage2;
		var offerImage3 = req.body.offerImage3;
		var offerImage4 = req.body.offerImage4;
		var offerVideo = req.body.offerVideo;

		var timestamp = Math.floor(Date.now() / 1000);
		var finalOfferImage1 = "./serverData/offer/" + businessId + "/" + timestamp + "/image_1.jpg";
		var finalOfferImage2 = "./serverData/offer/" + businessId + "/" + timestamp + "/image_2.jpg";
		var finalOfferImage3 = "./serverData/offer/" + businessId + "/" + timestamp + "/image_3.jpg";
		var finalOfferImage4 = "./serverData/offer/" + businessId + "/" + timestamp + "/image_4.jpg";

		saveImageToFile(offerImage1, finalOfferImage1);
		saveImageToFile(offerImage2, finalOfferImage2);
		saveImageToFile(offerImage3, finalOfferImage3);
		saveImageToFile(offerImage4, finalOfferImage4);

		var sql = "INSERT INTO offers(businessId, productId, offerName, offerDesc, offerImage1, offerImage2, offerImage3, offerImage4, offerImage5, offerVideo) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)";


		db.query(sql, [businessId, productId, offerName, offerDesc, finalOfferImage1, finalOfferImage2, finalOfferImage3, finalOfferImage4, offerVideo], (err, result) => {
			if(err){
				console.log("NEW OFFER :: ", err);
				res.sendStatus(500);
			}else{
				res.status(200).json({
					success : true,
					message : "Done"
				})
			}
		})
	})

	// create new ad
	app.post('/createNewAd', (req, res) => {
		var businessId = req.body.businessId;
		var adName = req.body.adName;
		var adDesc = req.body.adDesc;
		var adImage1 = req.body.adImage1;
		var adImage2 = req.body.adImage2;
		var adImage3 = req.body.adImage3;
		var adImage4 = req.body.adImage4;
		var adVideo = req.body.adVideo;

		var timestamp = Math.floor(Date.now() / 1000);
		var finalAdImage1 = "./serverData/ad/" + businessId + "/" + timestamp + "/image_1.jpg";
		var finalAdImage2 = "./serverData/ad/" + businessId + "/" + timestamp + "/image_2.jpg";
		var finalAdImage3 = "./serverData/ad/" + businessId + "/" + timestamp + "/image_3.jpg";
		var finalAdImage4 = "./serverData/ad/" + businessId + "/" + timestamp + "/image_4.jpg";

		saveImageToFile(adImage1, finalAdImage1);
		saveImageToFile(adImage2, finalAdImage2);
		saveImageToFile(adImage3, finalAdImage3);
		saveImageToFile(adImage4, finalAdImage4);

		var sql = "INSERT INTO ads(businessId, adName, adDesc, adImage1, adImage2, adImage3, adImage4, adVideo) VALUES(?, ?, ?, ?, ?, ?, ?, ?)";

		db.query(sql, [businessId, adName, adDesc, finalAdImage1, finalAdImage2, finalAdImage3, finalAdImage4, adVideo], (err, result) => {
			if(err){
				console.log("NEW AD :: ", err);
				res.sendStatus(500);
			}else{
				res.status(200).json({
					success : true,
					message : "Done"
				})
			}
		})

	})
	
	// create new service
	app.post('/createNewService', (req, res) => {
		var businessId = req.body.businessId;
		var categoryId = req.body.categoryId;
		var subCategoryId = req.body.subCategoryId;
		var serviceName = req.body.serviceName;
		var serviceDesc = req.body.serviceDesc;
		var serviceImage1 = req.body.serviceImage1;
		var serviceImage2 = req.body.serviceImage2;
		var serviceImage3 = req.body.serviceImage3;
		var serviceImage4 = req.body.serviceImage4;
		var serviceVideo = req.body.serviceVideo;
		var servicePrice = req.body.servicePrice;

		var timestamp = Math.floor(Date.now() / 1000);
		var finalServiceImage1 = "./serverData/service/" + businessId + "/" + timestamp + "/image_1.jpg";
		var finalServiceImage2 = "./serverData/service/" + businessId + "/" + timestamp + "/image_2.jpg";
		var finalServiceImage3 = "./serverData/service/" + businessId + "/" + timestamp + "/image_3.jpg";
		var finalServiceImage4 = "./serverData/service/" + businessId + "/" + timestamp + "/image_4.jpg";

		saveImageToFile(serviceImage1, finalServiceImage1);
		saveImageToFile(serviceImage2, finalServiceImage2);
		saveImageToFile(serviceImage3, finalServiceImage3);
		saveImageToFile(serviceImage4, finalServiceImage4);

		var sql = "INSERT INTO services(businessId, categoryId, subCategoryId, serviceName, serviceDesc, serviceImage1, serviceImage2, serviceImage3, serviceImage4, serviceVideo, servicePrice) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

		db.query(sql, [businessId, categoryId, subCategoryId, serviceName, serviceDesc, finalServiceImage1, finalServiceImage2, finalServiceImage3, finalServiceImage4, serviceVideo, servicePrice], (err, result) => {
			if(err){
				console.log("NEW SERVICES :: ", err);
				res.sendStatus(500);
			}else{
				res.status(200).json({
					success : true,
					message : "Done"
				})
			}
		})
	})


	// create new product
	app.post('/createNewProduct', (req, res) => {
		var businessId = req.body.businessId;
		var categoryId = req.body.categoryId;
		var subCategoryId = req.body.subCategoryId;
		var productName = req.body.productName;
		var productPrice = req.body.productPrice;
		var gst = req.body.gst;
		var productImage1 = req.body.productImage1;
		var productImage2 = req.body.productImage2;
		var productImage3 = req.body.productImage3;
		var productImage4 = req.body.productImage4;
		var productVideo = req.body.productVideo;
		var productDesc = req.body.productDesc;

		var timestamp = Math.floor(Date.now() / 1000);
		var finalProductImage1 = "./serverData/product/" + businessId + "/" + timestamp + "/image_1.jpg";
		var finalProductImage2 = "./serverData/product/" + businessId + "/" + timestamp + "/image_2.jpg";
		var finalProductImage3 = "./serverData/product/" + businessId + "/" + timestamp + "/image_3.jpg";
		var finalProductImage4 = "./serverData/product/" + businessId + "/" + timestamp + "/image_4.jpg";

		saveImageToFile(productImage1, finalProductImage1);
		saveImageToFile(productImage2, finalProductImage2);
		saveImageToFile(productImage3, finalProductImage3);
		saveImageToFile(productImage4, finalProductImage4);

		var sql = "INSERT INTO product(businessId, categoryId, subCategoryId, productName, productPrice, gst, productImage1, productImage2, productImage3, productImage4, productVideo, productDesc) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

		db.query(sql, [businessId, categoryId, subCategoryId, productName, productDesc, productPrice, gst, finalProductImage1, finalProductImage2, finalProductImage3, finalProductImage4, productVideo], (err, result) => {
			if(err){
				console.log("NEW PRODUCT :: ", err);
				res.sendStatus(500);
			}else{
				res.status(200).json({
					success : true,
					message : "Done"
				})
			}
		})

	})
}