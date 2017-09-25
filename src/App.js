import React, { Component } from 'react';
import BookList from './BookList'
import './App.css';
import * as Constants from './constants'

class App extends Component {
  render() {
    const all_books = Object.values(Constants.BOOKS)
    const books = all_books.slice(0, 20)
    return (
      <BookList books={books} all_books={all_books} ratingClick={this.onRatingClick}/>
    );
  }
}

export default App;
