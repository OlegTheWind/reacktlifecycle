import React from 'react'
import { Layout } from 'antd'
import PropTypes from 'prop-types'
import ListItem from './ItemList/ItemList'

const { Content } = Layout

function Contents({ data, GenresContext, isLoading, onPageChange, onRate }) {
    return (
        <Content>
            <ListItem
                item={data}
                genres={GenresContext}
                isLoading={isLoading}
                onPageChange={onPageChange}
                onRate={onRate}
            />
        </Content>
    )
}
Contents.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            poster_path: PropTypes.string,
            title: PropTypes.string,
            release_date: PropTypes.string,
            genre_ids: PropTypes.arrayOf(PropTypes.number),
            overview: PropTypes.string,
            vote_average: PropTypes.number,
            rating: PropTypes.number,
            genres: PropTypes.bool,
        }),
    ).isRequired,
    GenresContext: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
        }),
    ),
    isLoading: PropTypes.bool.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onRate: PropTypes.func.isRequired,
}
Contents.defaultProps = {
    GenresContext: [],
}
export default Contents
