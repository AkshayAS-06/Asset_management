const createUser = (session, user) => {
  return session.run(
    `CREATE (u:User {
      userId: $userId,
      name: $name,
      email: $email,
      role: $role,
      department: $department
    }) RETURN u`,
    user
  );
};

const createEquipment = (session, equipment) => {
  return session.run(
    `CREATE (e:Equipment {
      equipmentId: $equipmentId,
      name: $name,
      description: $description,
      category: $category,
      department: $department,
      status: $status
    }) RETURN e`,
    equipment
  );
};

const createDepartment = (session, department) => {
  return session.run(
    `CREATE (d:Department {
      name: $name,
      location: $location,
      hodId: $hodId
    }) RETURN d`,
    department
  );
};

const connectUserToDepartment = (session, userId, departmentName) => {
  return session.run(
    `MATCH (u:User {userId: $userId})
     MATCH (d:Department {name: $departmentName})
     CREATE (u)-[:BELONGS_TO]->(d)
     RETURN u, d`,
    { userId, departmentName }
  );
};

const connectEquipmentToDepartment = (session, equipmentId, departmentName) => {
  return session.run(
    `MATCH (e:Equipment {equipmentId: $equipmentId})
     MATCH (d:Department {name: $departmentName})
     CREATE (e)-[:OWNED_BY]->(d)
     RETURN e, d`,
    { equipmentId, departmentName }
  );
};

const createRequest = (session, request) => {
  return session.run(
    `MATCH (s:User {userId: $studentId})
     MATCH (e:Equipment {equipmentId: $equipmentId})
     CREATE (s)-[r:REQUESTED {
       requestId: $requestId,
       status: $status,
       requestDate: $requestDate,
       requiredFrom: $requiredFrom,
       requiredUntil: $requiredUntil,
       purpose: $purpose
     }]->(e)
     RETURN s, r, e`,
    request
  );
};

const approveRequest = (session, requestId, hodId) => {
  return session.run(
    `MATCH (s:User)-[r:REQUESTED {requestId: $requestId}]->(e:Equipment)
     MATCH (h:User {userId: $hodId})
     SET r.status = "APPROVED",
         r.approvalDate = datetime(),
         r.approvedBy = $hodId
     RETURN s, r, e, h`,
    { requestId, hodId }
  );
};

const completeRequest = (session, requestId) => {
  return session.run(
    `MATCH (s:User)-[r:REQUESTED {requestId: $requestId}]->(e:Equipment)
     SET r.status = "COMPLETED",
         r.returnDate = datetime()
     CREATE (s)-[:USED {from: r.requiredFrom, to: datetime()}]->(e)
     RETURN s, r, e`,
    { requestId }
  );
};

const createEvent = (session, eventData) => {
  return session.run(
    `CREATE (e:Event {
      eventId: $eventId,
      eventName: $eventName,
      description: $description,
      date: $date,
      location: $location,
      status: $status,
      createdBy: $createdBy,
      createdDate: datetime(),
      comments: $comments
    }) RETURN e`,
    eventData
  );
};

const createEventRequest = (session, eventRequestData) => {
  return session.run(
    `MATCH (s:User {userId: $studentId}), (e:Event {eventId: $eventId})
     CREATE (s)-[:REQUESTED {requestId: $requestId, status: 'Pending', requestDate: datetime(), comments: $comments}]->(e)
     RETURN s, e`,
    eventRequestData
  );
};

// Function to approve an event request
const approveEventRequest = async (session, eventId, hodId, comments) => {
  return session.run(
    `MATCH (e:Event {eventId: $eventId})
     SET e.status = "Approved",
         e.approvedBy = $hodId,
         e.comments = $comments
     RETURN e`,
    { eventId, hodId, comments }
  );
};

// Function to reject an event request
const rejectEventRequest = async (session, requestId, hodId, comments) => {
  return session.run(
    `MATCH (r:EventRequest {requestId: $requestId})
     SET r.status = "Rejected",
         r.comments = $comments,
         r.approvedBy = $hodId
     RETURN r`,
    { requestId, hodId, comments }
  );
};

const deleteEvent = async (session, eventId) => {
  return session.run(
    `MATCH (e:Event {eventId: $eventId})
     DETACH DELETE e`,
    { eventId }
  );
};

module.exports = {
  createUser,
  createEquipment,
  createDepartment,
  connectUserToDepartment,
  connectEquipmentToDepartment,
  createRequest,
  approveRequest,
  completeRequest,
  createEvent,
  createEventRequest,
  approveEventRequest,
  rejectEventRequest,
  deleteEvent,
};
