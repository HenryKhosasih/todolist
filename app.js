const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const localPort = 3000;

let items = [];

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

app.get("/", function (req, res) {
	const today = new Date();
	const options = {
		weekday: "long",
		day: "numeric",
		month: "long",
	};

	const day = today.toLocaleDateString("en-AU", options);

	res.render("list", { day: day, items: items });
});

app.post("/", function (req, res) {
	items.push(req.body.newItem);
	res.redirect("/");
});

app.listen(localPort, function () {
	console.log(`ToDoList server is running at port ${localPort}`);
});
