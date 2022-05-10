const express = require("express");
const app = express();
const fs = require("fs");
const router = express.Router();
app.use(express.json());
const bodyparser = require("body-parser");
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
const { body, validationResult } = require("express-validator");

const port = 3005;
const querystring = require("querystring");
const e = require("express");
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("view options", { layout: false });

app.use("/", router);
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

router.get("/", function (req, res) {
  fs.readFile("data/book.json", (error, data) => {
    if (error) {
      throw error;
    } else {
      const bookArray = JSON.parse(data);
      let visibleBooks = [];
      for (i = 0; i < 1000; i++) {
        if (visibleBooks.length < 3) {
          let bookid = random(0, bookArray.books.length - 1);
          if (!visibleBooks.includes(bookArray.books[bookid])) {
            visibleBooks.push(bookArray.books[bookid]);
            console.log(visibleBooks);
          }
        }
      }
      //   console.log(bookArray);
      res.render("index1.ejs", { books: visibleBooks, port: port });
      // res.send(visibleBooks);
    }
  });
});

router.get("/recent", function (req, res) {
  fs.readFile("data/book.json", (error, data) => {
    if (error) {
      throw error;
    } else {
      let bookArray = JSON.parse(data);
      let sortedBookArray = bookArray.books.sort(function (a, b) {
        let ax = a.published;
        let bx = b.published;
        if (ax < bx) {
          return 1;
        } else if (ax > bx) {
          return -1;
        } else {
          return 0;
        }
      });
      res.send(sortedBookArray);
    }
  });
});

router.get("/authors", function (req, res) {
  fs.readFile("data/booksAdded.json", (error, data) => {
    if (error) {
      throw error;
    } else {
      let bookArray = JSON.parse(data);
      let authors = bookArray.books.map((e) => e.author);
      let authorsNew = [];
      for (i = 0; i < bookArray.books.length; i++) {
        if (!authorsNew.includes(bookArray.books[i].author)) {
          authorsNew.push(bookArray.books[i].author);
        }
      }
      console.log(authorsNew);
      // res.send(authors);
      res.render("authors.ejs", {
        books: bookArray.books,
        authors: authorsNew,
        port: port,
      });
    }
  });
});

router.get("/allbooks", function (req, res) {
  fs.readFile("data/book.json", (error, data) => {
    if (error) {
      throw error;
    } else {
      let bookArray = JSON.parse(data);
      res.send(bookArray.books);
      // res.render("")
    }
  });
});

router.get("/book/:isbn_id", function (req, res) {
  fs.readFile("data/book.json", (error, data) => {
    if (error) {
      throw error;
    } else {
      const id = req.params.isbn_id;
      let bookArray = JSON.parse(data);
      let searchedBook;
      for (let i = 0; i < bookArray.books.length; i++) {
        if (bookArray.books[i].isbn == id) {
          //   res.send(bookArray.books[i]);
          searchedBook = bookArray.books[i];
        } else {
          //   res.send("Book you searched is not available in library");
        }
      }
      if (searchedBook) {
        res.send(searchedBook);
      } else {
        res.send("Book you searched is not available in library");
      }
    }
  });
});

router.get("/search", function (req, res) {
  fs.readFile("data/book.json", (error, data) => {
    if (error) {
      throw error;
    } else {
      const searchedTitle = req.query.title.toLowerCase().toString();
      console.log(searchedTitle);
      const bookArray = JSON.parse(data);
      const titles = bookArray.books.map((e) => e.title.toLowerCase());
      console.log(titles);
      let searchedBook = [];
      for (let i = 0; i < titles.length; i++) {
        if (titles[i].includes(searchedTitle))
          searchedBook.push(bookArray.books[i]);
      }
      if (searchedBook.length > 0) {
        res.send(searchedBook);
      } else {
        res.send("Book you searched is not available in our library");
      }
    }
  });
});

router.get("/bookwmostpages", function (req, res) {
  fs.readFile("data/book.json", (error, data) => {
    if (error) {
      throw error;
    } else {
      const bookArray = JSON.parse(data);
      const sortedBookArray = bookArray.books.sort(function (a, b) {
        if (a.pages > b.pages) {
          return -1;
        }
        if (a.pages < b.pages) {
          return 1;
        } else {
          return 0;
        }
      });
      res.send(sortedBookArray[0]);
    }
  });
});

router.get("/bookwleastpages", function (req, res) {
  fs.readFile("data/book.json", (error, data) => {
    if (error) {
      throw error;
    } else {
      const bookArray = JSON.parse(data);
      const sortedBookArray = bookArray.books.sort(function (a, b) {
        if (a.pages > b.pages) {
          return 1;
        }
        if (a.pages < b.pages) {
          return -1;
        } else {
          return 0;
        }
      });
      res.send(sortedBookArray[0]);
    }
  });
});

router.get("/publishers", function (req, res) {
  fs.readFile("data/book.json", (error, data) => {
    if (error) {
      throw error;
    } else {
      const bookArray = JSON.parse(data);
      let publishersList = bookArray.books.map((e) => {
        return e.publisher;
      });
      let publishers = [];
      for (i = 0; i < bookArray.books.length; i++) {
        if (!publishers.includes(bookArray.books[i].publisher)) {
          publishers.push(bookArray.books[i].publisher);
        }
      }
      const publisherData = publishers.map((e) => {
        return {
          Publisher: e,
          "total books": publishersList.filter((x) => x == e).length,
        };
      });
      console.log(publishers);
      res.render("publishers.ejs", {
        books: bookArray.books,
        publishers: publishers,
        port: port,
      });
    }
  });
});

router.get("/addbook", (req, res) => {
  res.render("index");
});
router.post(
  "/addbook",
  body("isbn").isLength({ min: 10 }),
  body("isbn").isNumeric(),
  body("pages").isNumeric(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.send(res.status(400).json({ errors: errors.array() }));
    }
    // console.log(req.body);
    fs.readFile("data/booksAdded.json", (error, data) => {
      if (error) {
        throw error;
      } else {
        let books = JSON.parse(data);
        let booksISBN = books.books.map((e) => e.isbn);
        if (!booksISBN.includes(req.body.isbn)) {
          books.books.push(req.body);
          let newbooks = JSON.stringify(books);
          console.log(newbooks);
          fs.writeFile("data/booksAdded.json", newbooks, (error) => {
            if (error) {
              console.log(error);
            } else {
              let message = { message: `Book is added` };
              fs.readFile("data/log.json", (error, data) => {
                if (error) {
                  throw error;
                } else {
                  let log = JSON.parse(data);
                  log.push(message);
                  fs.writeFile(
                    "data/log.json",
                    JSON.stringify(log),
                    (error) => {
                      if (error) {
                        throw error;
                      } else {
                        // res.send("Book is added successfully")
                        res.send("Added Successfully");
                      }
                    }
                  );
                }
              });

              // res.send("Added Successfully");
            }
          });
        } else {
          res.send("This book is already in our library");
        }
      }
    });
  }
);

// router.get("/allbooksejs", (req, res) => {
//   res.render("index");
// });

router.get("/allbooksejs", function (req, res) {
  fs.readFile("data/booksAdded.json", (error, data) => {
    if (error) {
      throw error;
    } else {
      let bookArray = JSON.parse(data).books;
      res.render("allbooks1.ejs", { books: bookArray, port: port });
    }
  });
});

router.post("/allbooksejs", (req, res) => {
  console.log(req.body.delete);
  fs.readFile("data/booksAdded.json", (error, data) => {
    if (error) {
      throw error;
    } else {
      let books = JSON.parse(data);
      // const deletedBook = JSON.parse(data).books[req.body].title;
      books.books.splice(req.body.delete, 1);
      let newbooks = JSON.stringify(books);
      // console.log(deletedBook);
      // console.log(newbooks);
      fs.writeFile("data/booksAdded.json", newbooks, (error) => {
        if (error) {
          console.log(error);
        } else {
          let message = { message: `Book is deleted` };
          fs.readFile("data/log.json", (err, data) => {
            if (err) {
              throw err;
            } else {
              let log = JSON.parse(data);
              log.push(message);
              fs.writeFile("data/log.json", JSON.stringify(log), (error) => {
                if (error) {
                  throw error;
                } else {
                  // res.send("Book is added successfully")
                  let bookArray = JSON.parse(newbooks).books;
                  res.render("allbooks1", { books: bookArray, port: port });
                }
              });
            }
          });
        }
      });
    }
  });
});

app.listen(port);
