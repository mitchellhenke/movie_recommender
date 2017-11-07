import React, { Component } from 'react';
import Book from './Book';

class BookList extends Component {
  constructor(props) {
    super(props);

    this.ratingCallback = this.props.onRatingClick.bind(this)
  }

  componentDidUpdate = () => {
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
    return (
      <div>
        {this.props.books.map((book) => this.renderBook(book))}
      </div>
    );
  }

  renderBook(book) {
    return(
      <Book key={book.id} book={book} onRatingClick={this.ratingCallback}/>
    );
  }
}

export default BookList;
