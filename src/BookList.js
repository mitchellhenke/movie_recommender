import React, { Component } from 'react';
import Book from './Book';

class BookList extends Component {
  constructor(props) {
    super(props);

    this.state = {books: this.props.books, ratings: {}}
  }

  render() {
    return (
      <div>
        {Object.values(this.state.books).map((book) => this.renderBook(book, this.ratingClick))}
      </div>
    );
  }

  onRatingClick = (book_id, rating) => {
    const ratings = this.state.ratings;
    const books = this.state.books;
    const book_index = books.findIndex((obj => obj.id == book_id))
    ratings[book_id] = rating;
    books[book_index].rating = rating;
    this.setState({
      ratings: ratings,
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
