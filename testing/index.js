/*
 * Fake HCMUT-SSO service
 */

const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();
const port = 3001;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use(
	session({
		resave: true,
		saveUninitialized: true,
		secret: "testing",
	})
);

app.get("/", (req, res) => {
	res.render("index", { session: req.session, redirect: encodeURIComponent(req.query["redirect"]) });
});

app.post("/login", (req, res) => {
	if (!["student", "officer"].includes(req.body?.role)) {
		return res.sendStatus(400);
	}

	req.session.role = req.body.role;

	if (req.query["redirect"]) {
		const redirect = new URL(decodeURIComponent(req.query["redirect"]));
		redirect.searchParams.set("token", btoa(req.session.id));
		redirect.searchParams.set("role", req.session.role);
		return res.redirect(redirect.toString());
	} else {
		return res.redirect("/");
	}
});

app.post("/logout", (req, res) => {
	req.session.destroy(function (err) {
		if (err) {
			console.log(err);
		}
		res.redirect("/");
	});
});

app.get("/check", (req, res) => {
	if (!req.query["token"] || !req.query["role"]) {
		return res.sendStatus(400);
	}

	req.sessionStore.get(atob(req.query["token"]), function (err, session) {
		if (err) {
			console.log(err);
		}

		if (!session || session.role !== req.query["role"]) {
			return res.sendStatus(401);
		} else {
			return res.sendStatus(200);
		}
	});
});

app.listen(port, () => {
	console.log(`Fake HCMUT-SSO service running at http://localhost:${port}`);
});
