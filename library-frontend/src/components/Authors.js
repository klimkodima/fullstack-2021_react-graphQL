  
import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { ALL_AUTHORS, UPDATE_AUTHOR } from '../queries'

const Authors = ({show, setError}) => {
  const result = useQuery(ALL_AUTHORS)
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')
  const [ updateAuthor ] = useMutation(UPDATE_AUTHOR, {
    refetchQueries: [  {query: ALL_AUTHORS } ],
    onError: (error) => {
      setError(error.message)
    }
  })

  useEffect(() => {
    if (result.data && result.data.editAuthor === null) {
      setError('person not found')
    }
    // eslint-disable-next-line
  }, [result.data]) 

  const submit = async (event) => {
    event.preventDefault()
    
    updateAuthor({ variables: { name, born: parseInt(born) } })

    setName('')
    setBorn('')
  }

  if (!show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }
 
  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th>name</th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {result.data.allAuthors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
      <h2>set birthyear</h2>
      <form onSubmit={submit}>
        <div>
          name
          <select value={name} onChange={({ target }) => setName(target.value)}>
              {result.data.allAuthors.map(a =>
                <option key={a.name} value={a.name}>{a.name}</option>
              )}
            </select>
        </div>
        <div>
          born
          <input
            value={born} type='number'
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type='submit'>update author</button>
      </form>
    </div>
  )
}

export default Authors
