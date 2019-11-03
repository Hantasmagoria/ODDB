// Dependencies
const express = require("express");
const methodOverride = require("method-override");
const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));

// 'Data'
const placeholders = require("./models/placeholders.js");

// Index
app.get("/placeholders", (req, res) => {
  res.render("index.ejs", {
    placeholders: placeholders
  });
});

// New
app.get("/placeholders/new", (req, res) => {
  res.render("new.ejs");
});

// Show
app.get("/placeholders/:index", (req, res) => {
  const currentplaceholder = placeholders[req.params.index];
  res.render("show.ejs", {
    placeholder: currentplaceholder
  });
});

// Create
app.post("/placeholders", (req, res) => {
  placeholders.push(req.body);
  res.redirect("/placeholders");
});

//Delete
app.delete("/placeholders/:index", (req, res) => {
  placeholders.splice(req.params.index, 1); //remove the item from the array
  res.redirect("/placeholders"); //redirect back to index route
});

// edit
app.get("/placeholders/:index/edit", (req, res) => {
  res.render(
    "edit.ejs", //render views/edit.ejs
    {
      //pass in an object that contains
      placeholder: placeholders[req.params.index], //the placeholder object
      index: req.params.index //... and its index in the array
    }
  );
});

app.listen(PORT, () => {
  console.log("listening on port", PORT);
});
