const nodemailer = require('nodemailer');
const config = require('../config/config');

const sendEmail = async (options) => {

	const transporter = nodemailer.createTransport({
		host: config.emailHost,
		port: config.emailPort,
		auth: {
			user: config.emailUserName,
			pass: config.emailPassword,
		},
	});

	const mailOptions = {
		from: 'Abdelrahman Ali <hello@abdo.io>',
		to: options.email,
		subject: options.subject,
		text: options.message,
	};

	await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
