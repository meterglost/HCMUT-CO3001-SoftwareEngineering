const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();
const port = 3000;

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
		fetch(`${req.protocol}://${req.get("host")}/auth`).then((resp) => {
			if (resp.status === 200) {
				return res.redirect("/");
			} else {
				return res.redirect("/logout");
			}
		});
	} else {
		const redirect = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
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
	fetch("http://localhost:3001/check?token=" + atob(req.session.token) + "&role=" + req.session.role)
		.then((resp) => resp.status)
		.then((status) => res.sendStatus(status));
});

const print = require("./routers/print");

app.use("/print", print);

app.listen(port, () => {
	console.log(`App running at http://localhost:${port}`);
});
