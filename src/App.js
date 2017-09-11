import React, { Component } from 'react';
import BookList from './BookList'
import './App.css';
import * as Constants from './constants'

class App extends Component {
  render() {
    const books = Object.values(Constants.BOOKS).slice(0, 10)
    return (
      <BookList books={books} ratingClick={this.onRatingClick}/>
    );
  }
}

export default App;
