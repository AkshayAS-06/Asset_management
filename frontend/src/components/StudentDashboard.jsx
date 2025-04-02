import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import {
  CREATE_REQUEST,
  CREATE_EVENT_REQUEST_MUTATION,
  DELETE_EVENT_MUTATION,
  CREATE_EVENT_MUTATION, // Import the createEvent mutation
} from "../graphql/mutation";

function StudentDashboard({ setToken, setUser }) {
  const navigate = useNavigate(); 
  // States for Create Equipment Request
  const [userId, setUserId] = useState(""); // Assuming userId is the same as studentId
  const [studentId, setStudentId] = useState("");
  const [equipmentId, setEquipmentId] = useState("");
  const [requiredFrom, setRequiredFrom] = useState("");
  const [requiredUntil, setRequiredUntil] = useState("");
  const [purpose, setPurpose] = useState("");

  // States for Create Event Request
  const [eventId, setEventId] = useState("");
  const [eventComments, setEventComments] = useState("");

  // States for Delete Event
  const [eventIdToDelete, setEventIdToDelete] = useState("");

  // States for Create Event
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [createdBy, setCreatedBy] = useState(""); // Assuming student is the creator

  // Mutations
  const [createEventRequest, { loading: createEventRequestLoading, error: createEventRequestError, data: createEventRequestData }] = useMutation(CREATE_EVENT_REQUEST_MUTATION);
  const [deleteEvent, { loading: deleteEventLoading, error: deleteEventError, data: deleteEventData }] = useMutation(DELETE_EVENT_MUTATION);
  const [createEvent, { loading: createEventLoading, error: createEventError, data: createEventData }] = useMutation(CREATE_EVENT_MUTATION);
  const [createRequest, { loading, error, data }] = useMutation(CREATE_REQUEST);

  // Handlers
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    await createRequest({
      variables: {
        studentId,  // Ensure this is correct
        equipmentId,
        requiredFrom: new Date(requiredFrom).toISOString(),
        requiredUntil: new Date(requiredUntil).toISOString(),
        purpose,
      },
    });
  } catch (err) {
    console.error("Error creating request:", err);
  }
};

  const handleCreateEventRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      await createEventRequest({
        variables: { eventId, studentId, comments: eventComments },
      });
    } catch (err) {
      console.error("Error creating event request:", err);
    }
  };

  const handleDeleteEventSubmit = async (e) => {
    e.preventDefault();
    try {
      await deleteEvent({ variables: { eventId: eventIdToDelete } });
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  const handleCreateEventSubmit = async (e) => {
    e.preventDefault();
    try {
      await createEvent({
        variables: { eventName, description, date, location, createdBy },
      });
    } catch (err) {
      console.error("Error creating event:", err);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/login"); 
  };

  return (
    <div>
      <h2>Student Dashboard</h2>

      {/* Sign-out Button */}
      <button onClick={handleSignOut} style={{ float: "right" }}>Sign Out</button>

      {/* Create Equipment Request Form */}
      <div>
      <h3>Create Equipment Request</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Equipment ID"
          value={equipmentId}
          onChange={(e) => setEquipmentId(e.target.value)}
          required
        />
        <input
          type="datetime-local"
          placeholder="Required From"
          value={requiredFrom}
          onChange={(e) => setRequiredFrom(e.target.value)}
          required
        />
        <input
          type="datetime-local"
          placeholder="Required Until"
          value={requiredUntil}
          onChange={(e) => setRequiredUntil(e.target.value)}
          required
        />
        <textarea
          placeholder="Purpose"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Request"}
        </button>
      </form>
      {data && <p>Request Created: {data.createRequest.requestId}</p>}
      {error && <p style={{ color: "red" }}>Error: {error.message}</p>}
    </div>

      <div>
    <h3>Create Event Request</h3>
    <form onSubmit={handleCreateEventRequestSubmit}>
      <input
        type="text"
        placeholder="Event ID"
        value={eventId}
        onChange={(e) => setEventId(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Student ID"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        required
      />
      <textarea
        placeholder="Comments"
        value={eventComments}
        onChange={(e) => setEventComments(e.target.value)}
        required
      />
      <button type="submit" disabled={createEventRequestLoading}>
        {createEventRequestLoading ? "Requesting..." : "Create Event Request"}
      </button>
    </form>
    {createEventRequestData && (
      <div>
        <h4>Event Request Created:</h4>
        <p><strong>Request ID:</strong> {createEventRequestData.createEventRequest.requestId}</p>
        <p><strong>Status:</strong> {createEventRequestData.createEventRequest.status}</p>
        <p><strong>Request Date:</strong> {new Date(parseInt(createEventRequestData.createEventRequest.requestDate)).toLocaleString()}</p>
        <h4>Event Details:</h4>
        <p><strong>Event ID:</strong> {createEventRequestData.createEventRequest.event.eventId}</p>
        <p><strong>Event Name:</strong> {createEventRequestData.createEventRequest.event.eventName}</p>
        <p><strong>Description:</strong> {createEventRequestData.createEventRequest.event.description}</p>
        <h4>Student Details:</h4>
        <p><strong>Student ID:</strong> {createEventRequestData.createEventRequest.student.userId}</p>
        <p><strong>Name:</strong> {createEventRequestData.createEventRequest.student.name}</p>
        <h4>Comments:</h4>
        <p>{createEventRequestData.createEventRequest.comments}</p>
      </div>
    )}
    {createEventRequestError && (
      <p style={{ color: "red" }}>Error: {createEventRequestError.message}</p>
    )}
  </div>

      {/* Delete Event Form */}
      <div>
        <h3>Delete Event</h3>
        <form onSubmit={handleDeleteEventSubmit}>
          <input
            type="text"
            placeholder="Event ID"
            value={eventIdToDelete}
            onChange={(e) => setEventIdToDelete(e.target.value)}
            required
          />
          <button type="submit" disabled={deleteEventLoading}>
            {deleteEventLoading ? "Deleting..." : "Delete Event"}
          </button>
        </form>
        {deleteEventData && <p>Event Deleted: {deleteEventData.deleteEvent.eventId}</p>}
        {deleteEventError && <p style={{ color: "red" }}>Error: {deleteEventError.message}</p>}
      </div>

      {/* Create Event Form */}
      <div>
        <h3>Create Event</h3>
        <form onSubmit={handleCreateEventSubmit}>
          <input
            type="text"
            placeholder="Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <input
            type="datetime-local"
            placeholder="Event Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Created By (Student ID)"
            value={createdBy}
            onChange={(e) => setCreatedBy(e.target.value)}
            required
          />
          <button type="submit" disabled={createEventLoading}>
            {createEventLoading ? "Creating..." : "Create Event"}
          </button>
        </form>
        {createEventData && <p>Event Created: {createEventData.createEvent.eventId}</p>}
        {createEventError && <p style={{ color: "red" }}>Error: {createEventError.message}</p>}
      </div>
    </div>
  );
}

export default StudentDashboard;

// import React, { useState } from "react";
// import { useMutation } from "@apollo/client";
// import {
//   CREATE_EQUIPMENT_REQUEST_MUTATION,
//   CANCEL_REQUEST_MUTATION,
//   CREATE_EVENT_REQUEST_MUTATION,
//   DELETE_EVENT_MUTATION,
//   CREATE_EVENT_MUTATION,
// } from "../graphql/mutation";

// function StudentDashboard({ setToken, setUser }) {
//   // States for Create Equipment Request
//   const [userId, setUserId] = useState("");
//   const [studentId, setStudentId] = useState("");
//   const [equipmentId, setEquipmentId] = useState("");
//   const [requiredFrom, setRequiredFrom] = useState("");
//   const [requiredUntil, setRequiredUntil] = useState("");
//   const [purpose, setPurpose] = useState("");

//   // States for Cancel Request
//   const [requestIdToCancel, setRequestIdToCancel] = useState("");

//   // States for Create Event Request
//   const [eventId, setEventId] = useState("");
//   const [eventComments, setEventComments] = useState("");

//   // States for Delete Event
//   const [eventIdToDelete, setEventIdToDelete] = useState("");

//   // States for Create Event
//   const [eventName, setEventName] = useState("");
//   const [description, setDescription] = useState("");
//   const [date, setDate] = useState("");
//   const [location, setLocation] = useState("");
//   const [createdBy, setCreatedBy] = useState(""); // Assuming student is the creator

//   // Mutations
//   const [createRequest, { loading: createRequestLoading, error: createRequestError, data: createRequestData }] = useMutation(CREATE_EQUIPMENT_REQUEST_MUTATION);
//   const [cancelRequest, { loading: cancelRequestLoading, error: cancelRequestError, data: cancelRequestData }] = useMutation(CANCEL_REQUEST_MUTATION);
//   const [createEventRequest, { loading: createEventRequestLoading, error: createEventRequestError, data: createEventRequestData }] = useMutation(CREATE_EVENT_REQUEST_MUTATION);
//   const [deleteEvent, { loading: deleteEventLoading, error: deleteEventError, data: deleteEventData }] = useMutation(DELETE_EVENT_MUTATION);
//   const [createEvent, { loading: createEventLoading, error: createEventError, data: createEventData }] = useMutation(CREATE_EVENT_MUTATION); // Add create event mutation

//   // Handlers
//   const handleCreateRequestSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await createRequest({
//         variables: { userId, equipmentId, requiredFrom, requiredUntil, purpose },
//       });
//     } catch (err) {
//       console.error("Error creating request:", err);
//     }
//   };

//   const handleCancelRequestSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await cancelRequest({ variables: { requestId: requestIdToCancel } });
//     } catch (err) {
//       console.error("Error cancelling request:", err);
//     }
//   };

//   const handleCreateEventRequestSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await createEventRequest({
//         variables: { eventId, studentId, comments: eventComments },
//       });
//     } catch (err) {
//       console.error("Error creating event request:", err);
//     }
//   };

//   const handleDeleteEventSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await deleteEvent({ variables: { eventId: eventIdToDelete } });
//     } catch (err) {
//       console.error("Error deleting event:", err);
//     }
//   };

//   const handleCreateEventSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await createEvent({
//         variables: { eventName, description, date, location, createdBy },
//       });
//     } catch (err) {
//       console.error("Error creating event:", err);
//     }
//   };

//   const handleSignOut = () => {
//     // Clear the token and user data from localStorage
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");

//     // Reset state in parent component if necessary
//     setToken(null);
//     setUser(null);

//     // Redirect to login page or home page
//     window.location.href = "/login";  // Or "/home" if you prefer
//   };

//   return (
//     <div>
//       <h2>Student Dashboard</h2>

//       {/* Sign-out Button */}
//       <button onClick={handleSignOut} style={signOutButtonStyle}>Sign Out</button>

//       {/* Create Equipment Request Form */}
//       <div className="form-container">
//         <h3>Create Equipment Request</h3>
//         <form onSubmit={handleCreateRequestSubmit}>
//           <input
//             type="text"
//             placeholder="Student ID"
//             value={userId}
//             onChange={(e) => setUserId(e.target.value)}
//             required
//           />
//           <input
//             type="text"
//             placeholder="Equipment ID"
//             value={equipmentId}
//             onChange={(e) => setEquipmentId(e.target.value)}
//             required
//           />
//           <input
//             type="datetime-local"
//             placeholder="Required From"
//             value={requiredFrom}
//             onChange={(e) => setRequiredFrom(e.target.value)}
//             required
//           />
//           <input
//             type="datetime-local"
//             placeholder="Required Until"
//             value={requiredUntil}
//             onChange={(e) => setRequiredUntil(e.target.value)}
//             required
//           />
//           <textarea
//             placeholder="Purpose"
//             value={purpose}
//             onChange={(e) => setPurpose(e.target.value)}
//             required
//           />
//           <button type="submit" disabled={createRequestLoading}>
//             {createRequestLoading ? "Creating..." : "Create Request"}
//           </button>
//         </form>
//         {createRequestData && <p>Request Created: {createRequestData.createRequest.requestId}</p>}
//         {createRequestError && <p style={{ color: "red" }}>Error: {createRequestError.message}</p>}
//       </div>

//       {/* Cancel Request Form */}
//       <div className="form-container">
//         <h3>Cancel Request</h3>
//         <form onSubmit={handleCancelRequestSubmit}>
//           <input
//             type="text"
//             placeholder="Request ID"
//             value={requestIdToCancel}
//             onChange={(e) => setRequestIdToCancel(e.target.value)}
//             required
//           />
//           <button type="submit" disabled={cancelRequestLoading}>
//             {cancelRequestLoading ? "Cancelling..." : "Cancel Request"}
//           </button>
//         </form>
//         {cancelRequestData && <p>Request Cancelled: {cancelRequestData.cancelRequest.requestId}</p>}
//         {cancelRequestError && <p style={{ color: "red" }}>Error: {cancelRequestError.message}</p>}
//       </div>

//       {/* Create Event Request Form */}
//       <div className="form-container">
//         <h3>Create Event Request</h3>
//         <form onSubmit={handleCreateEventRequestSubmit}>
//           <input
//             type="text"
//             placeholder="Event ID"
//             value={eventId}
//             onChange={(e) => setEventId(e.target.value)}
//             required
//           />
//           <textarea
//             placeholder="Comments"
//             value={eventComments}
//             onChange={(e) => setEventComments(e.target.value)}
//             required
//           />
//           <button type="submit" disabled={createEventRequestLoading}>
//             {createEventRequestLoading ? "Requesting..." : "Create Event Request"}
//           </button>
//         </form>
//         {createEventRequestData && <p>Event Request Created: {createEventRequestData.createEventRequest.requestId}</p>}
//         {createEventRequestError && <p style={{ color: "red" }}>Error: {createEventRequestError.message}</p>}
//       </div>

//       {/* Delete Event Form */}
//       <div className="form-container">
//         <h3>Delete Event</h3>
//         <form onSubmit={handleDeleteEventSubmit}>
//           <input
//             type="text"
//             placeholder="Event ID"
//             value={eventIdToDelete}
//             onChange={(e) => setEventIdToDelete(e.target.value)}
//             required
//           />
//           <button type="submit" disabled={deleteEventLoading}>
//             {deleteEventLoading ? "Deleting..." : "Delete Event"}
//           </button>
//         </form>
//         {deleteEventData && <p>Event Deleted: {deleteEventData.deleteEvent.eventId}</p>}
//         {deleteEventError && <p style={{ color: "red" }}>Error: {deleteEventError.message}</p>}
//       </div>

//       {/* Create Event Form */}
//       <div className="form-container">
//         <h3>Create Event</h3>
//         <form onSubmit={handleCreateEventSubmit}>
//           <input
//             type="text"
//             placeholder="Event Name"
//             value={eventName}
//             onChange={(e) => setEventName(e.target.value)}
//             required
//           />
//           <textarea
//             placeholder="Description"
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             required
//           />
//           <input
//             type="datetime-local"
//             placeholder="Event Date"
//             value={date}
//             onChange={(e) => setDate(e.target.value)}
//             required
//           />
//           <input
//             type="text"
//             placeholder="Location"
//             value={location}
//             onChange={(e) => setLocation(e.target.value)}
//             required
//           />
//           <input
//             type="text"
//             placeholder="Created By (Student ID)"
//             value={createdBy}
//             onChange={(e) => setCreatedBy(e.target.value)}
//             required
//           />
//           <button type="submit" disabled={createEventLoading}>
//             {createEventLoading ? "Creating..." : "Create Event"}
//           </button>
//         </form>
//         {createEventData && <p>Event Created: {createEventData.createEvent.eventId}</p>}
//         {createEventError && <p style={{ color: "red" }}>Error: {createEventError.message}</p>}
//       </div>

//       <style jsx>{`
//         .form-container {
//           background-color: white;
//           padding: 20px;
//           margin: 10px;
//           border-radius: 8px;
//           box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
//           width: 400px;
//           margin-top: 20px;
//           transition: transform 0.3s ease-in-out;
//         }

//         .form-container:hover {
//           transform: translateY(-5px);
//         }

//         input, textarea {
//           width: 100%;
//           padding: 10px;
//           margin: 10px 0;
//           border: 2px solid #76D7C4;
//           border-radius: 5px;
//           background-color: #F0F8FF;
//         }

//         button {
//           background-color: #76D7C4;
//           color: white;
//           border: none;
//           border-radius: 5px;
//           padding: 10px 20px;
//           cursor: pointer;
//           font-size: 16px;
//           transition: background-color 0.3s;
//         }

//         button:hover {
//           background-color: #48C9B0;
//         }

//         button:disabled {
//           background-color: #A2D9CE;
//           cursor: not-allowed;
//         }

//         h2, h3 {
//           color: #333;
//           text-align: center;
//           font-size: 2rem;
//           margin-bottom: 20px;
//           transition: transform 0.5s ease-in-out;
//         }

//         h2:hover {
//           transform: scale(1.05);
//         }

//         .sign-out-btn {
//           background-color: #ff4747;
//           color: white;
//           border: none;
//           border-radius: 5px;
//           padding: 10px 20px;
//           cursor: pointer;
//           font-size: 16px;
//         }

//         @media (min-width: 1024px) {
//           .form-container {
//             width: 600px;
//             margin: 20px auto;
//           }

//           h2 {
//             font-size: 2.5rem;
//           }

//           button {
//             font-size: 18px;
//             padding: 12px 24px;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

// const signOutButtonStyle = {
//   backgroundColor: '#ff4747',
//   color: 'white',
//   border: 'none',
//   borderRadius: '5px',
//   padding: '10px 20px',
//   cursor: 'pointer',
//   fontSize: '16px',
//   marginBottom: '20px',
// };

// export default StudentDashboard;