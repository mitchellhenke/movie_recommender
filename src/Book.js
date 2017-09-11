import React, { Component } from 'react';

class Book extends Component {
  render() {
    return (
      <div>
        <h2>{this.props.book.title}</h2>
        <div className="btn-group" role="group" aria-label="...">
          {this.ratingButton(1, this.props.book.rating === 1, this.props.onRatingClick)}
          {this.ratingButton(2, this.props.book.rating === 2, this.props.onRatingClick)}
          {this.ratingButton(3, this.props.book.rating === 3, this.props.onRatingClick)}
          {this.ratingButton(4, this.props.book.rating === 4, this.props.onRatingClick)}
          {this.ratingButton(5, this.props.book.rating === 5, this.props.onRatingClick)}
        </div>
      </div>
    );
  }

  handleRatingClick = (event, book_id, value, callback) => {
    callback(book_id, value)
  }

  ratingButton(value, active, ratingClick) {
    if(active) {
      return(
        <button onClick={(event) => this.handleRatingClick(event, this.props.book.id, value, ratingClick)} type="button" className="btn btn-default active">{value}</button>
      );
    } else {
      return(
        <button onClick={(event) => this.handleRatingClick(event, this.props.book.id, value, ratingClick)} type="button" className="btn btn-default">{value}</button>
      );
    }
  }
}

export default Book;
