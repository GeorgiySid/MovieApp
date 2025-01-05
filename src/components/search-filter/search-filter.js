/* eslint-disable prettier/prettier */
import React from 'react'
import './search-filter.css'
import { debounce} from 'lodash'

import MovieService from '../service/movie-service'
export default class SearchFilter extends React.Component {
  movieService = new MovieService()

  handleChange = debounce(async (value) => {

    if(!value) {
      this.props.onSearch({ results: [], error: false})
      return
    }
    try {
      const data = await this.movieService.getFetch(value)
      if (data.results.length === 0) {
        this.props.onSearch({results: [], error: true})
        return
      }
      this.props.onSearch({results: data.results, error: false})
    }
    catch(err){
      this.props.onSearch({results: [], error: false})
      console.error('Error during search:', err)
    }

  }, 500)

  render() {
    return (
      <div className="search">
        <input 
          type='text'
          placeholder="search movie"
          onChange={(evt) => this.handleChange(evt.target.value)}  />
      </div>
    )
  }
}
