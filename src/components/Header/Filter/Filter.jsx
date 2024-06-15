import React from 'react'
import { Input } from 'antd'
import PropTypes from 'prop-types'

const { Search } = Input

function Filter({ onSearch }) {
    return (
        <div style={{ marginLeft: 'auto', marginTop: 15 }}>
            <Search placeholder="Введите название фильма" onChange={(e) => onSearch(e.target.value)} enterButton />
        </div>
    )
}
Filter.propTypes = {
    onSearch: PropTypes.func.isRequired,
}
export default Filter
