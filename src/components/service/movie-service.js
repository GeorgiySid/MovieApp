export default class MovieService {
  _apiKey = '247d3a10d2f04ccd4565716bac73f98b'
  _apiToken =
    'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyNDdkM2ExMGQyZjA0Y2NkNDU2NTcxNmJhYzczZjk4YiIsIm5iZiI6MTczNTAzMTY4Ny4xMjUsInN1YiI6IjY3NmE3Yjg3ZmUzNjQwNjY0MzY0YWEwMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.y5SSsrSjCtYu9vk_KaonJAyiRYYy8RHbxHDa4T7DZT0'
  _apiBase = 'https://api.themoviedb.org/3'
  _movieRateBase = 'https://api.themoviedb.org/3/movie/'

  static _handleResponse = async (res) => {
    if (!res.ok) {
      const errorText = await res.text()
      try {
        const errorJson = JSON.parse(errorText)
        if (res.status === 404 && errorJson.status_code === 34) {
          console.warn('Список оцененных фильмов не найден. Возвращаю пустой массив')
          return { results: [], total_pages: 0 }
        }
      } catch (error) {
        // если ошибка парсинга json то перебрасываем ошибку дальше
      }
      const error = new Error(`HTTP error! Status: ${res.status}, Error text: ${errorText}`)
      error.response = res
      throw error
    }
    try {
      return await res.json()
    } catch (e) {
      const error = new Error(`JSON error! ${e}`)
      error.response = res // Добавляем свойство response
      throw error
    }
  }

  async getFetch(query = '') {
    let url = `${this._apiBase}/discover/movie?api_key=${this._apiKey}`
    if (query) {
      if (query.includes('&page=')) {
        url = `${this._apiBase}/discover/movie?api_key=${this._apiKey}${query}`
      } else {
        url = `${this._apiBase}/search/movie?api_key=${this._apiKey}&query=${query}`
      }
    }
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Error: ${res.status}`)
    }
    return await res.json()
  }

  async createGuestSession() {
    const url = `${this._apiBase}/authentication/guest_session/new`
    const headers = {
      Authorization: `Bearer ${this._apiToken}`,
      accept: 'application/json',
    }
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: headers,
      })
      return MovieService._handleResponse(res)
    } catch (err) {
      console.error('Ошибка при создании гостевой сессии:', err)
      throw err
    }
  }

  getRatedMovie = async (guestSessionId) => {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${this._apiToken}`,
      },
    }
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/guest_session/${guestSessionId}/rated/movies?language=en-US&page=1&sort_by=created_at.asc`,
        options
      )
      return MovieService._handleResponse(res)
    } catch (err) {
      console.error('Ошибка при получении оцененных фильмов:', err)
      throw err
    }
  }

  rateMovie = async (id, rating, guestSessionId) => {
    const url = `${this._movieRateBase}${id}/rating`
    const params = new URLSearchParams({
      guest_session_id: guestSessionId,
      api_key: this._apiKey,
    })
    const res = await fetch(`${url}?${params}`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify({ value: rating }),
    })
    return res.json()
  }

  getGenres = async () => {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${this._apiToken}`,
      },
    }
    try {
      const response = await fetch('https://api.themoviedb.org/3/genre/movie/list?language=en', options)
      return await MovieService._handleResponse(response)
    } catch (error) {
      console.error('Ошибка при получении списка жанров', error)
      throw error
    }
  }

  deleteMoviesRate = async (movieId, guestSessionId) => {
    const options = {
      method: 'DELETE',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: `Bearer ${this._apiToken}`,
      },
    }
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/rating?guest_session_id=${guestSessionId}`,
        options
      )
      return await MovieService._handleResponse(response)
    } catch (error) {
      console.error('Ошибка при получении удалении рейтинга', error)
      throw error
    }
  }
}
