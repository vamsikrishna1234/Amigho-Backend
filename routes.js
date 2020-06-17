const tokenVerification = require('./tokenVerify');
const jwt = require('jsonwebtoken');
const privateKey = require('./key');
const nodemailer = require('nodemailer');

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
		var sql = "SELECT * FROM user";

		db.query(sql, (err, result) => {
			if(err){
				res.send(500);
				console.log("ERROR:", err.sqlMessage);
			}else{
				res.json(result);
			}
		})
	})

	// reg
	app.post('/reg', (req, res) => {
		
	})
}