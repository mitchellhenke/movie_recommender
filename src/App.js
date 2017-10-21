import React, { Component } from 'react';
import BookList from './BookList'
import './App.css';
import * as Constants from './constants'

class App extends Component {
  constructor(props) {
    super(props);
    let all_books = Constants.MOVIES

    this.refreshRecommendations = this.refreshRecommendations.bind(this)
    let ratings = localStorage.getItem('ratings') || "[]"
    ratings = JSON.parse(ratings)
    ratings.forEach(function(rating) {
      all_books[rating.id].rating = rating.rating
    })

    this.state = {searchText: '', books: all_books, ratings: ratings, shown_books: all_books.slice(0, 20)};
  }

  handleTextChange = (event) => {
    const shownBooks = this.state.books.filter((a) => {
      return a.title.toLowerCase().includes(event.target.value.toLowerCase())
    }).slice(0, 10)

    this.setState({searchText: event.target.value, shown_books: shownBooks});
  }

  setRatings = (ratings) => {
    this.setState({
      ratings: ratings,
    })

    localStorage.setItem('ratings', JSON.stringify(ratings));
  }

  onRatingClick = (movie_id, rating) => {
    const ratings = this.state.ratings;
    const books = this.state.books;
    const book_index = books.findIndex((obj => obj.id === movie_id))
    const new_ratings = ratings.concat([{id: movie_id, rating: rating}])
    books[book_index].rating = rating;

    this.setRatings(new_ratings)

    fetch('http://localhost:5000/predict', {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(new_ratings)
    }).then((response) => response.json())
      .then((responseJson) => {
        const new_books = this.handleNewPredictions(responseJson.predictions, books)

        this.setState({
          books: new_books
        })

      })
      .catch((error) => {
        console.error(error);
      });
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

  refreshRecommendations = () => {
    const shown_books = this.state.books.filter((a) => {
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

    this.setState({shown_books: shown_books})
  }


  render() {
    return (
      <div className="container">
        <div className="form-group">
          <input type="text" className="form-control" placeholder="Search" value={this.state.searchText} onChange={this.handleTextChange} />
          <button className="btn btn-default" onClick={this.refreshRecommendations}>
            Refresh Recommendations
          </button>
        </div>
        <BookList books={this.state.shown_books} onRatingClick={this.onRatingClick}/>
      </div>
    );
  }
}

export default App;
