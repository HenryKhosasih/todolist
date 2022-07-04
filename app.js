const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const date = require(__dirname + "/date.js");

const app = express();
const localPort = 3000;

const items = [];
const workItems = [];

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema = new mongoose.Schema({
	name: String,
});

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
	name: "Coding",
});

const item2 = new Item({
	name: "Cooking",
});

const item3 = new Item({
	name: "Working",
});

const defaultItems = [item1, item2, item3];

// Item.insertMany(defaultItems, function (err) {
// 	if (err) {
// 		console.log(err);
// 	} else {
// 		console.log("Successfully added new items");
// 	}
// });

app.get("/", function (req, res) {
	// const day = date.getDate();
	Item.find(function (err, foundItems) {
		if (err) {
			console.log(err);
		} else {
			res.render("list", { listTitle: "Today", items: foundItems });
		}
	});
});

app.post("/", function (req, res) {
	const newItem = req.body.newItem;

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

app.get("/about", function (req, res) {
	res.render("about");
});

app.listen(localPort, function () {
	console.log(`ToDoList server is running at port ${localPort}`);
});
