/* eslint-disable prettier/prettier */
import React from 'react'
import { Alert, Flex, Spin } from 'antd'

import MovieListItem from '../move-list-item'
import MovieService from '../service/movie-service'
import PaginationMovie from '../pagination'

export default class RatedMovieList extends React.Component {
  movieService = new MovieService()

  state = {
    loading: false,
    error: false,
    currentPage: 1,
    pageSize: 6,
  }

  onError = () => {
    this.setState({
      error: true,
      loading: false,
    })
  }


  handlePageChange = (page) => {
    this.setState(
      {
        currentPage: page,
      },
    )
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
    const { ratedMovies, guestSessionId, onRateChange, ratedMoviesLocal, genres, onDeleteMovie } = this.props
    const { loading, error,  currentPage, pageSize } = this.state


    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize

    const currentMovies = ratedMovies ? ratedMovies.slice(startIndex, endIndex) : []

    const hasData = !loading && !error && ratedMovies && ratedMovies.length > 0 

    const spinner = loading ? (
      <Flex justify="center" align="center" style={{ height: '100%', width: '100%' }}>
        <Spin size="large" />
      </Flex>
    ) : null

    const content = hasData
      ? currentMovies.map((movie) => (
        <MovieListItem
          key={movie.id}
          movie={movie}
          onTruncate={this.truncateText}
          ratedMovies = {ratedMovies}
          guestSessionId={guestSessionId}
          onRateChange={onRateChange}
          ratedMoviesLocal={ratedMoviesLocal}
          onRateMovie={this.props.onRateMovie}
          genres={genres}
          onDeleteMovie={onDeleteMovie}
        />
      ))
      : []
    const errorMessage = error ? (
      <Alert message="Error" description="ERROR SRRY FOR ERROR" type="error" showIcon />
    ) : null
    return (
      <div className="movie-list">
        {errorMessage}
        {spinner}
        <div style={{ width: '100%' }}></div>
        {content}
        {hasData && (
          <PaginationMovie
            current={currentPage}
            pageSize={pageSize}
            total={ratedMovies.length}
            onChange={this.handlePageChange}
          />
        )}
      </div>
    )
  }
}