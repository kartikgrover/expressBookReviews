const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Error logging in. Username and password are required." });
    }
  
    if (authenticatedUser(username, password)) {
      let accessToken = jwt.sign({
        data: password
      }, 'access', { expiresIn: 60 * 60 });
  
      req.session.authorization = {
        accessToken,
        username
      };
      return res.status(200).send("User successfully logged in");
    } else {
      return res.status(401).json({ message: "Invalid Login. Check username and password." });
    }
  });
  

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization?.username;
    const isbn = req.params.isbn;
    const review = req.query.review;
  
    if (!username) {
      return res.status(401).json({ message: "User not authenticated." });
    }
  
    if (!isbn || !review) {
      return res.status(400).json({ message: "ISBN and review are required." });
    }
  
    if (books[isbn]) {
      // Check if the user has already reviewed this book
      if (books[isbn].reviews && books[isbn].reviews[username]) {
        // Modify the existing review
        books[isbn].reviews[username] = review;
        return res.status(200).json({ message: "Review modified successfully." });
      } else {
        // Add a new review for the user
        if (!books[isbn].reviews) {
          books[isbn].reviews = {}; // Ensure that reviews is an object
        }
        books[isbn].reviews[username] = review;
        return res.status(201).json({ message: "Review added successfully." });
      }
    } else {
      return res.status(404).json({ message: "Book not found." });
    }
  });
  // Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization?.username;
    const isbn = req.params.isbn;
  
    if (!username) {
      return res.status(401).json({ message: "User not authenticated." });
    }
  
    if (!isbn) {
      return res.status(400).json({ message: "ISBN is required." });
    }
  
    if (books[isbn]) {
      // Check if the user has reviewed this book
      if (books[isbn].reviews && books[isbn].reviews[username]) {
        // Delete the user's review
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: "Review deleted successfully." });
      } else {
        return res.status(404).json({ message: "User's review not found for this book." });
      }
    } else {
      return res.status(404).json({ message: "Book not found." });
    }
  });
  
  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
