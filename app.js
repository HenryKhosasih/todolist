const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const date = require(__dirname + "/date.js");

const app = express();
const localPort = 3000;

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

const listSchema = new mongoose.Schema({
	name: String,
	items: [itemsSchema],
});

const List = mongoose.model("list", listSchema);

app.get("/", function (req, res) {
	Item.find(function (err, foundItems) {
		if (foundItems.length === 0) {
			Item.insertMany(defaultItems, function (err) {
				if (err) {
					console.log(err);
				} else {
					console.log("Successfully added default items");
				}
			});
			res.redirect("/");
		} else {
			res.render("list", { listTitle: "Today", items: foundItems });
		}
	});
});

app.post("/", function (req, res) {
	const itemName = req.body.newItem;
	const listName = req.body.list;

	const item = new Item({
		name: itemName,
	});

	// root list
	if (listName === "Today") {
		item.save();
		res.redirect("/");
	} else {
		// custom list
		List.findOne({ name: listName }, function (err, foundList) {
			foundList.items.push(item);
			foundList.save();
			res.redirect("/" + listName);
		});
	}
});

app.post("/delete", function (req, res) {
	const itemID = req.body.checkbox;
	Item.findByIdAndRemove(itemID, function (err) {
		if (!err) {
			res.redirect("/");
		}
	});
});

app.get("/:customListName", function (req, res) {
	const customListName = req.params.customListName;

	List.findOne({ name: customListName }, function (err, foundItems) {
		if (!err) {
			if (!foundItems) {
				const list = new List({
					name: customListName,
					items: defaultItems,
				});

				list.save();
				res.redirect("/" + customListName);
			} else {
				res.render("list", {
					listTitle: foundItems.name,
					items: foundItems.items,
				});
			}
		}
	});
});

app.get("/about", function (req, res) {
	res.render("about");
});

app.listen(localPort, function () {
	console.log(`ToDoList server is running at port ${localPort}`);
});
