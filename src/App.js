// TODO: rename everything from books to movies

import React, { Component } from 'react';
import BookList from './BookList'
import './App.css';
import * as Constants from './constants'

class App extends Component {
  constructor(props) {
    super(props);
    let all_books = Constants.MOVIES

    let ratings = localStorage.getItem('ratings') || "[]"
    ratings = JSON.parse(ratings)
    ratings.forEach(function(rating) {
      all_books[rating.id].rating = rating.rating
    })
    this.getNewRecommendations(all_books, ratings);

    this.state = {searchText: '', books: all_books, ratings: ratings, shown_books: all_books.slice(0, 20), seq_books: []};
  }

  handleTextChange = (event) => {
    const shownBooks = this.state.books.filter((a) => {
      return a.title.toLowerCase().includes(event.target.value.toLowerCase())
    }).slice(0, 10)

    this.setState({searchText: event.target.value, shown_books: shownBooks});
  }

  addRating = (rating) => {
    const ratings = this.state.ratings.filter((r) => {
      return r.id !== rating.id
    }).concat([rating])

    this.setState({
      ratings: ratings
    });

    localStorage.setItem('ratings', JSON.stringify(ratings));
    return ratings;
  }

  getNewRecommendations = (books, ratings) => {
    if(ratings.length === 0) {
      return null;
    }
    fetch('http://a66f685b.ngrok.io/predict', {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ratings)
    }).then((response) => response.json())
      .then((responseJson) => {
        const new_books = this.handleNewPredictions(responseJson.predictions, books)
        const new_seq_recs = this.handleNewSeqRecs(responseJson.next_recs, books)
        const new_shown_books = this.refreshRecommendations(new_books)

        this.setState({
          shown_books: new_shown_books,
          books: new_books,
          seq_books: new_seq_recs
        })

      })
      .catch((error) => {
        console.error(error);
      });
  }

  onRatingClick = (movie_id, rating) => {
    const books = this.state.books;
    const book_index = books.findIndex((obj => obj.id === movie_id))
    books[book_index].rating = rating;

    const new_ratings = this.addRating({id: movie_id, rating: rating})
    this.getNewRecommendations(books, new_ratings);
  }

  handleNewSeqRecs = (book_ids, books) => {
    return book_ids.map((book_id) => books[book_id])
  }

  handleNewPredictions = (predictions, books) => {
    books.forEach((book) => {
      book.predicted_rating = null
    })
    const new_books = predictions.map((pred) =>
      Object.assign(books[books.findIndex((obj) => obj.id === pred.id)], {predicted_rating: pred.predicted_rating})
    )

    new_books.forEach(function(new_book)  {
      let index = books.findIndex((obj) => obj.id === new_book.id)

      if(index >= 0) {
        books[index] = new_book
      } else {
        books = books.concat([new_book])
      }
    })

    return books
  }

  refreshRecommendations = (books) => {
    return books.filter((a) => {
      return !a.rating
    }).sort((a, b) =>{
      if(!a.predicted_rating) {
        return 1;
      } else if(!b.predicted_rating) {
        return -1;
      } else {
        return b.predicted_rating - a.predicted_rating
      }
    }).slice(0, 10)
  }

  clearRecommendations = ()  => {
    const new_books = this.state.books.map((book) => {
      book.predicted_rating = null;
      book.rating = null;
      return book;
    });

    localStorage.setItem('ratings', JSON.stringify([]));

    this.setState({
      books: new_books,
      ratings: [],
      seq_books: []
    });
    return null;
  }

  renderSeq(book) {
    return (
      <div key={book.id}>
        {book.title}
      </div>
    )
  }

  renderRating(rating) {
    const book = this.state.books[rating.id]
    return(
      <div key={rating.id}>
        {book.title} - {rating.rating}
      </div>
    )
  }

  render() {
    return (
      <div className="container">
        <h2>Movie Recommender 5K</h2>
        <div className="form-group">
          <input type="text" className="form-control" placeholder="Search" value={this.state.searchText} onChange={this.handleTextChange} />
        </div>
        <div className="row">
          <div className="col-md-6">
            <h2>Top Movies For You</h2>
            <BookList books={this.state.shown_books} onRatingClick={this.onRatingClick}/>
          </div>
          <div className="col-md-6">
            <h2>What to Watch Next</h2>
            <BookList books={this.state.seq_books} onRatingClick={this.onRatingClick}/>
          </div>
        </div>
        <hr/>
        <div className="row">
          <div className="col-md-12">
            <button className="btn btn-default" onClick={this.clearRecommendations}>
              Clear Recommendations
            </button>
            <h2>Your Ratings</h2>
            <div>
              {this.state.ratings.map((r) => this.renderRating(r))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
