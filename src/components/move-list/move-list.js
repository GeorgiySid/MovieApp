/* eslint-disable prettier/prettier */
import React from 'react'
import './move-list.css'
import { Alert, Flex, Spin } from 'antd'

import MovieListItem from '../move-list-item'
import MovieService from '../service/movie-service'
import SearchFilter from '../search-filter/search-filter'
import PaginationMovie from '../pagination'

export default class MovieList extends React.Component {
  movieService = new MovieService()

  state = {
    movies: [],
    loading: true,
    error: false,
    searchRes: {
      results: [],
      error: false,
    },
    currentPage: 1,
    pageSize: 6,
  }

  handleSearch = (res) => {
    this.setState({
      searchRes: res,
      currentPage: 1,
    })
  }

  handlePageChange = (page) => {
    this.setState(
      {
        currentPage: page,
      },
      () => this.fetchMovie(page)
    )
  }

  onError = () => {
    this.setState({
      error: true,
      loading: false,
    })
  }

  componentDidMount() {
    this.fetchMovie()
  }

  fetchMovie = (page = 1) => {
    this.setState({ loading: true })
    this.movieService
      .getFetch(`&page=${page}`)
      .then((data) => {
        this.setState({
          movies: data.results,
          loading: false,
        })
      })
      .catch(this.onError)
  }

  truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) {
      return text
    }
    const truncate = text.substring(0, maxLength)
    const lastSpaceIndex = truncate.lastIndexOf(' ')

    if (lastSpaceIndex === -1) {
      return truncate + '...'
    }

    return truncate.substring(0, lastSpaceIndex) + '...'
  }

  setRate = async (movieId, rating) => {
    const { onRateChange } = this.props
    if (onRateChange) {
      onRateChange(movieId, rating)
    }
  }

  render() {
    const { movies, loading, error, searchRes, currentPage, pageSize } = this.state
    const { ratedMovies, setRate, guestSessionId,genres } = this.props
    const allMovies = searchRes && searchRes.results && searchRes.results.length > 0 ? searchRes.results : movies

    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const currentMovies = allMovies.slice(startIndex, endIndex)

    const hasData = !(loading || error)
    const searchError = searchRes && searchRes.error

    const spinner = loading ? (
      <Flex className='ant-spinner-movieList' justify="center" align="center" style={{ height: '100%', width: '100%' }}>
        <Spin size="large" />
      </Flex>
    ) : null

    const content =
      hasData && !searchError
        ? currentMovies.map((movie) => (
          <MovieListItem
            key={movie.id}
            movie={movie}
            onTruncate={this.truncateText}
            ratedMovies={ratedMovies}
            setRate={(rating) => setRate(movie.id, rating)}
            guestSessionId={guestSessionId}
            ratedMoviesLocal={this.props.ratedMoviesLocal}
            onRateMovie={this.props.onRateMovie}
            genres={genres}
            onDeleteMovie={this.props.onDeleteMovie}
          />
        ))
        : []

    const errorMessage = error ? (
      <Alert message="Error" description="ERROR SRRY FOR ERROR" type="error" showIcon />
    ) : null
    const searchErrorMessage = searchError ? (
      <Alert message="Error" description="ERROR movie not found" type="error" showIcon />
    ) : null
    return (
      <div className="movie-list">
        <SearchFilter onSearch={this.handleSearch} />
        {searchErrorMessage}
        {errorMessage}
        {spinner}
        <div style={{ width: '100%'}}></div>
        {content}
        {!searchError && hasData && (
          <PaginationMovie
            current={currentPage}
            pageSize={pageSize}
            total={allMovies.length}
            onChange={this.handlePageChange}
          />
        )}
      </div>
    )
  }
}
