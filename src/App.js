// TODO: rename everything from books to movies

import React, { Component } from 'react';
import NProgress from 'nprogress'
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

    this.state = {searchText: '', books: all_books, ratings: ratings, shown_books: all_books.slice(0, 20), seq_books: [], resultsTitle: "Top Movies For You"};
  }

  handleTextChange = (event) => {
    if(event.target.value === "") {
      const recommended_books = this.refreshRecommendations(this.state.books)
      this.setState({searchText: event.target.value,
        shown_books: recommended_books,
        resultsTitle: "Top Movies For You"});
    } else {
      const shownBooks = this.state.books.filter((a) => {
        return a.title.toLowerCase().includes(event.target.value.toLowerCase())
      }).slice(0, 10)

      this.setState({searchText: event.target.value,
        shown_books: shownBooks,
        resultsTitle: "Search Results"});
    }
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
    NProgress.start();
    fetch('https://mh-movie-recommender.herokuapp.com/predict', {
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
          resultsTitle: "Top Movies For You",
          shown_books: new_shown_books,
          books: new_books,
          seq_books: new_seq_recs
        })

        NProgress.done();
      })
      .catch((error) => {
        console.error(error);
        NProgress.done();
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
      return !a.rating && a.predicted_rating
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
            <h2>{this.state.resultsTitle}</h2>
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
