const { ApolloServer, gql } = require('apollo-server')
const config = require('./utils/config')
const logger = require('./utils/logger')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
const jwt = require('jsonwebtoken')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const JWT_SECRET = config.JWT_SECRET

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`
type Subscription {
  bookAdded: Book!
}   
type User {
  username: String!
  favoriteGenre: String!
  id: ID!
}
type Token {
  value: String!
}
type Book {
  title: String!
  published: Int!
  author: Author!
  genres: [String!]!
  id: ID!
}
type Author {
  name: String!
  born: Int 
  id: ID!
  bookCount: Int!
}
type Query {
 bookCount: Int!
 authorCount:Int!
 allBooks(author:String, genre: String): [Book!]!
 allAuthors: [Author!]!
 me: User
}
type Mutation {
  addBook(
    title: String!
    published: Int!
    author: String!
    genres: [String]! 
  ): Book
  editAuthor(
    name: String!
    setBornTo: Int! 
  ): Author
  createUser(
    username: String!
    favoriteGenre: String!
  ): User
  login(
    username: String!
    password: String!
  ): Token
}
`

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) =>{
      let filteredBooks =  await Book.find({}).populate('author')
      if (args.genre === 'all genres') {
        return filteredBooks
      }
      if (args.author !== undefined) {
        filteredBooks = filteredBooks.filter(p => p.author === args.author)
      }
      if (args.genre !== undefined) {
        return Book.find({ genres: { $in: [args.genre] } }).populate('author')
      }
      return filteredBooks
    },
    allAuthors: async (root) => await Author.find({}),
    me: (root, args, context) => context.currentUser
  },
  Author: {
    bookCount: (root) => Book.countDocuments({ author: root })
    },
  Mutation: {
    addBook: async (root, args, context) => {
      if (!context.currentUser) {
        throw new AuthenticationError("not authenticated")
      }
      const authorExists = await Author.findOne({ name: args.author })
      if (authorExists === null) {
        const author = new Author({ "name": args.author })
        try {
          await author.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
      }
      const foundAuthor = await Author.findOne({ name: args.author })
      const book = new Book({ ...args, author: foundAuthor })
      try {
        await book.save()
        pubsub.publish('BOOK_ADDED', { bookAdded: book })
      
        return book
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new AuthenticationError("not authenticated")
      }
      let author = await Author.findOne({ name: args.name })
      if(!author.name) {
        return null
      }
      try {
        author.born =  args.setBornTo
        return await author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
    createUser: (root, args) => {
      const user = new User({ username: args.username })
  
      return user.save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      if ( !user || args.password !== 'secret' ) {
        throw new UserInputError("wrong credentials")
      }
  
      const userForToken = {
        username: user.username,
        id: user._id,
      }
  
      return { value: jwt.sign(userForToken, JWT_SECRET) }
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})