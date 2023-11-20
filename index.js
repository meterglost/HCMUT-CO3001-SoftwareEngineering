const express = require("express");

const app = express();
const port = 3000;

app.set("view engine", "ejs");

app.use(express.static("public"));

app.get("/", (req, res) => {
	res.render("template", {
		components: {
			header: "header",
			main: "pages/index",
			footer: "footer",
		},
		user: {
			name: "Username",
			balance: 0,
		},
	});
});

app.listen(port, () => {
	console.log(`App running at http://localhost:${port}`);
});
