const tokenVerification = require('./tokenVerify');
const jwt = require('jsonwebtoken');
const privateKey = require('./key');
const nodemailer = require('nodemailer');
const fs = require('fs');
const { time } = require('console');
const { on } = require('process');
const ROOT_DIR = "./serverData/";

// mailing agent
const transporter = nodemailer.createTransport({
	service: 'gmail',
	host : 'smtp.gmail.com',
	port : '465',
	auth: {
		user: 'amigopdtr@gmail.com',
		pass: 'Amigo123@'
	}
});

module.exports = (app, db) => {
	// all endpoints go here
	app.get('/', (req, res) => {
		res.send("Its working");
	})

	// send mail
	function sendMailUpdate(body){
		var message = {
			from: 'amigopdtr@gmail.com', 
			to: 'meghana.amigo2020@gmail.com',         
			subject: 'New update on Amigo App', 
			text: body
		};

		transporter.sendMail(message, function(err, info) {
			if (err) {
				console.log("MAILER STATUS ::" + err);
			}
		});
	}

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
		if (base64Data === undefined)
			return

		fs.mkdir(filePath.split("/image_")[0], { recursive: true }, (err) => {
			if (err) {
				console.log("DIR CREATION ERROR:", err);
			} else {
				fs.writeFile(filePath, base64Data, 'base64', function (err) {
					if (err) { console.log("ERROR" + err); }
				});
			}
		});
	}


	//delete a file
	function deleteFile(filePath) {
		if (filePath !== null) {
			var path = __dirname + + "/serverData/" + filePath.substring(1);
			if (fs.existsSync(path))
				fs.unlinkSync(path);
		}
	}

	// delete video file
	function deleteVideoFile(filePath) {
		var path = __dirname + "/serverData/" + filePath;
		if (fs.existsSync(path))
			fs.unlinkSync(path);
	}

	// login user
	app.post('/loginUser', (req, res) => {
		var phone = req.body.phone;
		var password = req.body.password;
		var sql = "SELECT * FROM user WHERE phone = ? AND password = ?";

		db.query(sql, [phone, password], (err, result) => {
			if (err) {
				console.log("ERROR ::", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json(result[0]);
			}
		})
	})

	//update password
	app.post('/updatePassword', (req, res) => {
		var phone = req.body.phone;
		var password = req.body.password;
		var sql = "UPDATE user SET password = ? WHERE phone = ?";

		db.query(sql, [password, phone], (err, result) => {
			if (err) {
				console.log(err.sqlMessage);
				res.sendStatus(500);
			} else {
				if (result.affectedRows > 0) {
					res.status(200).json({
						message: "DONE",
						success: true
					})
				} else {
					res.status(200).json({
						message: "DONE",
						success: false
					})
				}
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
		var refer = req.body.referCode;
		var notificationToken = req.body.notificationToken;
		var referCode = genReferCode();

		console.log("REFER CODE: ::" + doa);
		var sql = "INSERT INTO user(name, role_id, settings, email, password, phone, address, city, notificationToken, dob, doa, jwtToken, referCode) values(?, 2, null, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
		var selectSql = "SELECT * FROM user WHERE userId = ?";

		// register the current user
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
						db.query(selectSql, [newId], (selectErr, selectResult) => {
							if (selectErr) {
								console.log("REGISTER ERR1:: " + selectErr.sqlMessage);
								res.status(500).json({ message: selectErr.sqlMessage });
							} else {
								res.status(200).json(selectResult[0]);
								sendMailUpdate("New USER added to Amigo.");
							}
						})

						// check the refer code is valid or not, if valid add to 'refers'
						var referInsert = "INSERT INTO refers(userId, newUserId) VALUES(?, ?)";
						var referSql = "SELECT * FROM user WHERE referCode = ? LIMIT 1";

						if (newId !== undefined && refer != undefined) {
							console.log("CHECKING.....");

							db.query(referSql, [refer], (referErr, referResult) => {
								if (referErr) {
									console.log(referErr.sqlMessage);
								} else {
									if (referResult.length > 0) {
										db.query(referInsert, [referResult[0].userId, newId], (insertErr, insertResult) => {
											if (insertErr) {
												console.log(insertErr.sqlMessage);
											} else {
												console.log("REFERER added");
											}
										})
									}
								}
							})
						}
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

	// get all sub sub categories for sub category
	app.get('/getSubSubCategoryForSubCategory/:subCategoryId', tokenVerification, (req, res) => {
		var subCategoryId = req.params.subCategoryId;
		var sql = "SELECT * FROM subSubCategory where subCategoryId = ?";

		db.query(sql, [subCategoryId], (err, result) => {
			if (err) {
				console.log("SUB SUB CATEGORY ERROR ::" + err.sqlMessage);
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
		var storeImage1 = "business/" + userId + "/" + timeStamp + "/image_1.jpg";
		var storeImage2 = "business/" + userId + "/" + timeStamp + "/image_2.jpg";
		var storeImage3 = "business/" + userId + "/" + timeStamp + "/image_3.jpg";

		saveImageToFile(image1, ROOT_DIR + storeImage1);
		saveImageToFile(image2, ROOT_DIR + storeImage2);
		saveImageToFile(image3, ROOT_DIR + storeImage3);

		var sql = "INSERT INTO business(userId, storeName, storeDesc, storeContact, storeAddress, storeCity, image1, image2, image3, lat, lng, categoryId, subCategoryId) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
		db.query(sql, [userId, storeName, storeDesc, storeContact, storeAddress, storeCity, storeImage1, storeImage2, storeImage3, lat, lng, categoryId, subCategoryId], (err, result) => {
			if (err) {
				console.log("BUSINESS REG ERROR ::", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json("Done");
				sendMailUpdate("New BUSINESS added to Amigo, verify it!");
			}
		})
	})

	// get todays birthdays
	app.get('/getBirthDays/:city', tokenVerification, (req, res) => {
		var city = req.params.city;

		var sql = "SELECT * FROM user WHERE DATE_FORMAT(dob, '%m-%d') = DATE_FORMAT(CURDATE(), '%m-%d') AND approve = 1 AND city LIKE '%' ? '%'";
		db.query(sql, [city], (err, result) => {
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
	app.get('/getPosts/:city', tokenVerification, (req, res) => {
		var city = req.params.city;

		var sql = "SELECT post.*, user.userId, user.name FROM post INNER JOIN user ON post.userId = user.userId WHERE post.createdOn >= DATE_SUB(NOW(), INTERVAL 15 DAY) AND post.approve = 1 AND user.city LIKE '%' ? '%' OR user.address LIKE '%' ? '%' ORDER BY post.createdOn DESC";
		db.query(sql, [city, city], (err, result) => {
			if (err) {
				console.log("POSTS ERROR :: ", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json(result);
			}
		})
	})

	// get ads
	app.get('/getAds/:city', tokenVerification, (req, res) => {
		var city = req.params.city;

		var sql = "SELECT * FROM ads INNER JOIN business ON ads.businessId = business.businessId WHERE storeCity LIKE '%' ? '%' AND ads.approve = true ORDER BY ads.createdOn DESC";
		db.query(sql, [city], (err, result) => {
			if (err) {
				console.log("ADS ERROR :: ", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json(result);
			}
		})
	})

	// get users posts
	app.get('/getUserPosts/:userId', tokenVerification, (req, res) => {
		var userId = req.params.userId;
		var sql = "SELECT post.*, user.name FROM post INNER JOIN user ON post.userId = user.userId WHERE post.userId = ? ORDER BY post.createdOn DESC";

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
	app.get('/getUserOffers/:businessId', tokenVerification, (req, res) => {
		var businessId = req.params.businessId;
		var sql = "SELECT offers.*, business.storeName, business.image1, product.productPrice FROM offers INNER JOIN business ON offers.businessId = business.businessId INNER JOIN product ON offers.productId = product.productId WHERE offers.businessId = ? ORDER BY offers.createdOn DESC";

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
	app.get('/getUserServices/:businessId', tokenVerification, (req, res) => {
		var businessId = req.params.businessId;
		var sql = "SELECT services.*, business.storeName, business.image1 FROM services INNER JOIN business ON services.businessId = business.businessId WHERE services.businessId = ? ORDER BY services.createdOn DESC";

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
	app.get('/getUserAds/:businessId', tokenVerification, (req, res) => {
		var businessId = req.params.businessId;
		var sql = "SELECT * FROM ads WHERE businessId = ? ORDER BY ads.createdOn DESC";

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
	app.get('/getUserProducts/:businessId', tokenVerification, (req, res) => {
		var businessId = req.params.businessId;
		var sql = "SELECT product.*, business.storeName, business.image1 FROM product INNER JOIN business ON product.businessId = business.businessId WHERE product.businessId = ? ORDER BY product.createdOn";

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
	app.get('/getBusinessReviews/:businessId', tokenVerification, (req, res) => {
		var businessId = req.params.businessId;
		var sql = "SELECT reviews.*, user.name FROM reviews INNER JOIN user ON reviews.userId = user.userId WHERE businessId = ? ORDER BY reviews.createdOn DESC";

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
	app.get('/getBusinessViewers/:businessId', tokenVerification, (req, res) => {
		var businessId = req.params.businessId;
		var sql = "SELECT user.* FROM user INNER JOIN viewers ON user.userId = viewers.userId WHERE businessId = ? ORDER BY user.createdOn DESC";

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
	app.get('/getBusinessProfile/:businessId', tokenVerification, (req, res) => {
		var businessId = req.params.businessId;
		var sql = "SELECT * FROM business WHERE businessId = ?";

		db.query(sql, [businessId], (err, result) => {
			if (err) {
				console.log("BUSINESS PROFILE ERROR :: ", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json(result[0]);
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
	app.post('/createNewPost', tokenVerification, (req, res) => {
		var userId = req.body.userId;
		var postDesc = req.body.postDesc;
		var postImage1 = req.body.postImage1;
		var postImage2 = req.body.postImage2;
		var postImage3 = req.body.postImage3;
		var postImage4 = req.body.postImage4;
		var postVideo = req.body.postVideo;

		var finalPostImage1;
		var finalPostImage2;
		var finalPostImage3;
		var finalPostImage4;

		var timestamp = Math.floor(Date.now() / 1000);

		if (postImage1 !== undefined) {
			finalPostImage1 = "posts/" + userId + "/" + timestamp + "/image_1.jpg";
			saveImageToFile(postImage1, ROOT_DIR + finalPostImage1);
		}
		if (postImage2 !== undefined) {
			finalPostImage2 = "posts/" + userId + "/" + timestamp + "/image_2.jpg";
			saveImageToFile(postImage2, ROOT_DIR + finalPostImage2);
		}
		if (postImage3 !== undefined) {
			finalPostImage3 = "posts/" + userId + "/" + timestamp + "/image_3.jpg";
			saveImageToFile(postImage3, ROOT_DIR + finalPostImage3);
		}
		if (postImage4 !== undefined) {
			finalPostImage4 = "posts/" + userId + "/" + timestamp + "/image_4.jpg";
			saveImageToFile(postImage4, ROOT_DIR + finalPostImage4);
		}

		var sql = "INSERT INTO post(userId, postDesc, postImage1, postImage2, postImage3, postImage4, postVideo) VALUES(?, ?, ?, ?, ?, ?, ?)";

		db.query(sql, [userId, postDesc, finalPostImage1, finalPostImage2, finalPostImage3, finalPostImage4, postVideo], (err, result) => {
			if (err) {
				console.log("NEW PSOT :: ", err);
				res.sendStatus(500);
			} else {
				res.status(200).json({
					success: true,
					message: "Done"
				})

				sendMailUpdate("New POST added to Amigo, verify it!");
			}
		})
	})

	// create new offer
	app.post('/createNewOffer', tokenVerification, (req, res) => {
		var businessId = req.body.businessId;
		var productId = req.body.productId;
		var offerName = req.body.offerName;
		var offerDesc = req.body.offerDesc;
		var offerImage1 = req.body.offerImage1;
		var offerImage2 = req.body.offerImage2;
		var offerImage3 = req.body.offerImage3;
		var offerImage4 = req.body.offerImage4;
		var offerPrice = req.body.offerPrice;
		var offerVideo = req.body.offerVideo;

		var timestamp = Math.floor(Date.now() / 1000);
		var finalOfferImage1 = "offer/" + businessId + "/" + timestamp + "/image_1.jpg";
		var finalOfferImage2 = "offer/" + businessId + "/" + timestamp + "/image_2.jpg";
		var finalOfferImage3 = "offer/" + businessId + "/" + timestamp + "/image_3.jpg";
		var finalOfferImage4 = "offer/" + businessId + "/" + timestamp + "/image_4.jpg";

		saveImageToFile(offerImage1, ROOT_DIR + finalOfferImage1);
		saveImageToFile(offerImage2, ROOT_DIR + finalOfferImage2);
		saveImageToFile(offerImage3, ROOT_DIR + finalOfferImage3);
		saveImageToFile(offerImage4, ROOT_DIR + finalOfferImage4);

		var sql = "INSERT INTO offers(businessId, productId, offerName, offerDesc, offerPrice, offerImage1, offerImage2, offerImage3, offerImage4, offerVideo) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";


		db.query(sql, [businessId, productId, offerName, offerDesc, offerPrice, finalOfferImage1, finalOfferImage2, finalOfferImage3, finalOfferImage4, offerVideo], (err, result) => {
			if (err) {
				console.log("NEW OFFER :: ", err);
				res.sendStatus(500);
			} else {
				res.status(200).json({
					success: true,
					message: "Done"
				})


				sendMailUpdate("New OFFER added to Amigo, verify it!");
			}
		})
	})

	// create new ad
	app.post('/createNewAd', tokenVerification, (req, res) => {
		var businessId = req.body.businessId;
		var adName = req.body.adName;
		var adDesc = req.body.adDesc;
		var adImage1 = req.body.adImage1;
		var adImage2 = req.body.adImage2;
		var adImage3 = req.body.adImage3;
		var adImage4 = req.body.adImage4;
		var adVideo = req.body.adVideo;

		var timestamp = Math.floor(Date.now() / 1000);
		var finalAdImage1 = "ad/" + businessId + "/" + timestamp + "/image_1.jpg";
		var finalAdImage2 = "ad/" + businessId + "/" + timestamp + "/image_2.jpg";
		var finalAdImage3 = "ad/" + businessId + "/" + timestamp + "/image_3.jpg";
		var finalAdImage4 = "ad/" + businessId + "/" + timestamp + "/image_4.jpg";

		saveImageToFile(adImage1, ROOT_DIR + finalAdImage1);
		saveImageToFile(adImage2, ROOT_DIR + finalAdImage2);
		saveImageToFile(adImage3, ROOT_DIR + finalAdImage3);
		saveImageToFile(adImage4, ROOT_DIR + finalAdImage4);

		var sql = "INSERT INTO ads(businessId, adName, adDesc, adImage1, adImage2, adImage3, adImage4, adVideo) VALUES(?, ?, ?, ?, ?, ?, ?, ?)";

		db.query(sql, [businessId, adName, adDesc, finalAdImage1, finalAdImage2, finalAdImage3, finalAdImage4, adVideo], (err, result) => {
			if (err) {
				console.log("NEW AD :: ", err);
				res.sendStatus(500);
			} else {
				res.status(200).json({
					success: true,
					message: "Done"
				})


				sendMailUpdate("New AD added to Amigo, verify it!");
			}
		})

	})

	// create new service
	app.post('/createNewService', tokenVerification, (req, res) => {
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
		var finalServiceImage1 = "service/" + businessId + "/" + timestamp + "/image_1.jpg";
		var finalServiceImage2 = "service/" + businessId + "/" + timestamp + "/image_2.jpg";
		var finalServiceImage3 = "service/" + businessId + "/" + timestamp + "/image_3.jpg";
		var finalServiceImage4 = "service/" + businessId + "/" + timestamp + "/image_4.jpg";

		saveImageToFile(serviceImage1, ROOT_DIR + finalServiceImage1);
		saveImageToFile(serviceImage2, ROOT_DIR + finalServiceImage2);
		saveImageToFile(serviceImage3, ROOT_DIR + finalServiceImage3);
		saveImageToFile(serviceImage4, ROOT_DIR + finalServiceImage4);

		var sql = "INSERT INTO services(businessId, categoryId, subCategoryId, serviceName, serviceDesc, serviceImage1, serviceImage2, serviceImage3, serviceImage4, serviceVideo, servicePrice) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

		db.query(sql, [businessId, categoryId, subCategoryId, serviceName, serviceDesc, finalServiceImage1, finalServiceImage2, finalServiceImage3, finalServiceImage4, serviceVideo, servicePrice], (err, result) => {
			if (err) {
				console.log("NEW SERVICES :: ", err);
				res.sendStatus(500);
			} else {
				res.status(200).json({
					success: true,
					message: "Done"
				})

				sendMailUpdate("New SERVICE added to Amigo, verify it!");
			}
		})
	})


	// create new product
	app.post('/createNewProduct', tokenVerification, (req, res) => {
		var businessId = req.body.businessId;
		var categoryId = req.body.categoryId;
		var subCategoryId = req.body.subCategoryId;
		var subSubCategoryId = req.body.subSubCategoryId;
		var productName = req.body.productName;
		var productPrice = req.body.productPrice;
		var productImage1 = req.body.productImage1;
		var productImage2 = req.body.productImage2;
		var productImage3 = req.body.productImage3;
		var productImage4 = req.body.productImage4;
		var productVideo = req.body.productVideo;
		var productDesc = req.body.productDesc;
		var stock = req.body.stock;
		var brand = req.body.productBrand;

		var timestamp = Math.floor(Date.now() / 1000);
		var finalProductImage1 = "product/" + businessId + "/" + timestamp + "/image_1.jpg";
		var finalProductImage2 = "product/" + businessId + "/" + timestamp + "/image_2.jpg";
		var finalProductImage3 = "product/" + businessId + "/" + timestamp + "/image_3.jpg";
		var finalProductImage4 = "product/" + businessId + "/" + timestamp + "/image_4.jpg";

		saveImageToFile(productImage1, ROOT_DIR + finalProductImage1);
		saveImageToFile(productImage2, ROOT_DIR + finalProductImage2);
		saveImageToFile(productImage3, ROOT_DIR + finalProductImage3);
		saveImageToFile(productImage4, ROOT_DIR + finalProductImage4);

		var sql = "INSERT INTO product(businessId, categoryId, subCategoryId, subSubCategoryId, productName, productPrice, brand, productImage1, productImage2, productImage3, productImage4, productVideo, productDesc, stock) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

		db.query(sql, [businessId, categoryId, subCategoryId, subSubCategoryId, productName, productPrice, brand, finalProductImage1, finalProductImage2, finalProductImage3, finalProductImage4, productVideo, productDesc, stock], (err, result) => {
			if (err) {
				console.log("NEW PRODUCT :: ", err);
				res.sendStatus(500);
			} else {
				res.status(200).json({
					success: true,
					message: "Done"
				})

				sendMailUpdate("New PRODUCT added to Amigo, verify it!");
			}
		})

	})

	app.post('/uploadUserImage', tokenVerification, (req, res) => {
		var profileImage = req.body.profileImage;
		var userId = req.body.userId;

		var path = "user/image_" + userId + ".jpg";

		fs.mkdir(path.split("/image_")[0], { recursive: true }, (err) => {
			if (err) {
				console.log("DIR CREATION ERROR:", err);
			} else {
				fs.writeFile(ROOT_DIR + path, profileImage, 'base64', function (err) {
					if (err) { console.log("ERROR" + err); }
				});
				res.status(500).json({
					message: "Done",
					success: 1
				})
			}
		});
	})

	app.get('/getImage', (req, res) => {
		var path = __dirname + "/serverData/" + req.query.path;
		if (fs.existsSync(path)) {
			res.sendFile(path, (err) => {
				if (err) {
					console.log(err);
				}
			});
		} else {
			res.status(404);
		}
	})

	app.get('/getVideo', (req, res) => {
		var path = __dirname + "/serverData/" + req.query.path;
		if (fs.existsSync(path)) {
			res.sendFile(path, (err) => {
				if (err) {
					console.log(err);
				}
			});
		} else {
			res.status(404);
		}
	})

	app.get('/getUserImage', (req, res) => {
		var userId = req.query.userId;
		var path = __dirname + "/serverData/user/image_" + userId + ".jpg";

		if (fs.existsSync(path)) {
			res.sendFile(path, (err) => {
				if (err) {
					console.log(err);
				}
			});
		} else {
			res.status(404);
		}
	})

	// get all comments for post
	app.get('/getAllComments/:postId', tokenVerification, (req, res) => {
		var postId = req.params.postId;
		var sql = "SELECT * FROM comments WHERE postId = ? ORDER BY comments.createdOn DESC";

		db.query(sql, [postId], (err, result) => {
			if (err) {
				console.log("GET COMMENTS :: ", err);
				res.sendStatus(500);
			} else {
				res.status(200).json(result)
			}
		})
	})

	// post comment
	app.post('/postComment', tokenVerification, (req, res) => {
		var postId = req.body.postId;
		var userId = req.body.userId;
		var text = req.body.text;
		var userName = req.body.userName;
		var sql = "INSERT INTO comments(postId, userId, userName, text) VALUES(?, ?, ?, ?)";

		db.query(sql, [postId, userId, userName, text], (err, result) => {
			if (err) {
				console.log("POST COMMENTS :: ", err);
				res.sendStatus(500);
			} else {
				res.status(200).json({
					success: true,
					message: "Done"
				})
			}
		})
	})

	// add like
	app.post('/likePost', tokenVerification, (req, res) => {
		var userId = req.body.userId;
		var postId = req.body.postId;
		var sql = "INSERT INTO likes(postId, userId) VALUES(?, ?)";

		db.query(sql, [postId, userId], (err, result) => {
			if (err) {
				res.sendStatus(500);
			} else {
				res.status(200).json({
					message: "Done",
					success: true
				})
			}
		})
	})

	// add view to post
	app.post('/addView', tokenVerification, (req, res) => {
		var userId = req.body.userId;
		var postId = req.body.postId;
		var sql = "INSERT INTO views(postId, userId) VALUES(?, ?)";

		db.query(sql, [postId, userId], (err, result) => {
			if (err) {
				res.sendStatus(500);
			} else {
				res.status(200).json({
					message: "Done",
					success: true
				})
			}
		})
	})

	// delete post
	app.get('/deletePost/:postId', tokenVerification, (req, res) => {
		var postId = req.params.postId;
		var deleteSql = "DELETE FROM post WHERE postId = ?";
		var selectSql = "SELECT * FROM post WHERE postId = ?";

		//get file paths and delte those files and then delete the record
		db.query(selectSql, [postId], (err, result) => {
			if (err) {
				console.log("DELETE POST :: ", err);
				res.sendStatus(500);
			} else {
				if (result.length > 0) {
					deleteFile(result[0].postImage1);
					deleteFile(result[0].postImage2);
					deleteFile(result[0].postImage3);
					deleteFile(result[0].postImage4);
					deleteVideoFile(result[0].postVideo);

					db.query(deleteSql, [postId], (err, result) => {
						if (err) {
							console.log("DELETE POST :: ", err);
							res.sendStatus(500);
						} else {
							res.status(200).json({
								message: "Done",
								success: true
							})
						}
					})
				} else {
					res.sendStatus(500);
				}
			}
		})
	})

	// delete prooduct
	app.get('/deleteProduct/:productId', tokenVerification, (req, res) => {
		var productId = req.params.productId;
		var deleteSql = "DELETE FROM product WHERE productId = ?";
		var selectSql = "SELECT * FROM product WHERE productId = ?";

		//get file paths and delte those files and then delete the record
		db.query(selectSql, [productId], (err, result) => {
			if (err) {
				console.log("DELETE PRODUCT :: ", err);
				res.sendStatus(500);
			} else {
				if (result.length > 0) {
					deleteFile(result[0].productImage1);
					deleteFile(result[0].productImage2);
					deleteFile(result[0].productImage3);
					deleteFile(result[0].productImage4);
					deleteVideoFile(result[0].productVideo);

					db.query(deleteSql, [productId], (err, result) => {
						if (err) {
							console.log("DELETE PRODUCT :: ", err);
							res.sendStatus(500);
						} else {
							res.status(200).json({
								message: "Done",
								success: true
							})
						}
					})
				}
			}
		})
	})

	// delete offer
	app.get('/deleteOffer/:offerId', tokenVerification, (req, res) => {
		var offerId = req.params.offerId;
		var deleteSql = "DELETE FROM offers WHERE offerId = ?";
		var selectSql = "SELECT * FROM offers WHERE offerId = ?";

		//get file paths and delte those files and then delete the record
		db.query(selectSql, [offerId], (err, result) => {
			if (err) {
				console.log("DELETE OFFER :: ", err);
				res.sendStatus(500);
			} else {
				if (result.length > 0) {
					deleteFile(result[0].offerImage1);
					deleteFile(result[0].offerImage2);
					deleteFile(result[0].offerImage3);
					deleteFile(result[0].offerImage4);
					deleteVideoFile(result[0].offerVideo);

					db.query(deleteSql, [offerId], (err, result) => {
						if (err) {
							console.log("DELETE OFFER :: ", err);
							res.sendStatus(500);
						} else {
							res.status(200).json({
								message: "Done",
								success: true
							})
						}
					})
				}
			}
		})
	})

	// delete service
	app.get('/deleteService/:serviceId', tokenVerification, (req, res) => {
		var serviceId = req.params.serviceId;
		var deleteSql = "DELETE FROM services WHERE serviceId = ?";
		var selectSql = "SELECT * FROM services WHERE serviceId = ?";

		//get file paths and delte those files and then delete the record
		db.query(selectSql, [serviceId], (err, result) => {
			if (err) {
				console.log("DELETE SERVICES :: ", err);
				res.sendStatus(500);
			} else {
				if (result.length > 0) {
					deleteFile(result[0].serviceImage1);
					deleteFile(result[0].serviceImage2);
					deleteFile(result[0].serviceImage3);
					deleteFile(result[0].serviceImage4);
					deleteVideoFile(result[0].serviceVideo);

					db.query(deleteSql, [serviceId], (err, result) => {
						if (err) {
							console.log("DELETE SERVICE :: ", err);
							res.sendStatus(500);
						} else {
							res.status(200).json({
								message: "Done",
								success: true
							})
						}
					})
				}
			}
		})
	})

	// delete ad
	app.get('/deleteAd/:adId', tokenVerification, (req, res) => {
		var adId = req.params.adId;
		var deleteSql = "DELETE FROM ads WHERE adId = ?";
		var selectSql = "SELECT * FROM ads WHERE adId = ?";

		//get file paths and delte those files and then delete the record
		db.query(selectSql, [adId], (err, result) => {
			if (err) {
				console.log("DELETE AD :: ", err);
				res.sendStatus(500);
			} else {
				if (result.length > 0) {
					deleteFile(result[0].adImage1);
					deleteFile(result[0].adImage2);
					deleteFile(result[0].adImage3);
					deleteFile(result[0].adImage4);
					deleteVideoFile(result[0].adVideo);

					db.query(deleteSql, [adId], (err, result) => {
						if (err) {
							console.log("DELETE AD :: ", err);
							res.sendStatus(500);
						} else {
							res.status(200).json({
								message: "Done",
								success: true
							})
						}
					})
				}
			}
		})
	})

	// get category from cat id
	app.get('/getCategory/:categoryId', tokenVerification, (req, res) => {
		var categoryId = req.params.categoryId;
		var sql = "SELECT * FROM category WHERE categoryId = ?";

		db.query(sql, [categoryId], (err, result) => {
			if (err) {
				console.log("GET CATEGORY :: ", err);
				res.sendStatus(500);
			} else {
				res.status(200).json(result[0])
			}
		})
	})


	// check account status
	app.get('/checkVendorAccountStatus/:businessId', tokenVerification, (req, res) => {
		var businessId = req.params.businessId;

		//check if the account is less than 2 months old from now
		var twoMonthCheckSql = "SELECT * FROM business WHERE businessId = ? AND (createdOn + INTERVAL 60 DAY) >= NOW()";

		//transaction check  (select latest transaction and check for expiry)
		var transactionCheckSql = "SELECT * FROM vendorTransaction WHERE businessId = ? AND expiryOn >= NOW() ORDER BY createdOn DESC";

		db.query(twoMonthCheckSql, [businessId], (err, result) => {
			if (err) {
				console.log("ACC CHECK :: ", err);
				res.sendStatus(500);
			} else {
				//yes it is less than 2 months
				if (result.length > 0) {
					res.status(200).json({
						message: "NEW_ACC",
						success: true
					})
				}
				//account is older than 2 months
				else {
					//check in transactions
					db.query(transactionCheckSql, [businessId], (transErr, transResult) => {
						if (transErr) {
							console.log("ACC TRN CHECK :: ", transErr);
							res.sendStatus(500);
						} else {
							//account is paid for
							if (transResult.length > 0) {
								res.status(200).json({
									message: "ACC_PAID",
									success: true
								})
							}
							//account is not paid and is expired
							else {
								res.status(200).json({
									message: "ACC_EXPIRED",
									success: false
								})
							}
						}
					})
				}
			}
		})
	})

	// add transaction
	app.post('/vendorTransaction', tokenVerification, (req, res) => {
		var userId = req.body.userId;
		var businessId = req.body.businessId;
		var amountPaid = req.body.amountPaid;
		var refId = req.body.refId;
		var months = req.body.months;

		var sql = "INSERT INTO vendorTransaction(userId, businessId, amountPaid, months, expiryOn, refId) VALUES(?, ?, ?, ?, NOW() + INTERVAL " + (months * 30) + " DAY, ?)";

		db.query(sql, [userId, businessId, amountPaid, months, refId], (err, result) => {
			if (err) {
				console.log("ACC PAYMENT :: ", err);
				res.sendStatus(500);
			} else {
				console.log("ACC PAY DONE");
				res.status(200).json({
					success: true,
					message: "DONE"
				})


				sendMailUpdate("New VENDOR PAYMENT has arrived to Amigo!");
			}
		})
	})

	// add feedback
	app.post('/sendFeedback', tokenVerification, (req, res) => {
		var name = req.body.name;
		var email = req.body.email;
		var message = req.body.message;

		var sql = "INSERT INTO feedback(name, email, message) VALUES(?, ?, ?)";

		db.query(sql, [name, email, message], (err, result) => {
			if (err) {
				res.sendStatus(500);
			} else {
				res.status(200).json({
					success: true,
					message: "Done"
				})


				sendMailUpdate("New FEEDBACK arrived to Amigo!");
			}
		})
	})

	// get user profile
	app.get('/getUserProfile/:userId', tokenVerification, (req, res) => {
		var userId = req.params.userId;
		var sql = "SELECT * FROM user WHERE userId = ?";

		db.query(sql, [userId], (err, result) => {
			if (err) {
				console.log("GET USER PROFILE :: " + err.sqlMessage);
				res.sendStatus(500);
			} else {
				if (result.length > 0) {
					res.status(200).json(result[0]);
				} else {
					res.sendStatus(500);
				}
			}
		})
	})

	// update user profile
	app.post('/updateUserProfile', tokenVerification, (req, res) => {
		var userId = req.body.userId;
		var name = req.body.name;
		var city = req.body.city;
		var email = req.body.email;
		var phone = req.body.phone;
		var profileImage = req.body.profileImage;

		var sql = "UPDATE user SET name = ?, email = ?, city = ?, phone = ?, profileImage = ? WHERE userId = ?";
		var selectSql = "SELECT * FROM user WHERE userId = ?";

		var image = "./serverData/user/image_" + userId + ".jpg";

		saveImageToFile(profileImage, image);

		db.query(sql, [name, email, city, phone, image, userId], (err, result) => {
			if (err) {
				res.sendStatus(500);
			} else {
				db.query(selectSql, [userId], (selErr, selResult) => {
					if (selErr) {
						res.sendStatus(500);
					} else {
						if (selResult.length > 0) {
							console.log(selResult.length);
							res.status(200).json(selResult[0]);
						} else {
							res.sendStatus(500);
						}
					}
				})
			}
		})

	})

	app.post('/sendBDayWishes', tokenVerification, (req, res) => {
		var userId = req.body.userId;
		var senderId = req.body.senderId;
		var sql = "INSERT INTO wishes(userId, senderId) VALUES(?, ?)";

		db.query(sql, [userId, senderId], (err, result) => {
			if (err) {
				res.sendStatus(500);
			} else {
				res.status(200).send({
					success: true,
					message: "Done"
				})
			}
		})
	})

	app.get('/getUserWishes/:userId', tokenVerification, (req, res) => {
		var userId = req.params.userId;
		var sql = "SELECT wishes.*, user.name FROM wishes INNER JOIN user ON wishes.senderId = user.userId WHERE wishes.userId = ?";

		db.query(sql, [userId], (err, result) => {
			if (err) {
				console.log("WISHES GETTING ERROR :: ", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json(result);
			}
		})
	})

	// submit contest answer
	app.post('/submitContestAnswer', tokenVerification, (req, res) => {
		var userId = req.body.userId;
		var contestId = req.body.contestId;
		var answerType = req.body.answerType;
		var answerText = req.body.answerText;
		var answerImage = req.body.answerImage;
		var answerVideo = req.body.answerVideo;

		var sql = "INSERT INTO contestAnswers(userId, contestId, answerType, answerText, answerImage, answerVideo) VALUES(?, ?, ?, ?, ?, ?)";

		var timestamp = Math.floor(Date.now() / 1000);
		var finalAnswerImage = "contestAnswers/" + contestId + "/" + timestamp + "/image_1.jpg";

		saveImageToFile(answerImage, ROOT_DIR + finalAnswerImage);

		db.query(sql, [userId, contestId, answerType, answerText, finalAnswerImage, answerVideo], (err, result) => {
			if (err) {
				res.sendStatus(500);
			} else {
				res.status(200).json({
					success: true,
					message: "DONE"
				})

				sendMailUpdate("New CONTEST ANSWER added to Amigo, verify it!");
			}
		})
	})

	// customer app apis
	// http://192.168.43.248:8000/getBusinesses?city=Shrirampur&limit=20&category=-1&subcategory=-1
	app.get('/getBusinesses', tokenVerification, (req, res) => {
		var city = req.query.city;
		var limit = parseInt(req.query.limit);
		var category = parseInt(req.query.category);
		var subcategory = parseInt(req.query.subcategory);
		var sql;
		var params;

		if (category === -1 && subcategory === -1) {
			sql = "SELECT business.*, user.name FROM business INNER JOIN user ON business.userId = user.userId WHERE storeCity = ? AND business.approve = TRUE ORDER BY business.createdOn DESC  LIMIT ?";
			params = [city, limit];
		} else if (subcategory === 0) {
			sql = "SELECT business.*, user.name FROM business INNER JOIN user ON business.userId = user.userId WHERE storeCity = ? AND categoryId = ? AND business.approve = TRUE  ORDER BY business.createdOn DESC  LIMIT ? ";
			params = [city, category, limit]
		} else {
			sql = "SELECT business.*, user.name FROM business INNER JOIN user ON business.userId = user.userId WHERE storeCity = ? AND categoryId = ? AND subCategoryId = ? AND business.approve = TRUE  ORDER BY business.createdOn DESC  LIMIT ? ";
			params = [city, category, subcategory, limit]
		}


		db.query(sql, params, (err, result) => {
			if (err) {
				console.log("BUSINESS GET CUS : ", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json(result);
			}
		})
	})

	// get offers filter
	// http://192.168.43.248:8000/getOffers?city=Shrirampur&limit=20
	app.get('/getOffers', tokenVerification, (req, res) => {
		var city = req.query.city;
		var limit = parseInt(req.query.limit);

		var sql = "SELECT business.storeName, business.image1, product.productPrice, offers.* FROM offers INNER JOIN business ON business.businessId = offers.businessId INNER JOIN product ON offers.productId = product.productId WHERE business.storeCity = ? AND offers.approve = TRUE ORDER BY offers.createdOn DESC LIMIT ?";
		db.query(sql, [city, limit], (err, result) => {
			if (err) {
				console.log("OFFER GET CUS : ", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json(result);
			}
		})
	})

	// get services filter
	// http://192.168.43.248:8000/getServices?city=Shrirampur&limit=20&category=-1&subcategory=-1&pricelimit=10000
	app.get('/getServices', tokenVerification, (req, res) => {
		var city = req.query.city;
		var limit = parseInt(req.query.limit);
		var category = parseInt(req.query.category);
		var subcategory = parseInt(req.query.subcategory);
		var pricelimit = parseInt(req.query.pricelimit);
		var sql;
		var params;

		if (category === -1 && subcategory === -1) {
			sql = "SELECT business.storeName, business.image1, services.* FROM services INNER JOIN business ON services.businessId = business.businessId WHERE business.storeCity = ? AND services.servicePrice < ? AND services.approve = TRUE ORDER BY services.createdOn DESC LIMIT ?";
			params = [city, pricelimit, limit];
		} else if (subcategory === 0) {
			sql = "SELECT business.storeName, business.image1, services.* FROM services INNER JOIN business ON services.businessId = business.businessId WHERE business.storeCity = ? AND services.categoryId = ? AND services.servicePrice < ? AND services.approve = TRUE ORDER BY services.createdOn DESC LIMIT ?";
			params = [city, category, pricelimit, limit];
		} else {
			sql = "SELECT business.storeName, business.image1, services.* FROM services INNER JOIN business ON services.businessId = business.businessId WHERE business.storeCity = ? AND services.categoryId = ? AND services.subCategoryId = ? AND services.servicePrice < ? AND services.approve = TRUE ORDER BY services.createdOn DESC LIMIT ?";
			params = [city, category, subcategory, pricelimit, limit];
		}

		db.query(sql, params, (err, result) => {
			if (err) {
				console.log("SERVICES GET CUS : ", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json(result);
			}
		})
	})

	// get products
	app.get('/getProducts', tokenVerification, (req, res) => {
		var city = req.query.city;
		var limit = parseInt(req.query.limit);
		var category = parseInt(req.query.category);
		var subcategory = parseInt(req.query.subcategory);
		var subSubCategory = parseInt(req.query.subSubCategory);
		var brand = req.query.brand;
		var pricelimit = parseInt(req.query.pricelimit);
		var sql;
		var params;

		if (category === -1 && subcategory === -1) {
			sql = "SELECT business.storeName, business.image1, product.* FROM product INNER JOIN business ON product.businessId = business.businessId WHERE business.storeCity = ? AND product.productPrice < ? AND product.approve = TRUE ORDER BY product.createdOn DESC LIMIT ?";
			params = [city, pricelimit, limit];
		} else if (subcategory === 0) {
			sql = "SELECT business.storeName, business.image1, product.* FROM product INNER JOIN business ON product.businessId = business.businessId WHERE business.storeCity = ? AND product.categoryId = ? AND product.productPrice < ? AND product.approve = TRUE ORDER BY product.createdOn DESC LIMIT ?";
			params = [city, category, pricelimit, limit];
		}else {
			sql = "SELECT business.storeName, business.image1, product.* FROM product INNER JOIN business ON product.businessId = business.businessId WHERE business.storeCity = ? AND product.categoryId = ? AND product.subCategoryId = ? AND product.subSubCategoryId = ? AND brand LIKE '%' ? '%' AND product.productPrice < ? AND product.approve = TRUE ORDER BY product.createdOn DESC LIMIT ?";
			params = [city, category, subcategory, subSubCategory, brand, pricelimit, limit];
		}

		db.query(sql, params, (err, result) => {
			if (err) {
				console.log("PRODUCTS GET CUS : ", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json(result);
			}
		})
	})

	// "/searchBusiness";
	app.get('/searchBusiness', tokenVerification, (req, res) => {
		var city = req.query.city;
		var query = req.query.query;
		var sql = "SELECT user.name, user.userId, business.* FROM business INNER JOIN user ON business.userId = user.userId WHERE storeCity = ? AND storeName LIKE '%' ? '%' OR storeDesc LIKE '%' ? '%' ";

		db.query(sql, [city, query, query], (err, result) => {
			if (err) {
				console.log("BUSINESS SEARCH CUS : ", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json(result);
			}
		})
	})

	// "/searchOffers";
	app.get('/searchOffers', tokenVerification, (req, res) => {
		var city = req.query.city;
		var query = req.query.query;
		var sql = "SELECT business.storeName, business.image1, offers.* FROM offers INNER JOIN business ON offers.businessId = business.businessId WHERE business.storeCity = ? AND offerName LIKE '%' ? '%' OR offerDesc LIKE '%' ? '%' ";

		db.query(sql, [city, query, query], (err, result) => {
			if (err) {
				console.log("OFFER SEARCH CUS : ", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json(result);
			}
		})
	})

	// "/searchProducts";
	app.get('/searchProducts', tokenVerification, (req, res) => {
		var city = req.query.city;
		var query = req.query.query;
		var sql = "SELECT business.storeName, business.image1, product.* FROM product INNER JOIN business ON product.businessId = business.businessId WHERE business.storeCity = ? AND productName LIKE '%' ? '%' OR productDesc LIKE '%' ? '%' ";

		db.query(sql, [city, query, query], (err, result) => {
			if (err) {
				console.log("PRODUCT SEARCH CUS : ", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json(result);
			}
		})
	})

	// "/searchServices";
	app.get('/searchServices', tokenVerification, (req, res) => {
		var city = req.query.city;
		var query = req.query.query;
		var sql = "SELECT business.storeName, business.image1, services.* FROM services INNER JOIN business ON services.businessId = business.businessId WHERE business.storeCity = ? AND serviceName LIKE '%' ? '%' OR serviceDesc LIKE '%' ? '%' ";

		db.query(sql, [city, query, query], (err, result) => {
			if (err) {
				console.log("PRODUCT SEARCH CUS : ", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json(result);
			}
		})
	})

	// get product dettails
	app.get('/getProductDetails', tokenVerification, (req, res) => {
		var productId = req.query.productId;
		var sql = "SELECT product.*, business.storeName, business.image1 FROM product INNER JOIN business ON business.businessId = product.businessId WHERE productId = ?";

		db.query(sql, [productId], (err, result) => {
			if (err) {
				console.log("GET PRO DETAILS :: ", err.sqlMessage);
				res.sendStatus(500);
			} else {
				if (result.length > 0)
					res.status(200).json(result[0]);
				else
					res.sendStatus(404);
			}
		})
	})

	// submit review
	app.post('/submitReview', tokenVerification, (req, res) => {
		var userId = req.body.userId;
		var businessId = req.body.businessId;
		var rating = req.body.rating;
		var text = req.body.text;
		var sql = "INSERT INTO reviews(userId, businessId, rating, text) VALUES(?, ?, ?, ?)";

		db.query(sql, [userId, businessId, rating, text], (err, result) => {
			if (err) {
				console.log("REV SUBMIT :: ", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json({
					message: "DONE",
					success: true
				})
			}
		})
	})

	// add viewer
	app.post('/addViewer', tokenVerification, (req, res) => {
		var userId = req.body.userId;
		var businessId = req.body.businessId;
		var sql = "INSERT INTO viewers(userId, businessId) VALUES(?, ?)";

		db.query(sql, [userId, businessId], (err, result) => {
			res.status(200).json({
				success: true,
				message: "Done"
			});
		})
	})

	// get sold products
	app.get('/getSoldProducts', tokenVerification, (req, res) => {
		var businessId = req.query.businessId;
		var sql = "SELECT product.*, business.storeName, business.image1 FROM product INNER JOIN soldProduct ON product.productId = soldProduct.productId INNER JOIN business ON soldProduct.businessId = business.businessId WHERE soldProduct.businessId = ? ORDER BY soldProduct.createdOn DESC";

		db.query(sql, [businessId], (err, result) => {
			if (err) {
				console.log("GET_SOLD_PRO ERR :", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json(result);
			}
		})
	})

	//submit sold product
	app.post('/submitSoldProduct', tokenVerification, (req, res) => {
		var businessId = req.body.businessId;
		var productId = req.body.productId;
		var stock = req.body.stock;
		var productCode = req.body.productCode;
		var image = req.body.image;
		var sql = "INSERT INTO soldProduct(businessId, productId, stock, productCode, image) VALUES(?, ?, ?, ?, ?)";

		var timestamp = Math.floor(Date.now() / 1000);
		var finalImage = "sell/" + businessId + "/" + productId + "/" + timestamp + "/image_1.jpg";

		saveImageToFile(image, ROOT_DIR + finalImage);

		db.query(sql, [businessId, productId, stock, productCode, finalImage], (err, result) => {
			if (err) {
				console.log("SUBMIT SOLD PRO ERR :", err.sqlMessage);
				res.sendStatus(500);
			} else {
				res.status(200).json({
					message: "DONE",
					success: true
				});
			}
		})
	})
}
