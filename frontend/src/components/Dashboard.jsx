import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  GET_EVENT,
  GET_ALL_EVENTS,
  GET_USERS,
  GET_ALL_EQUIPMENT,
  GET_ALL_DEPARTMENTS,
  GET_EQUIPMENT_REQUESTS,
} from "../graphql/queries";
import { APPROVE_REQUEST } from "../graphql/mutation";

function Dashboard({ setToken, setUser }) {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("events");
  const [approveRequest] = useMutation(APPROVE_REQUEST);
  const [eventId, setEventId] = useState("");
  const [department, setDepartment] = useState("");
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [approving, setApproving] = useState(null);
  
  const { refetch: refetchRequests } = useQuery(GET_EQUIPMENT_REQUESTS);

  const handleApprove = async (requestId, comments = "Approved") => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const decodedToken = jwtDecode(token);
      const hodId = decodedToken.userId;

      console.log("🔍 Sending GraphQL request with:");
      console.log("✅ requestId:", requestId);
      console.log("✅ hodId:", hodId);
      console.log("✅ comments:", comments);

      if (!requestId || !hodId) {
        console.error("❌ Error: requestId or hodId is missing!");
        return;
      }

      setApproving(requestId);

      const { data, errors } = await approveRequest({
        variables: { requestId, hodId, comments },
      });

      if (errors) {
        console.error("❌ GraphQL Error:", errors);
        return;
      }

      await refetchRequests();
    } catch (error) {
      console.error("❌ Error approving request:", error);
    } finally {
      setApproving(null);
    }
};

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserRole(decodedToken.role);

        if (decodedToken.role === "STUDENT") {
          navigate("/student-dashboard");
        } else if (decodedToken.role !== "HOD") {
          alert("You do not have permission to access this page.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
          navigate("/login");
        }
      } catch (error) {
        console.error("Error decoding token", error);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate, setToken, setUser]);

  const { data: eventData, refetch: refetchEvent } = useQuery(GET_EVENT, {
    variables: { eventId },
    skip: !eventId,
  });

  const { data: allEventsData } = useQuery(GET_ALL_EVENTS);
  const { data: usersData } = useQuery(GET_USERS, { variables: { department } });
  const { data: equipmentData } = useQuery(GET_ALL_EQUIPMENT);
  const { data: departmentsData } = useQuery(GET_ALL_DEPARTMENTS);
  const { data: equipmentRequestsData, loading: loadingRequests, error: errorRequests } = useQuery(GET_EQUIPMENT_REQUESTS, {
    variables: { equipmentId: selectedEquipmentId ? String(selectedEquipmentId) : "" },
    skip: !selectedEquipmentId,
  });

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <button onClick={handleSignOut} style={{ float: "right" }}>Sign Out</button>

      <div>
        <button onClick={() => setSelectedTab("events")}>Events</button>
        <button onClick={() => setSelectedTab("users")}>Users</button>
        <button onClick={() => setSelectedTab("equipment")}>Equipment</button>
        <button onClick={() => setSelectedTab("departments")}>Departments</button>
      </div>

      {selectedTab === "events" && (
        <div>
          <h3>Events</h3>
          <input type="text" placeholder="Enter Event ID" value={eventId} onChange={(e) => setEventId(e.target.value)} />
          <button onClick={refetchEvent}>Fetch Event</button>
          {eventData && <pre>{JSON.stringify(eventData.getEvent, null, 2)}</pre>}
          <h4>All Events</h4>
          {allEventsData && <pre>{JSON.stringify(allEventsData.getAllEvents, null, 2)}</pre>}
        </div>
      )}

      {selectedTab === "users" && (
        <div>
          <h3>Users</h3>
          <input type="text" placeholder="Enter Department" value={department} onChange={(e) => setDepartment(e.target.value)} />
          {usersData && <pre>{JSON.stringify(usersData.getUsers, null, 2)}</pre>}
        </div>
      )}

      {selectedTab === "equipment" && (
        <div>
          <h3>Equipment</h3>
          <ul>
            {equipmentData?.getAllEquipment.map((equipment) => (
              <li key={equipment.equipmentId}>
                <strong>{equipment.name}</strong> ({equipment.status}) - {equipment.department}
                <button onClick={() => setSelectedEquipmentId(equipment.equipmentId)}>View Requests</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedEquipmentId && (
        <div>
          <h3>Equipment Requests</h3>
          {loadingRequests ? (
            <p>Loading requests...</p>
          ) : errorRequests ? (
            <p>Error fetching requests: {errorRequests.message}</p>
          ) : (
            <ul>
              {equipmentRequestsData?.getEquipmentRequests.map((request) => (
                <li key={request.requestId}>
                  <strong>Student:</strong> {request.student?.name} ({request.student?.email})  
                  <br />
                  <strong>Status:</strong> {request.status}
                  {request.status === "PENDING" && (
                    <button onClick={() => handleApprove(request.requestId)} disabled={approving === request.requestId}>
                      {approving === request.requestId ? "Approving..." : "Approve"}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          <button onClick={() => setSelectedEquipmentId(null)}>Close</button>
        </div>
      )}

      {selectedTab === "departments" && (
        <div>
          <h3>Departments</h3>
          {departmentsData && <pre>{JSON.stringify(departmentsData.getAllDepartments, null, 2)}</pre>}
        </div>
      )}
    </div>
  );
}

export default Dashboard;


// import { useState, useEffect } from "react";
// import { useQuery } from "@apollo/client";
// import { useNavigate } from "react-router-dom";  // Redirect user on sign out
// import { jwtDecode } from "jwt-decode";

// import {
//   GET_EVENT,
//   GET_ALL_EVENTS,
//   GET_USERS,
//   GET_ALL_EQUIPMENT,
//   GET_ALL_DEPARTMENTS,
//   GET_EQUIPMENT_REQUESTS,
// } from "../graphql/queries";

// function Dashboard({ setToken, setUser }) {
//   const navigate = useNavigate(); // Hook for navigation
//   const [selectedTab, setSelectedTab] = useState("events");
//   const [eventId, setEventId] = useState("");
//   const [department, setDepartment] = useState("");
//   const [selectedEquipmentId, setSelectedEquipmentId] = useState(null);
//   const [userRole, setUserRole] = useState(null);

//   // Decode the JWT token to get the user role
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       try {
//         const decodedToken = jwtDecode(token);  // ✅ Correct JWT decoding
//         setUserRole(decodedToken.role);

//         // Redirect user based on their role
//         if (decodedToken.role === "STUDENT") {
//           navigate("/student-dashboard");  // Redirect to the student dashboard
//         } else if (decodedToken.role !== "HOD") {
//           alert("You do not have permission to access this page.");
//           localStorage.removeItem("token");
//           localStorage.removeItem("user");
//           setToken(null);
//           setUser(null);
//           navigate("/login");  // Redirect to login
//         }
//       } catch (error) {
//         console.error("Error decoding token", error);
//         navigate("/login");  // Redirect to login if token is invalid
//       }
//     } else {
//       navigate("/login");  // Redirect if no token
//     }
//   }, [navigate, setToken, setUser]);

//   // Queries for data
//   const { data: eventData, refetch: refetchEvent } = useQuery(GET_EVENT, {
//     variables: { eventId },
//     skip: !eventId,
//   });

//   const { data: allEventsData } = useQuery(GET_ALL_EVENTS);
//   const { data: usersData } = useQuery(GET_USERS, { variables: { department } });
//   const { data: equipmentData } = useQuery(GET_ALL_EQUIPMENT);
//   const { data: departmentsData } = useQuery(GET_ALL_DEPARTMENTS);
//   const { data: equipmentRequestsData, loading: loadingRequests, error: errorRequests } = useQuery(GET_EQUIPMENT_REQUESTS, {
//     variables: { equipmentId: selectedEquipmentId ? String(selectedEquipmentId) : "" },
//     skip: !selectedEquipmentId,
//   });

//   // Function to sign out
//   const handleSignOut = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     setToken(null);
//     setUser(null);
//     navigate("/login");  // ✅ Navigate AFTER state updates
//   };

//   return (
//     <div style={{ backgroundColor: "#1e1e1e", color: "white", fontFamily: "Arial, sans-serif", padding: "20px" }}>
//       <h2 style={{ color: "#00bcd4" }}>Admin Dashboard</h2>
//       <button onClick={handleSignOut} style={{ float: "right", backgroundColor: "#f44336", color: "white", border: "none", padding: "10px", cursor: "pointer", borderRadius: "5px" }}>Sign Out</button>

//       <div style={{ margin: "20px 0" }}>
//         <button onClick={() => setSelectedTab("events")} style={tabButtonStyle}>Events</button>
//         <button onClick={() => setSelectedTab("users")} style={tabButtonStyle}>Users</button>
//         <button onClick={() => setSelectedTab("equipment")} style={tabButtonStyle}>Equipment</button>
//         <button onClick={() => setSelectedTab("departments")} style={tabButtonStyle}>Departments</button>
//       </div>

//       {selectedTab === "events" && (
//         <div>
//           <h3>Events</h3>
//           <input
//             type="text"
//             placeholder="Enter Event ID"
//             value={eventId}
//             onChange={(e) => setEventId(e.target.value)}
//             style={inputStyle}
//           />
//           <button onClick={() => refetchEvent()} style={buttonStyle}>Fetch Event</button>
//           {eventData && <pre>{JSON.stringify(eventData.getEvent, null, 2)}</pre>}
//           <h4>All Events</h4>
//           {allEventsData && <pre>{JSON.stringify(allEventsData.getAllEvents, null, 2)}</pre>}
//         </div>
//       )}

//       {selectedTab === "users" && (
//         <div>
//           <h3>Users</h3>
//           <input
//             type="text"
//             placeholder="Enter Department"
//             value={department}
//             onChange={(e) => setDepartment(e.target.value)}
//             style={inputStyle}
//           />
//           <button onClick={() => refetchEvent()} style={buttonStyle}>Fetch Users</button>
//           {usersData && <pre>{JSON.stringify(usersData.getUsers, null, 2)}</pre>}
//         </div>
//       )}

//       {selectedTab === "equipment" && (
//         <div>
//           <h3>Equipment</h3>
//           {equipmentData?.getAllEquipment.length > 0 ? (
//             <ul style={{ listStyleType: "none", padding: "0" }}>
//               {equipmentData.getAllEquipment.map((equipment) => (
//                 <li key={equipment.equipmentId} style={{ backgroundColor: "#333", padding: "10px", marginBottom: "10px", borderRadius: "5px" }}>
//                   <strong>{equipment.name}</strong> ({equipment.status}) - {equipment.department}
//                   <button onClick={() => setSelectedEquipmentId(equipment.equipmentId)} style={buttonStyle}>View Requests</button>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p>No equipment available.</p>
//           )}
//         </div>
//       )}

//       {selectedEquipmentId && (
//         <div>
//           <h3>Equipment Requests</h3>
//           {loadingRequests ? (
//             <p>Loading requests...</p>
//           ) : errorRequests ? (
//             <p>Error fetching requests: {errorRequests.message}</p>
//           ) : equipmentRequestsData?.getEquipmentRequests.length > 0 ? (
//             <ul style={{ listStyleType: "none", padding: "0" }}>
//               {equipmentRequestsData.getEquipmentRequests.map((request) => (
//                 <li key={request.requestId} style={{ backgroundColor: "#333", padding: "10px", marginBottom: "10px", borderRadius: "5px" }}>
//                   <strong>Student:</strong> {request.student?.name} ({request.student?.email})  
//                   <br />
//                   <strong>Status:</strong> {request.status}
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p>No requests found for this equipment.</p>
//           )}
//           <button onClick={() => setSelectedEquipmentId(null)} style={buttonStyle}>Close</button>
//         </div>
//       )}

//       {selectedTab === "departments" && (
//         <div>
//           <h3>Departments</h3>
//           {departmentsData && <pre>{JSON.stringify(departmentsData.getAllDepartments, null, 2)}</pre>}
//         </div>
//       )}
//     </div>
//   );
// }

// // Styles
// const tabButtonStyle = {
//   backgroundColor: "#4CAF50",
//   color: "white",
//   border: "none",
//   padding: "10px",
//   cursor: "pointer",
//   marginRight: "10px",
//   borderRadius: "5px"
// };

// const inputStyle = {
//   padding: "8px",
//   margin: "10px 0",
//   width: "100%",
//   backgroundColor: "#333",
//   color: "white",
//   border: "1px solid #444",
//   borderRadius: "5px"
// };

// const buttonStyle = {
//   backgroundColor: "#008CBA",
//   color: "white",
//   border: "none",
//   padding: "10px",
//   cursor: "pointer",
//   borderRadius: "5px"
// };

// export default Dashboard;
