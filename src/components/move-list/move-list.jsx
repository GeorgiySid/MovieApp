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
    pageSize: 6,
  }

  handleSearch = (res) => {
    this.setState({
      movies: res.results, // Здесь обновляем состояние
      loading: false,
    })
    this.props.onSearch(res, document.querySelector('input[placeholder="search movie"]').value)
  }
  handlePageChange = (page) => {
    this.props.onPageChange(page)
  }

  onError = () => {
    this.setState({
      error: true,
      loading: false,
    })
  }
  componentDidMount() {
    this.fetchMovie(this.props.currentPage)
  }
  componentDidUpdate(prevProps) {
    if (prevProps.currentPage !== this.props.currentPage) {
      this.fetchMovie(this.props.currentPage)
    } else if (prevProps.searchQuery !== this.props.searchQuery) {
      this.fetchMovie(this.props.currentPage)
    }
  }

  fetchMovie = (page = 1) => {
    this.setState({ loading: true })
    const query = this.props.searchQuery
    this.movieService
      .getFetch(`${query && `&query=${query}`}&page=${page}`)
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

  render() {
    const { movies, loading, error,  pageSize } = this.state
    const { ratedMovies, guestSessionId, genres, searchRes, currentPage, searchQuery } = this.props
    const allMovies =
          searchRes && searchRes.results && searchRes.results.length > 0
            ? searchRes.results
            : movies


    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const currentMovies = allMovies.slice(startIndex, endIndex)

    const hasData = !(loading || error)
    const searchError = searchRes && searchRes.error

    const spinner = loading ? (
      <Flex className="ant-spinner-movieList" justify="center" align="center" style={{ height: '100%', width: '100%' }}>
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
        <SearchFilter onSearch={(res) => this.handleSearch(res, document.querySelector('input[placeholder="search movie"]').value)} searchQuery={searchQuery} />
        {searchErrorMessage}
        {errorMessage}
        {spinner}
        <div style={{ width: '100%' }}></div>
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