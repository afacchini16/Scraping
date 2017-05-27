/* Scraper: Server #3  (18.2.1)
 * ========================= */

// Dependencies:

// Snatches HTML from URLs
var request = require("request");
// Scrapes our HTML
var cheerio = require("cheerio");
var express = require('express');
var mongojs = require('mongojs');
var mongoose = require("mongoose");
var app = express();
var logger = require("morgan");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");



var databaseURL = "posts";
var collections = ["awwards"];
var db = mongojs(databaseURL, collections);
var Post = require('./Post.js');
var Promise = require("bluebird");

var PORT = process.env.PORT || 3000;

app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended:false
}));

app.use(express.static("public"));

mongoose.connect("mongodb://localhost/posts");

db.on("error", function(error){
  console.log("Mongoose error: " + error);
});
db.once("open", function(){
  console.log("Mongoose connection successful");
});

// First, tell the console what server3.js is doing
console.log("\n******************************************\n" +
            "Look at the image of every award winner in \n" +
            "one of the pages of awwwards.com. Then,\n" +
            "grab the image's source URL." +
            "\n******************************************\n");


app.get("/scrape", function(req, res){
  // Run request to grab the HTML from awwards's clean website section
  request("https://sandiego.craigslist.org/search/msa", function(error, response, html) {

    // Load the HTML into cheerio
    var $ = cheerio.load(html);

    // Make an empty array for saving our scraped info
    var result = [];
    // console.log("response: " + response);
    // console.log("html: " + html);

    // With cheerio, look at each award-winning site, enclosed in "figure" tags with the class name "site"
    $(".result-row").each(function(i, element) {

      /* Cheerio's find method will "find" the first matching child element in a parent.
      *    We start at the current element, then "find" its first child a-tag.
      *    Then, we "find" the lone child img-tag in that a-tag.
      *    Then, .attr grabs the imgs src value.
      * So: <figure>  ->  <a>  ->  <img src="link">  ->  "link"  */
      
      var title = $(element).find(".result-title").text();
      var price = $(element).find(".result-meta").find(".result-price").text();
      var time = $(element).find("time").attr("title");
      var link = "https://sandiego.craigslist.org" + $(element).find("a").attr("href");
      
      var newPost = new Post({
        title: title,
        price: price,
        time: time,
        link: link
      });
      console.log("mongoDB updated");

      // console.log("newPost: " + newPost);

      newPost.save(function(error, doc){
      if (error){
        console.log("error saving: " + error);
      }
      else {
        //  console.log("doc: " +JSON.stringify(doc.title));
      }
      });

      // Push the image's URL (saved to the imgLink var) into the result array
      result.push({ 
        title: title,
        price: price,
        time: time,
        link: link,
        comments: [] 
      });
    });

  // With each link scraped, log the result to the coesnsole
  //  console.log(result);
});

app.get("/", function(req, res){ 
  Post.find({}, function(error, results){

    res.render("index", {posts:results});
});
});

app.get("/posts/all", function(request, response){
   Post.find({}, function(error, results){
        if (error){
          console.log("error at posts/all, error: " + error);
        }
        else{
          console.log("response.render(results)");
        response.render(results);
        }
   });
});
});

app.post("/submit", function(request, response){
  console.log("SUBMIT");
  var comment = request.body;
  Post.save(function(error, doc){
  Post.findOneAndUpdate({}, {$push: doc._id}, function(error, newComment){
    if (error){
      response.send(error);
    }
    else {
      response.send(newComment);
    }
  });
});
});

app.listen(PORT, function(){
  console.log("Listening on port " + PORT);
});
