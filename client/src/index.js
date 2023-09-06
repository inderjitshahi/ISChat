import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom'
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink
} from "@apollo/client";

import { setContext } from '@apollo/client/link/context';
import { split, HttpLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

// Adding authorization header to request before sending to the server
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      authorization: localStorage.getItem('jwt') || "",
    }
  }
});

// Define URIs for different environments
let httpUri, wsUri;

if (process.env.REACT_APP_ENV === "dev") {
  console.log("Development Environment");
  httpUri = 'http://localhost:5000/graphql';
  wsUri = 'ws://localhost:5000/graphql';
} else if (process.env.REACT_APP_ENV === "prod") {
  console.log("Production Environment");
  httpUri = 'https://ischat.onrender.com/graphql';
  wsUri = 'wss://ischat.onrender.com/graphql';
}

// Create HTTP and WebSocket links
const httpLink = new HttpLink({
  uri: httpUri,
});

const wsLink = new GraphQLWsLink(createClient({
  url: wsUri,
}));

// Split link for handling subscriptions
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink),
);

// Create Apollo Client
const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache()
});

// Render the app with Apollo Client Provider
ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
