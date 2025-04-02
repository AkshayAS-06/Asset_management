import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
      user {
        userId
        email
        role
        name
      }
    }
  }
`;
export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($name: String!, $email: String!, $password: String!, $role: UserRole!, $department: String!) {
    createUser(name: $name, email: $email, password: $password, role: $role, department: $department) {
      token
      user {
        userId
        name
        email
        role
        department
      }
    }
  }
`;


export const CREATE_REQUEST = gql`
  mutation CreateRequest(
    $studentId: ID!
    $equipmentId: ID!
    $requiredFrom: String!
    $requiredUntil: String!
    $purpose: String!
  ) {
    createRequest(
      studentId: $studentId
      equipmentId: $equipmentId
      requiredFrom: $requiredFrom
      requiredUntil: $requiredUntil
      purpose: $purpose
    ) {
      requestId
      requiredFrom
      requiredUntil
      purpose
      status
      requestDate
    }
  }
`;

// Cancel Equipment Request Mutation
export const CANCEL_REQUEST_MUTATION = gql`
  mutation CancelRequest($requestId: ID!) {
    cancelRequest(requestId: $requestId) {
      requestId
      status
    }
  }
`;

// Create Event Request Mutation
export const CREATE_EVENT_REQUEST_MUTATION = gql`
  mutation CreateEventRequest($eventId: ID!, $studentId: ID!, $comments: String!) {
    createEventRequest(eventId: $eventId, studentId: $studentId, comments: $comments) {
      requestId
      event {
        eventId
        eventName
        description
      }
      student {
        userId
        name
      }
      status
      requestDate
      comments
    }
  }
`;

export const APPROVE_REQUEST = gql`
  mutation ApproveRequest($requestId: ID!, $hodId: ID!, $comments: String) {
    approveRequest(requestId: $requestId, hodId: $hodId, comments: $comments) {
      requestId
      status
    }
  }
`;

// Delete Event Mutation
export const DELETE_EVENT_MUTATION = gql`
  mutation DeleteEvent($eventId: ID!) {
    deleteEvent(eventId: $eventId) {
      eventId
    }
  }
`;

// Create Event Mutation
export const CREATE_EVENT_MUTATION = gql`
  mutation CreateEvent(
    $eventName: String!
    $description: String!
    $date: String!
    $location: String!
    $createdBy: ID!
  ) {
    createEvent(
      eventName: $eventName
      description: $description
      date: $date
      location: $location
      createdBy: $createdBy
    ) {
      eventId
      eventName
      description
      date
      location
      status
      createdBy {
        userId
        name
      }
      createdDate
      comments
    }
  }
`;
