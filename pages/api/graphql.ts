import { gql } from 'apollo-server-micro';
import { ApolloServer } from 'apollo-server-micro';
import { MicroRequest } from 'apollo-server-micro/dist/types';
import { ServerResponse } from 'http';

export const resolvers = {
  Query: {
    getUsers: async () => {
      // eslint-disable-next-line no-useless-catch
      try {
        const response: Response = await fetch('https://api.github.com/users');
        const users = await response.json();
        return users.map(
          ({
            id,
            login,
            avatar_url
          }: {
            id: string;
            login: string;
            avatar_url: string;
          }) => ({
            id,
            login,
            avatar_url
          })
        );
      } catch (error) {
        throw error;
      }
    }
  }
};

export const typeDefs = gql`
  type User {
    id: ID
    login: String
    avatar_url: String
  }

  type Query {
    getUsers: [User]
    getUser(name: String!): User!
  }
`;

const apolloServer = new ApolloServer({ typeDefs, resolvers });
const startServer = apolloServer.start();

export const config = {
  api: {
    bodyParser: false
  }
};

export default async (req: MicroRequest, res: ServerResponse) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://studio.apollographql.com'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  if (req.method === 'OPTIONS') {
    res.end();
    return false;
  }
  await startServer;

  await apolloServer.createHandler({
    path: '/api/graphql'
  })(req, res);
};
