/* eslint-disable indent */
import React, { useMemo } from 'react'
import './move-list-item.css'
import { format } from 'date-fns'
import { enGB } from 'date-fns/locale'
import { Rate } from 'antd'

import MovieService from '../service/movie-service'

const handleDate = (dateString) => {
  try {
    if (!dateString || typeof dateString !== 'string') {
      return 'Неизвестно'
    }
    const date = new Date(dateString)
    if (isNaN(date)) {
      return 'Неизвестно'
    }
    return format(date, 'MMMM dd, yyyy', { locale: enGB })
  } catch (error) {
    return 'Неизвестно'
  }
}

const getMovieRating = (ratedMovies, movieId, ratedMoviesLocal) => {
  if (ratedMoviesLocal) {
    return ratedMoviesLocal[movieId]
  }
  if (!ratedMovies || !movieId || ratedMovies.length === 0) {
    return 0
  }
  const ratedMovie = ratedMovies.find((movie) => movie.id === movieId)
  return ratedMovie ? ratedMovie.rating : 0
}

const voteColor = (vote_average) => {
  if (vote_average !== undefined) {
    if (vote_average >= 0 && vote_average <= 3) {
      return '--low'
    } else if (vote_average >= 3 && vote_average <= 5) {
      return '--medium'
    } else if (vote_average >= 5 && vote_average <= 7) {
      return '--hight'
    } else if (vote_average > 7) {
      return '--max'
    }
  }
}

function getMatchingGenres(genresArray, idsArray) {
  if (!genresArray || !Array.isArray(genresArray) || !idsArray || !Array.isArray(idsArray)) {
    return []
  }
  const matchingGenres = []

  if (!genresArray) {
    return []
  }

  for (const genre of genresArray) {
    if (idsArray.includes(genre.id)) {
      matchingGenres.push(genre.name)
    }
  }

  return matchingGenres
}

const MovieView = ({
  movie,
  onTruncate,
  ratedMovies,
  ratedMoviesLocal,
  genres,
  onRateMovie,
  onDeleteMovie,
  guestSessionId,
}) => {
  if (!movie) {
    return null
  }
  const { poster_path, title, overview, release_date, id, vote_average, genre_ids } = movie

  const memoizedMatchingGenres = useMemo(() => {
    if (!genres?.genres || !genre_ids) {
      return []
    }
    return getMatchingGenres(genres.genres, genre_ids)
  }, [genres, genre_ids])

  const genreList = useMemo(() => {
    return memoizedMatchingGenres.map((genre, index) => (
      <li key={index} className="movie-genre__item">
        {genre}
      </li>
    ))
  }, [memoizedMatchingGenres])

  const handleRateChange = async (value) => {
    try {
      const movieService = new MovieService()
      if (value === 0) {
        await movieService.deleteMoviesRate(id, guestSessionId)
        onDeleteMovie(id)
        onRateMovie(id, 0)
      } else {
        await movieService.rateMovie(id, value, guestSessionId)
        onRateMovie(id, value)
      }
    } catch (error) {
      console.error('Ошибка при работе с рейтингом')
    }
  }
  const currentRating = useMemo(() => {
    return getMovieRating(ratedMovies, id, ratedMoviesLocal)
  }, [ratedMovies, ratedMoviesLocal, id])
  return (
    <React.Fragment>
      <img className="movie-poster" src={`https://image.tmdb.org/t/p/w500${poster_path}`} alt={`Poster for ${title}`} />
      <ul className="list-group">
        <div className={`vote_average vote_average${voteColor(vote_average)}`}>
          <span>{Math.floor(vote_average)}</span>
        </div>
        <li className="list-group-item movie-title">{title}</li>
        <li className="list-group-item movie-date">{handleDate(release_date)}</li>
        <li className="list-group-item movie-genre">
          <ul className="movie-genre__list">{genreList}</ul>
        </li>
        <li className="list-group-item movie-description">{onTruncate(overview, 180)}</li>
      </ul>
      <Rate className="rate" value={currentRating} count={10} onChange={handleRateChange} />
    </React.Fragment>
  )
}

export default class MovieListItem extends React.Component {
  render() {
    const { movie, onTruncate, ratedMovies, ratedMoviesLocal, genres, onRateMovie, onDeleteMovie, guestSessionId } =
      this.props
    return (
      <div className="movie-item">
        <MovieView
          movie={movie}
          onTruncate={onTruncate}
          ratedMovies={ratedMovies}
          ratedMoviesLocal={ratedMoviesLocal}
          genres={genres}
          onRateMovie={onRateMovie}
          onDeleteMovie={onDeleteMovie}
          guestSessionId={guestSessionId}
        />
      </div>
    )
  }
}
