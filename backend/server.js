const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const mongoose = require('mongoose');
const neo4j = require('neo4j-driver');
const typeDefs = require('./schema/typeDefs');
const resolvers = require('./schema/resolvers');
const { mongoURI, neo4jURI, neo4jUser, neo4jPassword } = require('./config/db.js');
const { authenticate } = require('./middlewares/authMiddleware');

// Initialize Express
const app = express();

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// Initialize Neo4j Driver
const driver = neo4j.driver(
  neo4jURI,
  neo4j.auth.basic(neo4jUser, neo4jPassword)
);

// Test Neo4j Connection
const testNeo4jConnection = async () => {
  const session = driver.session();
  try {
    await session.run('RETURN 1');
    console.log('Neo4j Connected');
  } catch (error) {
    console.error('Neo4j Connection Error:', error);
  } finally {
    session.close();
  }
};

testNeo4jConnection();

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const user = authenticate(req); // Authenticate and get the user data
    return { req, user, neo4jDriver: driver }; // Return context with user and driver
  }
});

// Apply Apollo GraphQL middleware
async function startServer() {
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}${server.graphqlPath}`));
}

startServer();