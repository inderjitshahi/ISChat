import { ApolloServer } from 'apollo-server-express'
import typeDefs from './typeDefs.js'
import resolvers from './resolvers.js'
import jwt from 'jsonwebtoken'
import { WebSocketServer } from 'ws'
import express from 'express'
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema'
import cors from 'cors';
import env from 'dotenv';


env.config();
const PORT = process.env.PORT || 5000

const URI = process.env.NODE_ENV == "dev" ? "http://localhost:3000": process.env.API_URI ;

// create express
const app = express();
app.use(express.json());

// app.use(cors({ origin: URI }));

const context = ({ req }) => {
  const { authorization } = req.headers
  if (authorization) {
    const { userId } = jwt.verify(authorization, process.env.JWT_SECRET)
    return { userId }
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers })
// create apollo server
const apolloServer = new ApolloServer({ schema, context });

// apply middleware
await apolloServer.start();
apolloServer.applyMiddleware({ app, path: "/graphql" });


const server = app.listen(PORT, () => {
  // create the websocket server
  const wsServer = new WebSocketServer({
    server,
    path: '/graphql',
  });

  //use the websocket server with graphql
  useServer({ schema }, wsServer);

  console.log(`Server is running at port ${PORT}`)
  console.log("Apollo and Subscription server is up")
});
