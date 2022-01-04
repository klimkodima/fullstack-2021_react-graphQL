import React from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS, GET_USER } from '../queries'


const Recommend = (props) => {
  const result = useQuery(ALL_BOOKS)
  const user = useQuery(GET_USER)
  if (!props.show || !user.data.me) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>recommendations</h2>
      <p>books in your favorite genre {user.data.me.favoriteGenre}</p>
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
          {result.data.allBooks
          .filter(book => book.genres.includes(user.data.me.favoriteGenre))
          .map(book =>
            <tr key={book.title}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Recommend