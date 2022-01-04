import { gql  } from '@apollo/client'

const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    title
    published
    author {
      name
    }
    genres
  }
`

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  
${BOOK_DETAILS}
`

export const ALL_AUTHORS = gql`
query {
  allAuthors {
    name
    born
    id
    bookCount
  }
}
`
export const ALL_BOOKS = gql`
{
  allBooks{
    ...BookDetails
  }
}
  ${BOOK_DETAILS}
`
export const BOOKS_BY_GENRE = gql`
query findBooks($genreToSearch: String) {
    allBooks(genre: $genreToSearch) {
    ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`

export const CREATE_BOOK = gql`
mutation createBook($title: String!, $published: Int!, $author: String!, $genres: [String]!) {
  addBook(
  title: $title
  published: $published
  author: $author
  genres: $genres 
) {
  title
  published
  author {
    name
  }
}
}
`
export const UPDATE_AUTHOR = gql`
mutation updateAuthor($name: String!, $born: Int!) {
  editAuthor(
    name: $name
    setBornTo: $born 
    )
    {
  name
  born
}
}
`
export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`
export const GET_USER = gql`
query {
  me {
    favoriteGenre
  }
}
`