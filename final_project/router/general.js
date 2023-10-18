const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


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
function getBookList(){
    return new Promise((resolve,reject)=>{
      resolve(books);
    })
  }
  
  // Get the book list available in the shop
  public_users.get('/',function (req, res) {
    getBookList().then(
      (book)=>res.send(JSON.stringify(book, null, 4)),
      (error) => res.send("denied")
    );  
  });
  


// Get book details based on ISBN
function getFromISBN(isbn){
    let book_ = books[isbn];  
    return new Promise((resolve,reject)=>{
      if (book_) {
        resolve(book_);
      }else{
        reject("Unable to find book!");
      }    
    })
  }
  
  // Get book details based on ISBN
  public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    getFromISBN(isbn).then(
      (book)=>res.send(JSON.stringify(book, null, 4)),
      (error) => res.send(error)
    )
   });


  
// Get book details based on author
function fetchBooksByAuthor(author) {
    return new Promise((resolve, reject) => {
      const matchingBooks = [];
      for (const bookNumber in books) {
        if (books[bookNumber].author === author) {
          matchingBooks.push({
            isbn: bookNumber,
            title: books[bookNumber].title,
            author: books[bookNumber].author,
          });
        }
      }
      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject("Author not found");
      }
    });
  }

  public_users.get('/author/:author', (req, res) => {
    const authorToFind = req.params.author;
    fetchBooksByAuthor(authorToFind)
    .then(
        result => res.send(JSON.stringify(result,null,4))
    );
    });

    




// Get all books based on title

function fetchBooksByTitle(title) {
    return new Promise((resolve, reject) => {
      const matchingBooks = [];
      for (const bookNumber in books) {
        if (books[bookNumber].title === title) {
          matchingBooks.push({
            isbn: bookNumber,
            author: books[bookNumber].author,
            reviews: books[bookNumber].reviews,
          });
        }
      }
      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject("Title not found");
      }
    });
  }
  
  // Endpoint to get books based on title
  public_users.get('/title/:title', async (req, res) => {
    const titleToFind = req.params.title;
    try {
      const matchingBooks = await fetchBooksByTitle(titleToFind);
      res.json(matchingBooks);
    } catch (error) {
      res.status(404).json({ message: error });
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
