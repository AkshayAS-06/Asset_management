const User = require('../models/mongodb/User');
const Equipment = require('../models/mongodb/Equipment');
const Request = require('../models/mongodb/Request');
const { v4: uuidv4 } = require('uuid');
const neo4jQueries = require('../models/neo4j/neo4jQueries');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key';
const mongoose = require('mongoose');

const resolvers = {
  Query: {
    // User queries
    getUser: async (_, { userId }) => {
      return await User.findOne({ userId });
    },
    getUsers: async (_, { department }) => {
      const query = department ? { department } : {};
      return await User.find(query);
    },
    
    // Equipment queries
    getEquipment: async (_, { equipmentId }) => {
      return await Equipment.findOne({ equipmentId });
    },
    getAllEquipment: async (_, { department, status }) => {
      const query = {};
      if (department) query.department = department;
      if (status) query.status = status;
      return await Equipment.find(query);
    },
    
    getRequest: async (_, { requestId }) => {
      const request = await Request.findOne({ requestId });
      if (!request) return null;
      const student = await User.findOne({ userId: request.studentId });
      const equipment = await Equipment.findOne({ equipmentId: request.equipmentId });
      return {
        ...request._doc,
        student: student || null,
        equipment: equipment || null,
      }
    },
    
    getUserRequests: async (_, { userId, status }) => {
      const query = { studentId: userId };
      if (status) query.status = status;
    
      const requests = await Request.find(query);
      if (!requests.length) return [];
    
      return await Promise.all(
        requests.map(async (request) => {
          const student = await User.findOne({ userId: request.studentId });
          const equipment = await Equipment.findOne({ equipmentId: request.equipmentId });
    
          return {
            ...request._doc,
            student: student || null,
            equipment: equipment || null,
          };
        })
      );
    },
    
    getDepartmentRequests: async (_, { department, status }, { neo4jDriver }) => {
      const session = neo4jDriver.session();
      try {
        const query = `
          MATCH (e:Equipment {department: $department})<-[r:REQUESTED]-(u:User)
          ${status ? 'WHERE r.status = $status' : ''}
          RETURN r.requestId AS requestId
        `;
    
        const result = await session.run(query, { department, status });
        const requestIds = result.records.map(record => record.get('requestId'));
    
        if (requestIds.length === 0) return [];
    
        const requests = await Request.find({ requestId: { $in: requestIds } });
    
        return await Promise.all(
          requests.map(async (request) => {
            const student = await User.findOne({ userId: request.studentId });
            const equipment = await Equipment.findOne({ equipmentId: request.equipmentId });
    
            return {
              ...request._doc,
              student: student || null,
              equipment: equipment || null,
            };
          })
        );
      } finally {
        session.close();
      }
    },    
    getEquipmentRequests: async (_, { equipmentId, status }) => {
      const query = { equipmentId };
      if (status) query.status = status;
    
      const requests = await Request.find(query);
      if (!requests.length) return [];
    
      return await Promise.all(
        requests.map(async (request) => {
          const student = await User.findOne({ userId: request.studentId });
          const equipment = await Equipment.findOne({ equipmentId: request.equipmentId });
    
          return {
            ...request._doc,
            student: student || null,
            equipment: equipment || null,
          };
        })
      );
    },
    
    // Department queries
    getDepartment: async (_, { name }, { neo4jDriver }) => {
      const session = neo4jDriver.session();
      try {
        const result = await session.run(
          `MATCH (u:User) WHERE u.department = $name
           RETURN DISTINCT u.department AS departmentName`,
          { name }
        );
    
        if (result.records.length === 0) {
          return null;
        }
    
        const departmentName = result.records[0].get('departmentName');
    
        // Find the HOD for this department
        const hod = await User.findOne({ department: departmentName, role: "HOD" });
    
        return {
          name: departmentName,
          hod: hod || null, // Return null if no HOD exists
        };
      } finally {
        session.close();
      }
    },
    getAllDepartments: async (_, __, { neo4jDriver }) => {
      const session = neo4jDriver.session();
      try {
        const result = await session.run(
          `MATCH (u:User) WHERE u.department IS NOT NULL
           RETURN DISTINCT u.department AS departmentName`
        );
    
        return await Promise.all(
          result.records.map(async (record) => {
            const departmentName = record.get('departmentName');
    
            // Find the HOD for this department
            const hod = await User.findOne({ department: departmentName, role: "HOD" });
    
            return {
              name: departmentName,
              hod: hod || null, // Return null if no HOD exists
            };
          })
        );
      } finally {
        session.close();
      }
    },
    
  },
  Mutation: {
    // User mutations
    createUser: async (_, { name, email, password, role, department }, { neo4jDriver }) => {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new Error("User already exists.");
        }
    
        // Generate unique userId
        const userId = uuidv4();
    
        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
    
        // Create new user in MongoDB
        const newUser = new User({
          userId,
          name,
          email,
          password: hashedPassword,
          role,
          department,
          createdAt: new Date(),
        });
    
        await newUser.save();
    
        // Create a new Neo4j session
        const session = neo4jDriver.session();
        try {
          // Store user in Neo4j
          await neo4jQueries.createUser(session, { userId, name, email, role, department });
    
          // Connect user to department in Neo4j
          await neo4jQueries.connectUserToDepartment(session, userId, department);
        } finally {
          await session.close();
        }
    
        // Generate JWT Token
        const token = jwt.sign(
          { userId, email, role },
          SECRET_KEY,
          { expiresIn: "1h" }
        );
    
        return { user: newUser, token };
      } catch (error) {
        throw new Error(error.message);
      }
    },
    
    deleteUser: async (_, { userId }, { neo4jDriver }) => {
      try {
        // Find the user by ID in MongoDB
        const user = await User.findOne({ userId });
        if (!user) {
          throw new Error("User not found.");
        }
    
        // Delete user from MongoDB
        await User.deleteOne({ userId });
    
        // Create a new Neo4j session
        const session = neo4jDriver.session();
        try {
          // Delete user node from Neo4j
          await neo4jQueries.deleteUser(session, userId);
        } finally {
          await session.close();
        }
    
        return true; // Successfully deleted
      } catch (error) {
        throw new Error(error.message);
      }
    },
    updateUser: async (_, args, { neo4jDriver }) => {
      const session = neo4jDriver.session();
      try {
        // Update Neo4j
        await session.run(
          `MATCH (u:User {userId: $userId})
           SET u.name = $name,
               u.email = $email,
               u.role = $role,
               u.department = $department
           RETURN u`,
          args
        );
        
        // Update MongoDB
        return await User.findOneAndUpdate(
          { userId: args.userId },
          { $set: args },
          { new: true }
        );
      } finally {
        session.close();
      }
    },
    
    // Equipment mutations
    createEquipment: async (_, args, { neo4jDriver }) => {
      const equipmentId = uuidv4();
      const equipment = new Equipment({
        equipmentId,
        ...args,
        status: args.status || 'AVAILABLE'
      });
      
      const session = neo4jDriver.session();
      try {
        await neo4jQueries.createEquipment(session, { 
          equipmentId, 
          ...args,
          status: args.status || 'AVAILABLE',
          description: args.description || ''
        });
        await neo4jQueries.connectEquipmentToDepartment(session, equipmentId, args.department);
        
        return await equipment.save();
      } finally {
        session.close();
      }
    },
    deleteEquipment: async (_, { equipmentId }, { neo4jDriver }) => {
      try {
        // Find the equipment in MongoDB
        const equipment = await Equipment.findOne({ equipmentId });
        if (!equipment) {
          throw new Error("Equipment not found.");
        }
    
        // Delete from MongoDB
        await Equipment.deleteOne({ equipmentId });
    
        // Delete from Neo4j
        const session = neo4jDriver.session();
        try {
          await neo4jQueries.deleteEquipment(session, equipmentId);
        } finally {
          await session.close();
        }
    
        return true; // Successfully deleted
      } catch (error) {
        console.error("Error in deleteEquipment:", error.message);
        throw new Error(error.message);
      }
    },
    updateEquipment: async (_, args, { neo4jDriver }) => {
      const session = neo4jDriver.session();
      try {
        // Update Neo4j
        await session.run(
          `MATCH (e:Equipment {equipmentId: $equipmentId})
           SET e.name = $name,
               e.description = $description,
               e.category = $category,
               e.status = $status,
               e.location = $location
           RETURN e`,
          args
        );
        
        // Update MongoDB
        return await Equipment.findOneAndUpdate(
          { equipmentId: args.equipmentId },
          { $set: args },
          { new: true }
        );
      } finally {
        session.close();
      }
    },
    
    // Department mutations
    createDepartment: async (_, args, { neo4jDriver }) => {
      const session = neo4jDriver.session();
      try {
        // Verify HOD exists
        const hod = await User.findOne({ userId: args.hodId });
        if (!hod) {
          throw new Error('HOD user not found');
        }
        
        // Create department in Neo4j
        const result = await neo4jQueries.createDepartment(session, args);
        
        if (result.records.length === 0) {
          throw new Error('Failed to create department');
        }
        
        return {
          ...args,
          hod
        };
      } finally {
        session.close();
      }
    },
    updateDepartment: async (_, args, { neo4jDriver }) => {
      const session = neo4jDriver.session();
      try {
        let hod = null;
        if (args.hodId) {
          hod = await User.findOne({ userId: args.hodId });
          if (!hod) {
            throw new Error('HOD user not found');
          }
        }
        
        // Update department in Neo4j
        await session.run(
          `MATCH (d:Department {name: $name})
           SET d.location = $location
           ${args.hodId ? ', d.hodId = $hodId' : ''}
           RETURN d`,
          args
        );
        
        return {
          ...args,
          hod
        };
      } finally {
        session.close();
      }
    },
    // Request mutations
    createRequest: async (_, args, { neo4jDriver }) => {
        // Verify student exists
        const student = await User.findOne({ userId: args.studentId, role: 'STUDENT' });
        if (!student) {
          throw new Error('Student not found or user is not a student');
        }
        
        // Verify equipment exists and is available
        const equipment = await Equipment.findOne({ 
          equipmentId: args.equipmentId,
          status: 'AVAILABLE'
        });
        if (!equipment) {
          throw new Error('Equipment not found or not available');
        }
        
        const requestId = uuidv4();
        const requestData = {
          requestId,
          ...args,
          status: 'PENDING',
          requestDate: new Date().toISOString()
        };
        
        const request = new Request(requestData);
        
        const session = neo4jDriver.session();
        try {
          // Create request relationship in Neo4j
          await neo4jQueries.createRequest(session, requestData);
          
          return await request.save();
        } finally {
          session.close();
        }
      },
approveRequest: async (_, { requestId, hodId, comments }, { neo4jDriver }) => {
  console.log("Approving request:", requestId, "by HOD:", hodId);

  // Verify HOD exists
  const hod = await User.findOne({ userId: hodId, role: 'HOD' });
  console.log("HOD found:", hod);
  if (!hod) throw new Error('HOD not found or user is not an HOD');

  // Get the request
  const request = await Request.findOne({ requestId });
  console.log("Request found:", request);
  if (!request) throw new Error('Request not found');

  // Check if request status is PENDING
  if (request.status !== 'PENDING') {
      console.log("Request status:", request.status);
      throw new Error('Request is not in PENDING status');
  }

  // Verify department match
  const equipment = await Equipment.findOne({ equipmentId: request.equipmentId });
  console.log("Equipment found:", equipment);
  if (!equipment || hod.department !== equipment.department) {
      throw new Error('HOD does not belong to the equipment department');
  }

  const session = neo4jDriver.session();
  try {
      // Approve request in Neo4j
      const neo4jResult = await neo4jQueries.approveRequest(session, requestId, hodId);

      // Check if request was correctly updated in Neo4j
      if (!neo4jResult.records.length) {
          throw new Error("⚠️ Neo4j update failed: No records returned.");
      }
      // Update equipment status
      const updatedEquipment = await Equipment.findOneAndUpdate(
          { equipmentId: request.equipmentId },
          { $set: { status: 'IN_USE' } },
          { new: true }
      );

      if (!updatedEquipment) {
          throw new Error("⚠️ Equipment update failed: Equipment not found.");
      }
      // Update request in MongoDB
      const updatedRequest = await Request.findOneAndUpdate(
          { requestId },
          { 
              $set: { 
                  status: 'APPROVED',
                  approvedBy: hodId,
                  approvalDate: new Date(),
                  comments: comments || ''
              } 
          },
          { new: true }
      );

      if (!updatedRequest) {
          throw new Error("Request update failed: Request not found.");
      }
      // Fetch the full User details for approvedBy
      const hodDetails = await User.findOne({ userId: hodId });
      if (!hodDetails) throw new Error(" HOD details not found after approval!");
      // Modify the return object to include the full user details
      return {
          ...updatedRequest.toObject(),  // Convert Mongoose object to plain JSON
          approvedBy: hodDetails         // Attach full User object
      };

  } catch (error) {
      console.error("Error in approveRequest:", error);
      throw error; // Rethrow the error to GraphQL
  } finally {
      session.close();
  }
}
,
      rejectRequest: async (_, { requestId, hodId, comments }, { neo4jDriver }) => {
        // Verify HOD exists
        const hod = await User.findOne({ userId: hodId, role: 'HOD' });
        if (!hod) {
          throw new Error('HOD not found or user is not an HOD');
        }
        
        // Get the request
        const request = await Request.findOne({ requestId, status: 'PENDING' });
        if (!request) {
          throw new Error('Request not found or not in PENDING status');
        }
        
        // Get the equipment
        const equipment = await Equipment.findOne({ equipmentId: request.equipmentId });
        if (!equipment) {
          throw new Error('Equipment not found');
        }
        
        // Verify HOD belongs to the same department as the equipment
        if (hod.department !== equipment.department) {
          throw new Error('HOD does not belong to the equipment department');
        }
        
        const session = neo4jDriver.session();
        try {
          // Reject request in Neo4j
          await session.run(
            `MATCH (s:User)-[r:REQUESTED {requestId: $requestId}]->(e:Equipment)
            MATCH (h:User {userId: $hodId})
            CREATE (h)-[:REJECTED {date: datetime(), reason: $comments}]->(e)  // Attach to Equipment instead of r
            SET r.status = "REJECTED",
            r.approvedBy = $hodId,
            r.approvalDate = datetime(),
            r.comments = $comments
            RETURN s, r, e, h`,
            { requestId, hodId, comments }
          );
          
          // Update request in MongoDB
          return await Request.findOneAndUpdate(
            { requestId },
            { 
              $set: { 
                status: 'REJECTED',
                approvedBy: hodId,
                approvalDate: new Date(),
                comments
              } 
            },
            { new: true }
          );
        } finally {
          session.close();
        }
      },
      completeRequest: async (_, { requestId, comments }, { neo4jDriver }) => {
        // Get the request
        const request = await Request.findOne({ requestId, status: 'APPROVED' });
        if (!request) {
          throw new Error('Request not found or not in APPROVED status');
        }
        
        const session = neo4jDriver.session();
        try {
          // Complete request in Neo4j
          await neo4jQueries.completeRequest(session, requestId);
          
          // Update equipment status to AVAILABLE
          await Equipment.findOneAndUpdate(
            { equipmentId: request.equipmentId },
            { $set: { status: 'AVAILABLE' } }
          );
          
          // Update request in MongoDB
          return await Request.findOneAndUpdate(
            { requestId },
            { 
              $set: { 
                status: 'COMPLETED',
                returnDate: new Date(),
                comments: comments || ''
              } 
            },
            { new: true }
          );
        } finally {
          session.close();
        }
      },
      cancelRequest: async (_, { requestId }, { neo4jDriver }) => {
        // Get the request
        const request = await Request.findOne({ 
          requestId, 
          status: { $in: ['PENDING', 'APPROVED'] } 
        });
        if (!request) {
          throw new Error('Request not found or cannot be cancelled');
        }
        
        const session = neo4jDriver.session();
        try {
          // Cancel request in Neo4j
          await session.run(
            `MATCH (s:User)-[r:REQUESTED {requestId: $requestId}]->(e:Equipment)
             SET r.status = "CANCELLED"
             RETURN s, r, e`,
            { requestId }
          );
          
          // If the request was approved, update equipment status back to AVAILABLE
          if (request.status === 'APPROVED') {
            await Equipment.findOneAndUpdate(
              { equipmentId: request.equipmentId },
              { $set: { status: 'AVAILABLE' } }
            );
          }
          
          // Update request in MongoDB
          return await Request.findOneAndUpdate(
            { requestId },
            { $set: { status: 'CANCELLED' } },
            { new: true }
          );
        } finally {
          session.close();
        }
      },
      loginUser: async (_, { email, password }) => {
        try {
          // Find user by email
          const user = await User.findOne({ email });
          if (!user) {
            throw new Error("User not found.");
          }
          
          const isMatch = await bcrypt.compare(password, user.password);
          
          if (!isMatch) {
            throw new Error("Invalid credentials.");
          }
          
          // Generate JWT Token
          const token = jwt.sign(
            { userId: user.userId, email: user.email, role: user.role },
            SECRET_KEY,
            { expiresIn: "1h" }
          );
          
          // Make sure you're returning both user and token here
          return { user, token };
        } catch (error) {
          // Instead of just re-throwing, you need to handle the error
          // and still return something or ensure the error is properly handled by Apollo
          throw new Error(error.message);
        }
      },
    }
  };
  
  module.exports = resolvers;