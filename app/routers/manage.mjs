import express from "express";
import database from "../database.mjs";

const manage = express.Router();

manage.use((req, res, next) => {
	if (req.session.role === "officer") {
		next();
	} else {
		res.status(401).redirect("/");
	}
});

manage.get("/", async (req, res) => {
	try {
		res.render("manage/index", {
			user: req.session,
			printers: await database.collection("printer").find({}).toArray(),
		});
	} catch (err) {
		console.log(err);
		res.sendStatus(500);
	}
});

manage.get("/add", (req, res) => {
	res.render("manage/add", {
		user: req.session,
	});
});

manage.post("/add", async (req, res) => {
	try {
		await database.collection("printer").insertOne({
			name: req.body.name,
			location: req.body.location,
		});
		res.redirect("/manage");
	} catch (err) {
		console.log(err);
		res.status(500).redirect("/manage");
	}
});

export default manage;
