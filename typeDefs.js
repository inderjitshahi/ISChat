import { gql } from 'apollo-server-express'

const typeDefs = gql`
type Query{
    users:[User]
    messagesByUser(receiverId:String!):[Message]
}

input UserInput{
  firstName:String!
  lastName:String!
  email:String!
  password:String!
}

input UserSigninInput{
  email:String!
  password:String!
}

type Token{
  token:String!
}

scalar Date

type Message{
  id:String
  text:String!
  receiverId:String!
  senderId:String!
  createdAt:Date!
}


type Mutation{
  signupUser(userNew:UserInput!):User
  signinUser(userSignin:UserSigninInput!):Token
  createMessage(receiverId:String!,text:String!):Message
}

type User{
   id:String
   firstName:String!
   lastName:String!
   email:String!
}


type Subscription{
  messageAdded:Message
}

`

export default typeDefs;