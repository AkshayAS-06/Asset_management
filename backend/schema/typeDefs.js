const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    userId: ID!
    name: String!
    email: String!
    role: UserRole!
    department: String!
    createdAt: String
    requests: [Request]
  }
  type AuthPayload {
    token: String!
    user: User!
  }

  enum UserRole {
    STUDENT
    HOD
    STAFF
  }

  type Department {
    name: ID!
    location: String
    hod: User
    equipment: [Equipment]
  }

  type Equipment {
    equipmentId: ID!
    name: String!
    description: String
    category: String!
    department: String!
    status: EquipmentStatus!
    purchaseDate: String
    value: Float
    location: String
    createdAt: String
    requests: [Request]
  }

  enum EquipmentStatus {
    AVAILABLE
    IN_USE
    MAINTENANCE
    DISPOSED
  }

  type Request {
    requestId: ID!
    student: User!
    equipment: Equipment!
    status: RequestStatus!
    requestDate: String!
    requiredFrom: String!
    requiredUntil: String!
    purpose: String!
    approvedBy: User
    approvalDate: String
    returnDate: String
    comments: String
  }

  enum RequestStatus {
    PENDING
    APPROVED
    REJECTED
    COMPLETED
    CANCELLED
  }

  type Query {
    getUser(userId: ID!): User
    getUsers(department: String): [User]
    getEquipment(equipmentId: ID!): Equipment
    getAllEquipment(department: String, status: EquipmentStatus): [Equipment]
    getDepartment(name: ID!): Department
    getAllDepartments: [Department]
    getRequest(requestId: ID!): Request
    getUserRequests(userId: ID!, status: RequestStatus): [Request]
    getDepartmentRequests(department: String!, status: RequestStatus): [Request]
    getEquipmentRequests(equipmentId: ID!, status: RequestStatus): [Request]
  }

  type Mutation {
    # User mutations
    deleteUser(
    userId: ID!
    ): Boolean!

    createUser(
      name: String!
      email: String!
      password: String!
      role: UserRole!
      department: String!
    ): AuthPayload

    loginUser(
    email: String!, 
    password: String!
    ): AuthPayload!

    login(
    email: String!,
    password: String!,
    ): AuthPayload
    updateUser(
      userId: ID!
      name: String
      email: String
      role: UserRole
      department: String
    ): User
    
    # Equipment mutations
    createEquipment(
      name: String!
      description: String
      category: String!
      department: String!
      status: EquipmentStatus
      purchaseDate: String
      value: Float
      location: String
    ): Equipment

    deleteEquipment(
    equipmentId: ID!
    ): Boolean

    updateEquipment(
      equipmentId: ID!
      name: String
      description: String
      category: String
      status: EquipmentStatus
      location: String
    ): Equipment
    
    # Department mutations
    createDepartment(
      name: String!
      location: String
      hodId: ID!
    ): Department
    updateDepartment(
      name: ID!
      location: String
      hodId: ID
    ): Department
    
    # Request mutations
    createRequest(
      studentId: ID!
      equipmentId: ID!
      requiredFrom: String!
      requiredUntil: String!
      purpose: String!
    ): Request
    approveRequest(
      requestId: ID!
      hodId: ID!
      comments: String
    ): Request
    rejectRequest(
      requestId: ID!
      hodId: ID!
      comments: String!
    ): Request
    completeRequest(
      requestId: ID!
      comments: String
    ): Request
    cancelRequest(
      requestId: ID!
    ): Request
  }
`;

module.exports = typeDefs;