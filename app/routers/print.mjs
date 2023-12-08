import express from "express";
import multer from "multer";
import database from "../database.mjs";
import { ObjectId } from "mongodb";

const print = express.Router();

print.use((req, res, next) => {
	if (req.session.role === "student") {
		next();
	} else {
		res.status(401).redirect("/");
	}
});

print.get("/", async (req, res) => {
	try {
		res.render("print/index", {
			user: req.session,
			printRequests: await database.collection("request").find({ userId: req.session.token }).toArray(),
		});
	} catch (err) {
		console.log(err);
		res.sendStatus(500);
	}
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

print.post("/upload", upload.single("file"), async (req, res) => {
	if (!req.file) return res.sendStatus(400);

	const printReq = await database.collection("request").insertOne({
		userId: req.session.token,
		fileId: req.file.filename,
		fileName: req.file.originalname,
	});

	req.session.printRequestId = printReq.insertedId;

	res.redirect("/print/config");
});

print.use((req, res, next) => {
	if (!req.session.printRequestId) {
		return res.status(404).redirect("/print");
	} else {
		next();
	}
});

print.get("/config", async (req, res) => {
	res.render("print/config", {
		user: {
			role: req.session.role,
			balance: `${req.session.balance} pages`,
		},
		printers: await database.collection("printer").find({}).toArray(),
	});
});

print.post("/config", async (req, res) => {
	try {
		await database.collection("request").updateOne(
			{ _id: new ObjectId(req.session.printRequestId) },
			{
				$set: {
					printerId: req.body.printer,
					paperSize: req.body.paperSize,
					side: req.body.side,
					color: req.body.color,
					layout: req.body.layout,
					copies: req.body.copies,
				},
			}
		);
		res.redirect("/print");
	} catch (err) {
		console.log(err);
		return res.status(400).redirect("/print/config");
	}
});

export default print;
