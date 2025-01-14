/* eslint-disable prettier/prettier */
import React from 'react'
import { Pagination } from 'antd'
import './pagination.css'

export default class PaginationMovie extends React.Component {
  render() {
    const { current, pageSize, total, onChange } = this.props
    return (
      <div className="pagination">
        <Pagination
          current={current}
          pageSize={pageSize}
          total={total}
          onChange={onChange} />
      </div>
    )
  }
}
