const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const localPort = 3000;

let items = [];
let workItems = [];

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

	res.render("list", { listTitle: day, items: items });
});

app.post("/", function (req, res) {
	let newItem = req.body.newItem;

	if (req.body.list == "Work") {
		workItems.push(newItem);
		res.redirect("/work");
	} else {
		items.push(newItem);
		res.redirect("/");
	}
});

app.get("/work", function (req, res) {
	res.render("list", { listTitle: "Work", items: workItems });
});

app.listen(localPort, function () {
	console.log(`ToDoList server is running at port ${localPort}`);
});
