const express = require("express");
const multer = require("multer");

const print = express.Router();

print.use((req, res, next) => {
	if (req.session.role === "student") {
		next();
	} else {
		res.sendStatus(401);
	}
});

print.get("/", (req, res) => {
	res.redirect("/print/upload");
});

const upload = multer({
	dest: "upload/",
	limits: {
		fileSize: 5 * 1024 * 1024,
		files: 1,
	},
	fileFilter: (req, file, callback) => {
		const allowedFileTypes = ["image/png", "image/jpeg", "application/pdf"];

		if (!allowedFileTypes.includes(file.mimetype)) {
			return callback(null, false);
		}

		return callback(null, true);
	},
});

print.get("/upload", (req, res) => {
	res.render("print/upload", {
		user: {
			role: req.session.role,
			balance: `${req.session.balance} pages`,
		},
	});
});

print.post("/upload", upload.single("file"), (req, res) => {
	if (!req.file) {
		res.sendStatus(400);
	} else {
		res.sendStatus(200);
	}
});

print.get("/config", (req, res) => {});

module.exports = print;
