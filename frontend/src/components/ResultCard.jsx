import React from 'react';
import axios from 'axios';

const ResultCard = ({ record, onDeleteSuccess }) => {

const storedUser = localStorage.getItem('user');
const user = storedUser ? JSON.parse(storedUser) : null;
 const isAdmin = user && user.role === 'admin';

 const displayName = Array.isArray(record.names) 
? record.names.join(', ') : record.fullName || 'Unknown';

 const handleDelete = async () => {
if (window.confirm(`Are you sure you want to delete "${displayName}"?`)) {
try {
 const token = localStorage.getItem('token');
 await axios.delete(`https://honduras-archive.onrender.com/api/archive/${record._id}`, {
 headers: { 'x-auth-token': token }
 });
 alert("Record deleted successfully");
  if (onDeleteSuccess) onDeleteSuccess(); 
 } catch (err) {
 alert("Error deleting record"); } }};

 // 🟢 UPDATED: Citation now uses newspaperName and pageNumber
 const copyCitation = () => {
 const { eventDate, category, location, newspaperName, pageNumber } = record; 
const source = newspaperName || 'Documento de Archivo';
 const page = pageNumber || 's/n';

 const citation = `${displayName} (${eventDate || 'n.d.'}). ${category}. ${location || 'Honduras'}: ${source}, p. ${page}.`;
 
 navigator.clipboard.writeText(citation);
alert("APA Citation copied to clipboard!");
 };

 return (
 <div style={{ 
 backgroundColor: 'white', 
 padding: '20px', 
 marginBottom: '20px', 
 borderRadius: '8px', 
 boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
 border: '2px solid #737958'
   }}>
     {record.imageUrl && (
     <img 
      src={record.imageUrl} 
      alt={displayName} 
      style={{ 
           width: '100%', 
            borderRadius: '4px', 
             marginBottom: '15px', 
             display: 'block', 
             height: 'auto',// Let the image height be natural
             objectFit: 'contain', // Ensure the full image is visible
             maxHeight: '500px', 
              
              }} 
             />
 )}
          <h3 style={{ color: '#737958', margin: '0 0 10px 0', fontSize: '1.3rem' }}>
  {displayName}
  {/* If the person has a country of origin, show it in parentheses */}
  {record.countryOfOrigin && (
    <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'normal' }}>
       (from {record.countryOfOrigin})
    </span>
  )}
</h3>

 <div style={{ fontSize: '0.9rem', color: '#333' }}>
 <p style={{ marginBottom: '8px' }}><strong>Category:</strong> {record.category}</p>
 <p style={{ marginBottom: '8px' }}><strong>Date:</strong> {record.dateOfPublication || record.eventDate || 'n.d.'}</p>

         {/* 🟢 NEW: Displaying the Newspaper and Page Number */}
         <p style={{ marginBottom: '8px' }}>
         <strong>Source:</strong> {record.newspaperName || 'Archivo Nacional'} 
        {record.pageNumber && ` (Pg. ${record.pageNumber})`}
         </p>

         <p style={{ marginBottom: '8px' }}><strong>Location:</strong> {record.location}</p>

         {record.description && (
          <p style={{ marginBottom: '8px', fontStyle: 'italic', borderTop: '1px solid #eee', paddingTop: '5px' }}>
             {record.summary.substring(0, 100)}...
 </p>
 )}
        </div>

         <button 
          onClick={copyCitation}
           style={{
           marginTop: '15px',
           width: '100%',
           padding: '12px',
           backgroundColor: '#737958',
           color: 'white',
           border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.95rem'
 }}
    >
       📄 Copy APA Citation
</button>

         {isAdmin && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
 <button 
            onClick={() => window.location.href = `/edit/${record._id}`}
            style={{
            flex: 1,
             padding: '10px',
             backgroundColor: '#586379',
              color: 'white',
              border: 'none',
             borderRadius: '4px',
             cursor: 'pointer'
 }}
 >
 ✏️ Edit
</button>
 <button 
             onClick={handleDelete}
             style={{
              flex: 1,
              padding: '10px',
              backgroundColor: '#a94442',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
               cursor: 'pointer'
 }}
 >
          🗑️ Delete
            </button>
</div>
      )}
 </div>
 );
};

export default ResultCard;