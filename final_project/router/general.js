const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


const doesExist = (username)=>{
    let userswithsamename = users.filter((user)=>{
      return user.username === username
    });
    if(userswithsamename.length > 0){
      return true;
    } else {
      return false;
    }
  }

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (username && password) {
      if (!doesExist(username)) { 
        users.push({"username":username,"password":password});
        return res.status(200).json({message: "User successfully registred. Now you can login"});
      } else {
        return res.status(404).json({message: "User already exists!"});    
      }
    } 
    return res.status(404).json({message: "Unable to register user."});

});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  res.send(JSON.stringify(books,null,4));

});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  isbn = req.params.isbn;
  bookDetails = books[isbn]

  if(bookDetails){
      res.send(bookDetails);
  }
  else{
      res.send("Book details not found");
  }

 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const authorToFind = req.params.author;
    const matchingBooks = [];
  
    for (const bookNumber in books) {
      if (books[bookNumber].author === authorToFind) {
        matchingBooks.push({
          isbn: bookNumber,
          title: books[bookNumber].title,
          author: books[bookNumber].author,
        });
      }
    }
  
    if (matchingBooks.length > 0) {
      res.json(matchingBooks);
    } else {
      res.status(404).json({ message: 'Author not found' });
    }
  });

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const titleToFind = req.params.title;
    const matchingBooks = [];
  
    for (const bookNumber in books) {
      if (books[bookNumber].title === titleToFind) {
        matchingBooks.push({
          isbn: bookNumber,
          author: books[bookNumber].author,
          reviews: books[bookNumber].reviews

        });
      }
    }
  
    if (matchingBooks.length > 0) {
      res.json(matchingBooks);
    } else {
      res.status(404).json({ message: 'Author not found' });
    }
  });

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
        const isbn = req.params.isbn;
      
        // Check if the book with the provided ISBN exists in the books object
        if (books[isbn]) {
          const bookReviews = books[isbn].reviews;
      
          if (bookReviews.length > 0) {
            res.json(bookReviews);
          } else {
            res.status(404).json({ message: 'No reviews available for this book.' });
          }
        } else {
          res.status(404).json({ message: 'Book not found.' });
        }
      });

module.exports.general = public_users;
