import React, { Component } from 'react';
import Book from './Book';

class BookList extends Component {
  constructor(props) {
    super(props);

    this.state = {all_books: this.props.all_books, books: this.props.books, ratings: []}
  }

  componentDidUpdate = () => {
    window.scrollTo(0,0);
  }

  compareBooks(a, b) {
    if(a.predicted_rating && b.predicted_rating && !a.rating && b.rating) {
      return -1
    } else if(a.predicted_rating && b.predicted_rating && a.rating && !b.rating) {
      return 1
    } else if(a.predicted_rating && b.predicted_rating) {
      return b.predicted_rating - a.predicted_rating
    } else if(b.predicted_rating) {
      return 1
    } else if(a.predicted_rating) {
      return -1
    } else if(a.rating && b.rating) {
      return b.rating - a.rating
    } else if(b.rating) {
      return 1
    } else if(a.rating) {
      return -1
    } else {
      return a.title.localeCompare(b.title)
    }
  }

  render() {
    const sorted_books = this.state.books.sort((a,b) =>
      this.compareBooks(a,b)
    )

    return (
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            {sorted_books.map((book) => this.renderBook(book, this.ratingClick))}
          </div>
        </div>
      </div>
    );
  }

  onRatingClick = (book_id, rating) => {
    const ratings = this.state.ratings;
    const books = this.state.books;
    const book_index = books.findIndex((obj => obj.id === book_id))
    const new_ratings = ratings.concat([{id: book_id, rating: rating}])
    books[book_index].rating = rating;


    fetch('http://localhost:5000/predict', {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(new_ratings)
    }).then((response) => response.json())
      .then((responseJson) => {
        this.handleNewPredictions(responseJson.predictions)

      })
      .catch((error) => {
        console.error(error);
      });


    this.setState({
      ratings: new_ratings,
      books: books
    })
  }

  handleNewPredictions = (predictions) => {
    let books = this.state.books
    const new_books = predictions.map((pred) =>
      Object.assign(this.state.all_books[this.state.all_books.findIndex((obj) => obj.id === pred.id)], {predicted_rating: pred.predicted_rating})
    )

    console.log(new_books.map((book => book.title)))

    new_books.forEach(function(new_book)  {
      let index = books.findIndex((obj) => obj.id === new_book.id)

      if(index >= 0) {
        books[index] = new_book
      } else {
        books = books.concat([new_book])
      }
    })


    this.setState({
      books: books
    })
  }

  renderBook(book, ratingClick) {
    return(
      <Book key={book.id} book={book} onRatingClick={this.onRatingClick}/>
    );
  }
}

export default BookList;
