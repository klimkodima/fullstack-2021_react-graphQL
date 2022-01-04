import React, {useState, useEffect} from 'react'
import { useQuery, useLazyQuery } from '@apollo/client'
import { ALL_BOOKS, BOOKS_BY_GENRE } from '../queries'


const Books = (props) => {
  const [filter, setFilter] = useState("all genres")
  const allBooksResult = useQuery(ALL_BOOKS)
  const [getBooks, result] = useLazyQuery(BOOKS_BY_GENRE)
  let genres = ["all genres"]
  const [books, setBooks] = useState()
  
  if(allBooksResult.data) {
    const adedGenres = [...new Set(allBooksResult.data.allBooks.reduce((g, b) => g.concat(b.genres), []))]
    genres = genres.concat(adedGenres)
  }

  const filterByGenre = ( genre) => {
    setFilter(genre)
  }

  useEffect(()=>{
    getBooks( { variables: { genreToSearch: filter } } )
  },
  // eslint-disable-next-line
   [filter]
  )

  useEffect(()=>{
    if(result.data){
    setBooks(result.data.allBooks)
    }
  },
   [result]
  )

  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }

  if (!books) {
    return (
      <div>
      {genres.map(genre => 
       <button key={genre} onClick = {() => filterByGenre(genre)}>{genre}</button>
      )}
      </div>
    )
  }

  return (
    <div>
      <h2>books</h2>
      <p> in genre {filter}</p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {books
          .map(book =>
            <tr key={book.title}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          )}
        </tbody>
      </table>
      <div>
      {genres.map(genre => 
       <button key={genre} onClick = {() => filterByGenre(genre)}>{genre}</button>
      )}
      </div>
    </div>
  )
}

export default Books