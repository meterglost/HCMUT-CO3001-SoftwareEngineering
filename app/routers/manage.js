const express = require("express");

const manage = express.Router();

manage.use((req, res, next) => {
	if (req.session.role === "officer") {
		next();
	} else {
		res.sendStatus(401);
	}
});

module.exports = manage;
