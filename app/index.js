import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

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

app.get("/login", (req, res) => {
	if (req.query["token"] && req.query["token"]) {
		req.session.role = req.query["role"];
		req.session.token = atob(req.query["token"]);
		req.session.balance = 50;
	}

	if (req.session.token && req.session.role) {
		return res.redirect(`/auth?redirect=${req.query["redirect"] ?? "/"}`);
	} else {
		const redirect = "http://localhost:3000/login";
		return res.redirect(`http://localhost:3001/?redirect=${encodeURIComponent(redirect)}`);
	}
});

app.get("/logout", (req, res) => {
	req.session.destroy(function (err) {
		if (err) {
			console.log(err);
		}
		res.redirect("/");
	});
});

app.use((req, res, next) => {
	if (req.session.token && req.session.role) {
		next();
	} else {
		res.redirect("/login");
	}
});

app.get("/", (req, res) => {
	switch (req.session.role) {
		case "officer":
			return res.redirect("/manage");
		case "student":
			return res.redirect("/print");
		default:
			return res.sendStatus(404);
	}
});

app.get("/auth", (req, res) => {
	fetch("http://sso:3001/check?token=" + btoa(req.session.token) + "&role=" + req.session.role).then((check) =>
		check.status === 200 ? res.redirect(req.query["redirect"] ?? "/") : res.redirect("/logout")
	);
});

import manage from "./routers/manage.mjs";

app.use("/manage", manage);

import print from "./routers/print.mjs";

app.use("/print", print);

app.listen(3000, () => {
	console.log("App running at http://localhost:3000");
});
