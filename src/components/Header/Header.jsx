import React from 'react'
import { Layout } from 'antd'
import PropTypes from 'prop-types'
import Filter from './Filter/Filter'

const { Header } = Layout

function Headers({ onSearch }) {
    return (
        <Header>
            <div className="logo" />
            <Filter onSearch={onSearch} />
        </Header>
    )
}

Headers.propTypes = {
    onSearch: PropTypes.func.isRequired,
}
export default Headers
