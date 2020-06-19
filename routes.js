const tokenVerification = require('./tokenVerify');
const jwt = require('jsonwebtoken');
const privateKey = require('./key');
const nodemailer = require('nodemailer');
const fs = require('fs');

// mailing agent
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'atulpatare99@gmail.com',
		pass: 'welcometoatul'
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
		fs.writeFile(filePath, base64Data, 'base64', function (err) {
			if(err) console.log("ERROR" + err);
		});
	}

	// login user
	app.post('/loginUser', (req, res) => {
		var email = req.body.email;
		var password = req.body.password;
		var sql = "SELECT * FROM user WHERE email = ? AND password = ?";

		db.query(sql, [email, password], (err, result) => {
			if(err){
				console.log("ERROR ::", err.sqlMessage);
				res.sendStatus(500);
			}else{
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
			if(err){
				console.log("CATEGORY ERROR ::" + err.sqlMessage);
				res.sendStatus(500);
			}else{
				res.status(200).json(result);
			}
		})
	})

	// get all sub catgeories for category
	app.get('/getSubCategoryForCategory/:categoryId', tokenVerification, (req, res) => {
		var categoryId = req.params.categoryId;
		var sql = "SELECT * FROM subCategory where categoryId = ?";

		db.query(sql, [categoryId], (err, result) => {
			if(err){
				console.log("SUB CATEGORY ERROR ::" + err.sqlMessage);
				res.sendStatus(500);
			}else{
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

		var storeImage1 = "./serverData/business/userId_1.jpg";
		var storeImage2 = "./serverData/business/userId_2.jpg";
		var storeImage3 = "./serverData/business/userId_3.jpg";

		saveImageToFile(image1, storeImage1);
		saveImageToFile(image2, storeImage2);
		saveImageToFile(image3, storeImage3);

		var sql = "INSERT INTO business(userId, storeName, storeDesc, storeContact, storeAddress, storeCity, image1, image2, image3, lat, lng, categoryId, subCategoryId) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
		db.query(sql, [userId, storeName, storeDesc, storeContact, storeAddress, storeCity, storeImage1, storeImage2, storeImage3, lat, lng, categoryId, subCategoryId], (err, result) =>{
			if(err){
				console.log("BUSINESS REG ERROR ::", err.sqlMessage);
				res.sendStatus(500);
			}else{
				res.status(200).json("Done");
			}
		})
	})

	// get todays birthdays
	app.get('/getBirthDays', tokenVerification, (req, res) => {
		var sql = "SELECT * FROM user WHERE DATE(dob) = CURDATE() AND approve = 1";
		db.query(sql, (err, result) => {
			if(err){
				console.log("BIRTHDAYS ERROR :: ", err.sqlMessage);
				res.sendStatus(500);
			}else{
				res.status(200).json(result);
			}
		})
	})

	// get active contests
	app.get('/getContests', tokenVerification, (req, res) => {
		var sql = "SELECT * FROM contest WHERE active = 1";
		db.query(sql, (err, result) => {
			if(err){
				console.log("CONTESTS ERROR :: ", err.sqlMessage);
				res.sendStatus(500);
			}else{
				res.status(200).json(result);
			}
		})
	})

	// get todays birthdays
	app.get('/getPosts', tokenVerification, (req, res) => {
		var sql = "SELECT * FROM post WHERE createdOn >= DATE_SUB(NOW(), INTERVAL 15 DAY) AND active = 1";
		db.query(sql, (err, result) => {
			if(err){
				console.log("CONTESTS ERROR :: ", err.sqlMessage);
				res.sendStatus(500);
			}else{
				res.status(200).json(result);
			}
		})
	})

	// get users posts
	app.get('/getUserPosts/:userId', (req, res) => {
		var userId = req.params.userId;
		var sql = "SELECT * FROM post WHERE userId = ?";

		db.query(sql, [userId], (err, result) => {
			if(err){
				console.log("USER POSTS ERROR :: ", err.sqlMessage);
				res.sendStatus(500);
			}else{
				res.status(200).json(result);
			}
		})
	})

	// get business offers by businessId
	app.get('/getUserOffers/:businessId', (req, res) => {
		var businessId = req.params.businessId;
		var sql = "SELECT * FROM offers WHERE businessId = ?";

		db.query(sql, [businessId], (err, result) => {
			if(err){
				console.log("OFFERS ERROR :: ", err.sqlMessage);
				res.sendStatus(500);
			}else{
				res.status(200).json(result);
			}
		})
	})

	// get business services by businessId
	app.get('/getUserServices/:businessId', (req, res) => {
		var businessId = req.params.businessId;
		var sql = "SELECT * FROM services WHERE businessId = ?";

		db.query(sql, [businessId], (err, result) => {
			if(err){
				console.log("SERVICES ERROR :: ", err.sqlMessage);
				res.sendStatus(500);
			}else{
				res.status(200).json(result);
			}
		})
	})

	// get business ads by businessId
	app.get('/getUserAds/:businessId', (req, res) => {
		var businessId = req.params.businessId;
		var sql = "SELECT * FROM ads WHERE businessId = ?";

		db.query(sql, [businessId], (err, result) => {
			if(err){
				console.log("ADS ERROR :: ", err.sqlMessage);
				res.sendStatus(500);
			}else{
				res.status(200).json(result);
			}
		})
	})

	// get business products by businessId
	app.get('/getUserProducts/:businessId', (req, res) => {
		var businessId = req.params.businessId;
		var sql = "SELECT * FROM product WHERE businessId = ?";

		db.query(sql, [businessId], (err, result) => {
			if(err){
				console.log("PRODUCTS ERROR :: ", err.sqlMessage);
				res.sendStatus(500);
			}else{
				res.status(200).json(result);
			}
		})
	})

	// get business reviews by businessId
	app.get('/getBusinessReviews/:businessId', (req, res) => {
		var businessId = req.params.businessId;
		var sql = "SELECT * FROM reviews WHERE businessId = ?";

		db.query(sql, [businessId], (err, result) => {
			if(err){
				console.log("REVIEWS ERROR :: ", err.sqlMessage);
				res.sendStatus(500);
			}else{
				res.status(200).json(result);
			}
		})
	})

	// get business viewers by businessId
	app.get('/getBusinessViewers/:businessId', (req, res) => {
		var businessId = req.params.businessId;
		var sql = "SELECT user.* FROM user INNER JOIN viewers ON user.userId = viewer.userId WHERE businessId = ?";

		db.query(sql, [businessId], (err, result) => {
			if(err){
				console.log("VIEWERS ERROR :: ", err.sqlMessage);
				res.sendStatus(500);
			}else{
				res.status(200).json(result);
			}
		})
	})

	// get business profile
	app.get('/getBusinessProfile/:businessId', (req, res) => {
		var businessId = req.params.businessId;
		var sql = "SELECT * FROM business WHERE businessId = ?";

		db.query(sql, [businessId], (err, result) => {
			if(err){
				console.log("BUSINESS PROFILE ERROR :: ", err.sqlMessage);
				res.sendStatus(500);
			}else{
				res.status(200).json(result);
			}
		})
	})
}