/* eslint-disable prettier/prettier */
import React from 'react'
import './search-filter.css'
import { debounce} from 'lodash'

import MovieService from '../service/movie-service'
export default class SearchFilter extends React.Component {
  movieService = new MovieService()

  constructor(props) {
    super(props)
    this.state = {
      value: props.searchQuery || '', 
    }
  }


  componentDidUpdate(prevProps) {
    if (prevProps.searchQuery !== this.props.searchQuery) {
      this.setState({ value: this.props.searchQuery })
    }
  }

  handleChange = (evt) => {
    const value = evt.target.value
    this.setState({value})
    this.handleSearch(value)
  }

  handleSearch = debounce(async (value) => {
    if (!value) {
      this.props.onSearch({ results: [], error: false }, value)
      return
    }
    try {
      const data = await this.movieService.getFetch( `&query=${value}`)
      if (data.results.length === 0) {
        this.props.onSearch({ results: [], error: true }, value)
        return
      }
      this.props.onSearch({ results: data.results, error: false }, value)
    } catch (err) {
      this.props.onSearch({ results: [], error: false }, value)
      console.error('Error during search:', err)
    }
  }, 500)


  render() {
    return (
      <div className="search">
        <input
          type="text"
          placeholder="search movie"
          value={this.state.value}
          onChange={this.handleChange}
        />
      </div>
    )
  }
}