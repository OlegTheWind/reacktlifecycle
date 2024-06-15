import React, { useState, useEffect, useCallback, createContext } from 'react'
import { debounce } from 'lodash'
import 'antd/dist/reset.css'
import './index.css'
import { createRoot } from 'react-dom/client'
import { Layout, Pagination, Spin, Empty, Tabs } from 'antd'
import Headers from './components/Header/Header'
import Content from './components/Content/Content'

const { Footer } = Layout
const { TabPane } = Tabs

const GenresContext = createContext([])

function App() {
    const [movies, setMovies] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalResults, setTotalResults] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')
    const [sessionId, setSessionId] = useState('')
    const [ratedMovies, setRatedMovies] = useState([])
    const [genres, setGenres] = useState([])
    const [ratedTotalResults, setRatedTotalResults] = useState(0)
    const [ratedCurrentPage, setRatedCurrentPage] = useState(1)

    const apiKey2 = '6815b8c9798e37baf41eceff7a08b590'

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${apiKey2}`,
        },
    }

    const fetchMovies = async (page = 1, query = '', isRated = false) => {
        setIsLoading(true)
        const url = isRated
            ? `https://api.themoviedb.org/3/guest_session/${sessionId}/rated/movies?api_key=${apiKey2}&language=en-US&sort_by=created_at.asc&page=${page}`
            : query
              ? `https://api.themoviedb.org/3/search/movie?query=${query}?&include_adult=false&language=en-US&page=${page}&api_key=6815b8c9798e37baf41eceff7a08b590`
              : `https://api.themoviedb.org/3/discover/movie?api_key=6815b8c9798e37baf41eceff7a08b590&page=${page}`

        try {
            const response = await fetch(url, options)
            const data = await response.json()
            setMovies(data.results)
            console.log('Movies data:', data)
            setTotalResults(data.total_results)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchRatedMovies = async (page = 1) => {
        setIsLoading(true)
        const url = `https://api.themoviedb.org/3/guest_session/${sessionId}/rated/movies?api_key=${apiKey2}&language=en-US&sort_by=created_at.asc&page=${page}`

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: { accept: 'application/json' },
            })
            const data = await response.json()
            if (data.results) {
                setRatedMovies(data.results)
                setRatedTotalResults(data.total_results)
            } else {
                setRatedMovies([])
                setRatedTotalResults(0)
            }
        } catch (error) {
            console.error('Ошибка при получении рейтингов:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const rateMovie = async (movieId, rating) => {
        const url = `https://api.themoviedb.org/3/movie/${movieId}/rating?api_key=${apiKey2}&guest_session_id=${sessionId}`
        const optionsPost = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: rating }),
        }

        try {
            const response = await fetch(url, optionsPost)
            const data = await response.json()
            console.log('Рейтинг фильма обновлен:', data)

            // Обновляем movies
            setMovies((prevMovies) => {
                const updatedMovies = prevMovies.map((movie) => {
                    if (movie.id === movieId) {
                        return { ...movie, rating: rating !== undefined && rating !== null ? rating : movie.rating }
                    }
                    return movie
                })
                return updatedMovies
            })

            // Локально обновляем ratedMovies с полными данными о фильме
            setRatedMovies((prevRatedMovies) => {
                const movieToUpdate = movies.find((movie) => movie.id === movieId)
                const updatedRatedMovies = [...prevRatedMovies]
                const movieIndex = updatedRatedMovies.findIndex((movie) => movie.id === movieId)
                if (movieIndex !== -1) {
                    updatedRatedMovies[movieIndex] = {
                        ...movieToUpdate,
                        rating:
                            rating !== undefined && rating !== null ? rating : updatedRatedMovies[movieIndex].rating,
                    }
                } else {
                    updatedRatedMovies.push({
                        ...movieToUpdate,
                        rating: rating !== undefined && rating !== null ? rating : 0,
                    })
                }
                return updatedRatedMovies
            })
        } catch (error) {
            console.error('Ошибка при отправке рейтинга:', error)
        }
    }

    const fetchGenres = async () => {
        const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=6815b8c9798e37baf41eceff7a08b590&language=en-US`

        try {
            const response = await fetch(url, options)
            const data = await response.json()
            setGenres(data.genres)
        } catch (error) {
            console.error(error)
        }
    }

    const createGuestSession = async () => {
        const url = `https://api.themoviedb.org/3/authentication/guest_session/new?api_key=${apiKey2}`

        try {
            const response = await fetch(url, { method: 'GET' })
            const data = await response.json()
            console.log('Guest session created:', data)
            setSessionId(data.guest_session_id)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchMovies(currentPage, searchQuery)
    }, [currentPage, searchQuery])

    useEffect(() => {
        createGuestSession()
        fetchGenres()
    }, [])

    useEffect(() => {
        if (sessionId) {
            fetchRatedMovies(ratedCurrentPage)
        }
    }, [sessionId, ratedCurrentPage])

    const handleRatedPageChange = (page) => {
        setRatedCurrentPage(page)
    }

    const handleSearch = useCallback(
        debounce((query) => {
            setSearchQuery(query)
            setCurrentPage(1)
        }, 500),
        [],
    )
    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    return (
        <GenresContext.Provider value={genres}>
            <Layout>
                <Headers onSearch={handleSearch} />
                <Tabs defaultActiveKey="1" style={{ padding: '20px' }}>
                    <TabPane tab="Search" key="1">
                        {(() => {
                            if (isLoading) {
                                return <Spin size="large" />
                            }

                            if (movies && movies.length) {
                                return (
                                    <>
                                        <Content
                                            data={movies}
                                            GenresContext={GenresContext}
                                            isLoading={isLoading}
                                            onPageChange={handlePageChange}
                                            onRate={rateMovie}
                                            isRated={false}
                                        />
                                        <Pagination
                                            current={currentPage}
                                            total={totalResults}
                                            onChange={handlePageChange}
                                            style={{ marginTop: '20px' }}
                                            showSizeChanger={false}
                                        />
                                    </>
                                )
                            }
                            if (!isLoading) {
                                return <Empty description="Нет результатов" />
                            }
                            return null
                        })()}
                    </TabPane>
                    <TabPane tab="Rated" key="2">
                        {(() => {
                            if (isLoading) {
                                return <Spin size="large" />
                            }
                            if (ratedMovies.length) {
                                return (
                                    <>
                                        <Content
                                            data={ratedMovies}
                                            GenresContext={GenresContext}
                                            isLoading={isLoading}
                                            onRate={rateMovie}
                                            isRated={true}
                                        />
                                        <Pagination
                                            current={ratedCurrentPage}
                                            pageSize={10}
                                            total={ratedTotalResults}
                                            onChange={handleRatedPageChange}
                                            style={{ marginTop: '20px' }}
                                        />
                                    </>
                                )
                            }
                            if (!isLoading) {
                                return <Empty description="Нет оцененных фильмов" />
                            }
                            return null
                        })()}
                    </TabPane>
                </Tabs>
                <Footer />
            </Layout>
        </GenresContext.Provider>
    )
}

const root = createRoot(document.getElementById('root'))
root.render(<App />)
