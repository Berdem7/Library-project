const express = require("express");
const app = express();
const fs = require("fs");
const router = express.Router();
app.use(express.json());
const bodyparser = require("body-parser");
app.use(bodyparser.urlencoded({ extended: true }));

const port = 3000;
const querystring = require("querystring");
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("view options", { layout: false });

app.use("/", router);
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

router.get("/3books", function (req, res) {
  fs.readFile("data/book.json", (error, data) => {
    if (error) {
      throw error;
    } else {
      const bookArray = JSON.parse(data);
      let visibleBooks = [];
      for (i = 0; i < 1000; i++) {
        if (visibleBooks.length < 3) {
          let bookid = random(0, bookArray.books.length);
          if (!visibleBooks.includes(bookArray.books[bookid])) {
            visibleBooks.push(bookArray.books[bookid]);
            console.log(visibleBooks);
          }
        }
      }
      //   console.log(bookArray);
      res.send(visibleBooks);
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
  fs.readFile("data/book.json", (error, data) => {
    if (error) {
      throw error;
    } else {
      let bookArray = JSON.parse(data);
      let authors = bookArray.books.map((e) => e.author);
      res.send(authors);
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
      const title = req.query.title;
      console.log(title);
      const bookArray = JSON.parse(data);
      let searchedBook = [];
      for (let i = 0; i < bookArray.books.length; i++) {
        if (bookArray.books[i].title.includes(title))
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
      res.send(publisherData);
    }
  });
});

router.get("/addbook", (req, res) => {
  res.render("index");
});
router.post("/addbook", (req, res) => {
  console.log(req.body);
});

app.listen(port);
