import PropTypes from 'prop-types'
import React, { useState, useEffect, useContext } from 'react'
import { Card, List, Spin, Rate } from 'antd'
import { format, parseISO } from 'date-fns'
import './ItemList.css'
import maxTextLength from './maxTextLength/maxTextLength'

function getColor(vote) {
    if (vote >= 7) return '#66E900'
    if (vote >= 5) return '#E9D100'
    if (vote >= 3) return '#E97E00'
    return '#E90000'
}

function ListComponent({ item, GenresContext, onRate, isRated }) {
    const [hasError, setHasError] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [rating, setRating] = useState(item.rating)
    const genres = useContext(GenresContext)

    const imageUrl = `https://image.tmdb.org/t/p/w500${item.poster_path}`

    function handleImageLoad() {
        return setIsLoading(false)
    }

    const handleRateChange = (valueRait) => {
        onRate(item.id, valueRait)
        setRating(valueRait)
    }

    function handleImageError() {
        setHasError(true)
        setIsLoading(false)
    }

    useEffect(() => {
        const img = new Image()
        img.src = imageUrl
        img.onload = handleImageLoad
        img.onerror = handleImageError
    }, [imageUrl])

    const formattedDate = item.release_date ? format(parseISO(item.release_date), 'MMM dd yyyy') : 'Дата неизвестна'
    const movieGenres = item.genre_ids
        ? item.genre_ids.map((id) => genres.find((genre) => genre.id === id)?.name).join(', ')
        : 'Жанры не известны'

    return (
        <Card key={item.id} className="card_content">
            <div className="content_item_block">
                <div className="item_image_block">
                    {(() => {
                        if (hasError) {
                            return (
                                <img
                                    className="item_image_block_error"
                                    src="https://i.ytimg.com/vi/SLDYvwfNTMc/0.jpg"
                                    alt="Ошибка загрузки изображения"
                                />
                            )
                        }
                        if (isLoading) {
                            return (
                                <div className="item_image_block">
                                    <Spin />
                                </div>
                            )
                        }
                        if (!hasError && !isLoading) {
                            return (
                                <img
                                    className="item_image"
                                    src={imageUrl}
                                    onLoad={handleImageLoad}
                                    onError={handleImageError}
                                    alt={item.title}
                                />
                            )
                        }
                        return null
                    })()}
                    <div className="item_header">
                        <div className="block_title_header">
                            <h1 className="item_title">{item.title}</h1>
                            <div className="item_date">{formattedDate}</div>
                            <div className="item_genres">
                                {movieGenres.split(', ').map((genre) => (
                                    <span key={genre.trim()} className="item_genres_silver">
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="item_vote" style={{ boxShadow: `0 0 0px 2px ${getColor(item.vote_average)}` }}>
                            <div className="item_vote_int">
                                {item.vote_average !== undefined ? item.vote_average.toFixed(1) : ''}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="item_list">
                    <div className="item_overview">
                        <p>{maxTextLength(item.overview)}</p>
                    </div>
                    {isRated ? (
                        <Rate
                            rootClassName="rate_position"
                            count={10}
                            allowHalf
                            defaultValue={item.rating}
                            onChange={(value) => onRate(item.id, value)}
                            showSizeChanger="false"
                            fontSize={14}
                        />
                    ) : (
                        <Rate
                            rootClassName="rate_position"
                            count={10}
                            allowHalf
                            defaultValue={rating}
                            onChange={(valueRait) => handleRateChange(valueRait)}
                            showSizeChanger="false"
                        />
                    )}
                </div>
            </div>
        </Card>
    )
}

function ListItem({ item, genres, onRate, isRated }) {
    return (
        <List
            grid={{ xs: 1, lg: 2, xl: 2 }}
            dataSource={item}
            renderItem={(listItem) => (
                <List.Item>
                    <ListComponent item={listItem} GenresContext={genres} onRate={onRate} isRated={isRated} />
                </List.Item>
            )}
        />
    )
}
ListComponent.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.number.isRequired,
        poster_path: PropTypes.string,
        title: PropTypes.string,
        release_date: PropTypes.string,
        genre_ids: PropTypes.arrayOf(PropTypes.number),
        overview: PropTypes.string,
        vote_average: PropTypes.number,
        rating: PropTypes.number,
        genres: PropTypes.bool,
    }).isRequired,
    onRate: PropTypes.func.isRequired,
    GenresContext: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
        }),
    ),
    isRated: PropTypes.bool.isRequired,
}

ListItem.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.number.isRequired,
        poster_path: PropTypes.string,
        title: PropTypes.string,
        release_date: PropTypes.string,
        genre_ids: PropTypes.arrayOf(PropTypes.number),
        overview: PropTypes.string,
        vote_average: PropTypes.number,
        rating: PropTypes.number,
    }).isRequired,
    genres: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
        }),
    ),
    onRate: PropTypes.func.isRequired,
    isRated: PropTypes.bool.isRequired,
}
ListComponent.defaultProps = {
    GenresContext: [],
}
ListItem.defaultProps = {
    genres: [],
}
export default ListItem
