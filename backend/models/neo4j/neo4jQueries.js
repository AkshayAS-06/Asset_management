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
  const deleteUser = async (session, userId) => {
    return session.run(
      `MATCH (u:User { userId: $userId }) DETACH DELETE u`,
      { userId }
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

  const deleteEquipment = async (session, equipmentId) => {
    return session.run(
      `MATCH (e:Equipment { equipmentId: $equipmentId }) DETACH DELETE e`,
      { equipmentId }
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
  
  module.exports = {
    createUser,
    deleteUser,
    deleteEquipment,
    createEquipment,
    createDepartment,
    connectUserToDepartment,
    connectEquipmentToDepartment,
    createRequest,
    approveRequest,
    completeRequest
  };