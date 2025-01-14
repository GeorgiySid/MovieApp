/* eslint-disable prettier/prettier */
import React from 'react'
import { Flex, Spin } from 'antd'

import MovieList from '../move-list'
import RatedMovieList from '../rated-movie-list'
import MovieService from '../service/movie-service'

import './tabs.css'

export default class Tabs extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeTab: 'search',
      guestSessionId: null,
      ratedMovies: [],
      error: null,
      loadingRatedMovies: false,
      ratedMoviesLocal: {},
      genres: null,
      loadingGenres: true,
      errorGenres: null,
      searchRes: {
        results:[],
        error: false,
      },
      searchQuery: '',
      currentPage:1,
    }
    this.movieService = new MovieService()
  }

  async componentDidMount() {
    await this.fetchGuestSession()
    await this.fetchGenres()
  
  }

  fetchGuestSession = async () => {
    try {
      const session = await this.movieService.createGuestSession()
      this.setState({ guestSessionId: session.guest_session_id })
    } catch (err) {
      this.setState({ error: 'Ошибка при получении гостевой сессии: ' + err.message })
      console.error('Ошибка при получении гостевой сессии:', err)
    }
  }
  fetchGenres = async () => {
    this.setState({ loadingGenres: true, errorGenres: null })
    try {
      const fetchedGenres = await this.movieService.getGenres()
      this.setState({ genres: fetchedGenres, loadingGenres: false })
    } catch (error) {
      this.setState({ errorGenres: 'Ошибка при получении списка жанров: ' + error.message, loadingGenres: false })
      console.error('Ошибка при получении списка жанров', error)
    }
  }

  getRatedMovies = async (guestSessionId) => {
    this.setState({loadingRatedMovies:true, error:null})
    try {
      const response = await this.movieService.getRatedMovie(guestSessionId)
      if (response && response.results) {
        this.setState({ratedMovies: response.results, loadingRatedMovies:false})
      } else {
        this.setState({ratedMovies:[], loadingRatedMovies:false})
      }
    } catch (error) {
      if (error.message.includes('Список оцененных фильмов не найден.')) {
        this.setState({ratedMovies:[], loadingRatedMovies:false})
        return
      }
      this.setState({error: 'Ошибка при получении оцененных фильмов: ' + error.message, loadingRatedMovies:false})
      console.error('Ошибка при получении оцененных фильмов:', error)
    }
  }

  handleTabClick = (tab) => {
    this.setState({ activeTab: tab }, () => {
      if (tab === 'rated' && this.state.guestSessionId) {
        this.getRatedMovies(this.state.guestSessionId)
      }
    })
  }

  handleRateMovie = (movieId, value) => {
    this.setState((prevState) => ({
      ratedMoviesLocal: { ...prevState.ratedMoviesLocal, [movieId]: value },
    }))
  }

  handleSearch = (res, query) => {
    this.setState({
      searchRes: res,
      searchQuery: query,
    })
  }

  handlePageChange = (page) => {
    this.setState({
      currentPage: page
    })
  }

  handleDeleteMovie = (movieId) => {
    this.setState((prevState) => {
      const { ratedMoviesLocal } = prevState
      const updatedRatedMovies = {}
  
      for (const key in ratedMoviesLocal) {
        if (key !== movieId) {
          updatedRatedMovies[key] = ratedMoviesLocal[key]
        }
      }
  
      return {
        ratedMoviesLocal: updatedRatedMovies,
      }
    })
  }

  render() {
    const { activeTab, guestSessionId, ratedMovies, error, loadingRatedMovies, ratedMoviesLocal, genres, searchRes, searchQuery, currentPage } = this.state
    const spinnerRate = (
      <Flex className = "ant-spinner-rate" justify="center" align="center" style={{ height: '100%', width: '100%' }}>
        <Spin size="large" />
      </Flex>
    )
    return (
      <div className="tabs">
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <div className="tab-buttons-container">
          <div className="tab-buttons">
            <button
              className={activeTab === 'search' ? 'active' : ''}
              onClick={() => this.handleTabClick('search')}
            >
              Search
            </button>
            <button
              className={activeTab === 'rated' ? 'active' : ''}
              onClick={() => this.handleTabClick('rated')}
            >
              Rated
            </button>
          </div>
        </div>
        <div className="tab-content">
          {activeTab === 'search' ? (
            <MovieList
              key="search"
              guestSessionId={guestSessionId}
              ratedMovies={ratedMovies}
              ratedMoviesLocal={ratedMoviesLocal}
              onRateMovie={this.handleRateMovie}
              genres={genres}
              onDeleteMovie={this.handleDeleteMovie}
              onSearch={this.handleSearch}
              searchRes={searchRes}
              searchQuery={searchQuery}
              currentPage={currentPage}
              onPageChange={this.handlePageChange}
              
            />
          ) : (
            <RatedMovieList
              key="rated"
              guestSessionId={guestSessionId}
              ratedMovies={ratedMovies}
              ratedMoviesLocal={ratedMoviesLocal}
              onRateMovie={this.handleRateMovie}
              genres={genres}
              onDeleteMovie={this.handleDeleteMovie}
              onPageChange={this.handlePageChange}
            />
          )}
        </div>
        {loadingRatedMovies && spinnerRate}
        {activeTab === 'rated' && ratedMovies && ratedMovies.length === 0 && !loadingRatedMovies && (
          <p className='havntRated'>У вас пока нет оцененных фильмов или мы не получили данные.</p>
        )}
      </div>
    )
  }
}