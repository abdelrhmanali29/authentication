const nodemailer = require('nodemailer');
const config = require('../config/config');

const sendEmail = async (options) => {
	// 1) Create a transporter
	const transporter = nodemailer.createTransport({
		host: config.emailHost,
		port: config.emailPort,
		auth: {
			user: config.emailUserName,
			pass: config.emailPassword,
		},
	});

	// 2) Define the email options
	const mailOptions = {
		from: 'Abdelrahman Ali <hello@abdo.io>',
		to: options.email,
		subject: options.subject,
		text: options.message,
		// html:
	};

	// 3) Actually send the email
	await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
