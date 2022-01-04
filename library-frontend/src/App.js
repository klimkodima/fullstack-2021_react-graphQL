
import React, { useState, useEffect } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import Login from './components/Login'
import NewBook from './components/NewBook'
import Recommend from './components/Recommend'
import Notify from './components/Notify'
import { useApolloClient, useSubscription } from '@apollo/client'
import { ALL_BOOKS, BOOK_ADDED } from './queries'

const App = () => {
  const [page, setPage] = useState('authors')
  const [errorMessage, setErrorMessage] = useState(null)
  const [token, setToken] = useState(null)
  const client = useApolloClient()

  const updateCacheWith = (addedBook) => {
    const includedIn = (set, object) => 
      set.map(p => p.id).includes(object.id)  

    const dataInStore = client.readQuery({ query: ALL_BOOKS })
    if (!includedIn(dataInStore.allBooks, addedBook)) {
      client.writeQuery({
        query: ALL_BOOKS,
        allBooks : dataInStore.allBooks.concat(addedBook) 
      })
    }   
  }

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded
      notify(`${addedBook.title} added`)
      updateCacheWith(addedBook)
    }
  })

  useEffect( () => {
    setToken(localStorage.getItem('user-token'))
  }, [])

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        { token && <button onClick={() => setPage('add')}>add book</button> }
        { token && <button onClick={() => setPage('recommend')}>recommend</button> }
        { token ? 
          <button onClick={logout}>logout</button>
         : 
          <button onClick={() => setPage('login')}>login</button>
        }
      </div>
      <br/>
      <Notify errorMessage={errorMessage}/>
      <br/>
      <Authors
        show={page === 'authors'} setError={notify}
      />

      <Books
        show={page === 'books' } 
      />

      <Recommend
        show={page === 'recommend'} 
      />

      <NewBook
        show={page === 'add'} setError={notify} updateCacheWith={updateCacheWith}
      />

      <Login
        show={page === 'login'} notify={notify} setToken={setToken} setPage = {setPage}
      />

    </div>
  )
}

export default App