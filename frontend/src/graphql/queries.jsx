import { gql } from "@apollo/client";

export const GET_EVENT = gql`
  query GetEvent($eventId: ID!) {
    getEvent(eventId: $eventId) {
      eventId
      eventName
      date
      location
    }
  }
`;

export const GET_ALL_EVENTS = gql`
  query GetAllEvents {
    getAllEvents {
      eventId
      eventName
      date
      location
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers($department: String) {
    getUsers(department: $department) {
      userId
      name
      email
      role
      department
    }
  }
`;

export const GET_ALL_EQUIPMENT = gql`
  query GetAllEquipment {
    getAllEquipment {
      equipmentId
      name
      department
      status
    }
  }
`;



export const GET_ALL_DEPARTMENTS = gql`
  query GetAllDepartments {
    getAllDepartments {
      name
      hod {
        name
        email
      }
    }
  }
`;

export const GET_EQUIPMENT_REQUESTS = gql`
  query GetEquipmentRequests($equipmentId: ID!) {
    getEquipmentRequests(equipmentId: $equipmentId) {
      requestId
      student {
        name
        email
      }
      status
    }
  }
`;