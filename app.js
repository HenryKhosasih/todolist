const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

let port = process.env.PORT;
if (port == null || port == "") {
	port = 3000;
}

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

// connect to mongo db atlas in the cloud
mongoose.connect(
	"mongodb+srv://admin-henry:Test123@cluster0.z5agn.mongodb.net/todolist?retryWrites=true&w=majority"
);

const itemsSchema = {
	name: String,
};

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
	name: "Welcome to your todolist!",
});

const item2 = new Item({
	name: "Hit the + button to add a new item.",
});

const item3 = new Item({
	name: "<-- Hit this to delete an item.>",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
	name: String,
	items: [itemsSchema],
};

const List = mongoose.model("list", listSchema);

app.get("/", function (req, res) {
	Item.find(function (err, foundItems) {
		if (foundItems.length === 0) {
			// populate with default items
			Item.insertMany(defaultItems, function (err) {
				if (err) {
					console.log(err);
				} else {
					console.log("Successfully added default items");
				}
			});
			res.redirect("/");
		} else {
			// render list items
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

	// add new items for root list
	if (listName === "Today") {
		item.save();
		res.redirect("/");
	} else {
		// add new items for custom list
		List.findOne({ name: listName }, function (err, foundList) {
			foundList.items.push(item);
			foundList.save();
			res.redirect("/" + listName);
		});
	}
});

app.post("/delete", function (req, res) {
	const checkedItemId = req.body.checkbox;
	const listName = req.body.listName;

	if (listName === "Today") {
		// remove items for root list
		Item.findByIdAndRemove(checkedItemId, function (err) {
			if (!err) {
				res.redirect("/");
			}
		});
	} else {
		// remove items for custom list
		List.findOneAndUpdate(
			{ name: listName },
			{ $pull: { items: { _id: checkedItemId } } }, // mongodb operator to remove an item from items array
			function (err, foundList) {
				if (!err) {
					res.redirect("/" + listName);
				}
			}
		);
	}
});

app.get("/:customListName", function (req, res) {
	const customListName = _.capitalize(req.params.customListName);

	List.findOne({ name: customListName }, function (err, foundItems) {
		if (!err) {
			if (!foundItems) {
				// create new list if never created in db
				const list = new List({
					name: customListName,
					items: defaultItems,
				});

				list.save();
				res.redirect("/" + customListName);
			} else {
				// render items if list was created previously
				res.render("list", {
					listTitle: foundItems.name,
					items: foundItems.items,
				});
			}
		}
	});
});

app.listen(port, function () {
	console.log(`ToDoList server is running at port ${port}`);
});
