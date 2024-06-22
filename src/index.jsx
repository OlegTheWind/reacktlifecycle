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
    const [isLoadingRated, setIsLoadingRated] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalResults, setTotalResults] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')
    const [sessionId, setSessionId] = useState()
    const [ratedMovies, setRatedMovies] = useState([])
    const [genres, setGenres] = useState([])
    const [ratedTotalResults, setRatedTotalResults] = useState(0)
    const [ratedCurrentPage, setRatedCurrentPage] = useState(1)

    const API_KEY = '383829f6422882f7b7e26e456e3cefb7'

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            authorization:
                'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzODM4MjlmNjQyMjg4MmY3YjdlMjZlNDU2ZTNjZWZiNyIsInN1YiI6IjY2NjQ0YTY4MWE4OTcwY2ViZGQwMzlhNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.KMN1YPqJ8lQtQCv9CTwgyLLYYYU-3XDBpNOm1Dh59M8',
        },
    }

    const fetchMovies = async (page = 1, query = '', isRated = false) => {
        setIsLoading(true)
        let url

        if (isRated) {
            url = `https://api.themoviedb.org/3/guest_session/${sessionId}/rated/movies?api_key=${API_KEY}&language=en-US&sort_by=created_at.asc&page=${page}`
        } else if (query) {
            url = `https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=en-US&page=${page}&api_key=${API_KEY}`
        } else {
            url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&page=${page}`
        }

        try {
            const response = await fetch(url, options)
            const data = await response.json()
            setMovies(data.results)
            setTotalResults(data.total_results)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchRatedMovies = async () => {
        setIsLoadingRated(true)
        const url = `https://api.themoviedb.org/3/guest_session/${sessionId}/rated/movies?api_key=${API_KEY}`

        try {
            const response = await fetch(url, options)
            const data = await response.json()
            console.log('Ответ от сервера для оцененных фильмов:', data.results)
            if (data.results) {
                const moviesWithGenres = data.results.map((movie) => {
                    const movieGenres = movie.genre_ids.map(
                        (genreId) => genres.find((genre) => genre.id === genreId)?.name || 'Жанр не найден',
                    )
                    return { ...movie, genres: movieGenres }
                })

                setRatedMovies(moviesWithGenres)
                setRatedTotalResults(data.total_results || 0)
            } else {
                setRatedMovies([])
                setRatedTotalResults(0)
                console.error('API не возвращает total_results для оцененных фильмов')
            }
        } catch (error) {
            console.error('Ошибка при получении рейтингов:', error)
        } finally {
            setIsLoadingRated(false)
        }
    }

    const rateMovie = async (movieId, rating) => {
        if (!sessionId) {
            console.error('Session ID отсутствует. Невозможно оценить фильм.')
            return
        }

        const rateUrl = `https://api.themoviedb.org/3/movie/${movieId}/rating?api_key=${API_KEY}&guest_session_id=${sessionId}`
        const optionsPost = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                authorization:
                    'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzODM4MjlmNjQyMjg4MmY3YjdlMjZlNDU2ZTNjZWZiNyIsInN1YiI6IjY2NjQ0YTY4MWE4OTcwY2ViZGQwMzlhNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.KMN1YPqJ8lQtQCv9CTwgyLLYYYU-3XDBpNOm1Dh59M8',
            },
            body: JSON.stringify({ value: rating }),
        }

        try {
            const rateResponse = await fetch(rateUrl, optionsPost)
            const rateData = await rateResponse.json()
            console.log('Ответ сервера на запрос оценки:', rateData)
            console.log('Session ID:', sessionId)

            if (rateData.success) {
                // await fetchRatedMovies(ratedCurrentPage);
            } else {
                console.error('Ошибка при оценке фильма:', rateData.status_message)
            }
        } catch (error) {
            console.error('Ошибка при отправке рейтинга:', error)
        }
    }

    const fetchGenres = async () => {
        const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`

        try {
            const response = await fetch(url, options)
            const data = await response.json()
            setGenres(data.genres)
            console.log(genres)
        } catch (error) {
            console.error(error)
        }
    }

    const createGuestSession = async () => {
        const url = `https://api.themoviedb.org/3/authentication/guest_session/new?api_key=${API_KEY}`
        try {
            const response = await fetch(url, { method: 'GET' })
            const data = await response.json()
            if (data.success) {
                setSessionId(data.guest_session_id)
            } else {
                console.error('Ошибка при создании гостевой сессии:', data.status_message)
            }
        } catch (error) {
            console.error('Ошибка сети при создании гостевой сессии:', error)
        }
    }

    useEffect(() => {
        console.log('Текущая страница:', currentPage)
        fetchMovies(currentPage, searchQuery)
    }, [currentPage, searchQuery, API_KEY, sessionId])

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
        console.log('Смена страницы рейтингов на:', page)
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
                <Tabs
                    defaultActiveKey="1"
                    style={{ padding: '20px' }}
                    onChange={(key) => {
                        if (key === '2') fetchRatedMovies(1)
                    }}
                >
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
                            if (isLoadingRated) {
                                return <Spin size="large" />
                            }
                            if (ratedMovies.length) {
                                return (
                                    <>
                                        <Content
                                            data={ratedMovies}
                                            GenresContext={GenresContext}
                                            isLoadingRated={isLoadingRated}
                                            onPageChange={handleRatedPageChange}
                                            onRate={rateMovie}
                                            isRated
                                        />
                                        <Pagination
                                            current={ratedCurrentPage}
                                            total={ratedTotalResults}
                                            onChange={handleRatedPageChange}
                                            showSizeChanger={false}
                                        />
                                    </>
                                )
                            }
                            if (!isLoadingRated) {
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
