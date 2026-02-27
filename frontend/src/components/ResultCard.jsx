import React, { useState } from 'react';
import axios from 'axios';

// ─── ResultCard ───────────────────────────────────────────────────────────────

const ResultCard = ({ record, onDeleteSuccess }) => {
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = user && user.role === 'admin';

  const displayName = Array.isArray(record.names) && record.names.length > 0
    ? record.names.join(', ')
    : record.eventName || record.fullName || 'Unknown';

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${displayName}"?`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`https://honduras-archive.onrender.com/api/archive/${record._id}`, {
          headers: { 'x-auth-token': token },
        });
        alert('Record deleted successfully');
        if (onDeleteSuccess) onDeleteSuccess();
      } catch (err) {
        alert('Error deleting record');
      }
    }
  };

  const copyCitation = () => {
    const { category, location, newspaperName, pageNumber, eventDate, publicationDate } = record;
    const source = newspaperName || 'Archivo Nacional';
    const page = pageNumber || 's/n';
    // Use publicationDate for citation if available, fall back to eventDate
    const dateForCitation = publicationDate || eventDate || 'n.d.';
    const citation = `${displayName} (${dateForCitation}). ${category}. ${location || 'Honduras'}: ${source}, p. ${page}.`;
    navigator.clipboard.writeText(citation);
    alert('APA Citation copied to clipboard!');
  };

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      marginBottom: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      border: '2px solid #737958',
    }}>
      {record.imageUrl && (
        <img
          src={record.imageUrl}
          alt={displayName}
          loading="lazy"
          style={{
            width: '100%', borderRadius: '4px', marginBottom: '15px',
            display: 'block', height: 'auto', objectFit: 'contain', maxHeight: '500px',
          }}
        />
      )}

      <h3 style={{ color: '#737958', margin: '0 0 10px 0', fontSize: '1.3rem' }}>
        {displayName}
        {record.countryOfOrigin && (
          <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'normal' }}>
            {' '}(from {record.countryOfOrigin})
          </span>
        )}
      </h3>

      <div style={{ fontSize: '0.9rem', color: '#333' }}>
        <p style={{ marginBottom: '8px' }}><strong>Category:</strong> {record.category}</p>

        {/* 🟢 Show both dates, only if they exist */}
        <div style={{
          backgroundColor: '#f7f5ef',
          border: '1px solid #e0dcc8',
          borderRadius: '6px',
          padding: '8px 12px',
          marginBottom: '10px',
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          {record.eventDate && (
            <span style={{ fontSize: '0.85rem' }}>
              <strong>📅 Event Date:</strong> {record.eventDate}
            </span>
          )}
          {record.publicationDate && (
            <span style={{ fontSize: '0.85rem' }}>
              <strong>📰 Published:</strong> {record.publicationDate}
            </span>
          )}
          {/* Fallback: old records that only have dateOfPublication */}
          {!record.eventDate && !record.publicationDate && record.dateOfPublication && (
            <span style={{ fontSize: '0.85rem' }}>
              <strong>📅 Date:</strong> {record.dateOfPublication}
            </span>
          )}
          {/* If none of the above exist */}
          {!record.eventDate && !record.publicationDate && !record.dateOfPublication && (
            <span style={{ fontSize: '0.85rem', color: '#999' }}>📅 Date: n.d.</span>
          )}
        </div>

        {/* People involved (Historic Events) */}
        {record.peopleInvolved && record.peopleInvolved.length > 0 && (
          <div style={{ marginBottom: '8px' }}>
            <strong>People Involved:</strong>{' '}
            {record.peopleInvolved.join(', ')}
          </div>
        )}

        <p style={{ marginBottom: '8px' }}>
          <strong>Source:</strong> {record.newspaperName || 'Archivo Nacional'}
          {record.pageNumber && ` (Pg. ${record.pageNumber})`}
        </p>

        <p style={{ marginBottom: '8px' }}><strong>Location:</strong> {record.location}</p>

        {record.summary && (
          <p style={{ marginBottom: '8px', fontStyle: 'italic', borderTop: '1px solid #eee', paddingTop: '5px' }}>
            {record.summary.substring(0, 100)}...
          </p>
        )}
      </div>

      <button onClick={copyCitation} style={{
        marginTop: '15px', width: '100%', padding: '12px',
        backgroundColor: '#737958', color: 'white', border: 'none',
        borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem',
      }}>
        📄 Copy APA Citation
      </button>

      {isAdmin && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button onClick={() => (window.location.href = `/edit/${record._id}`)} style={{
            flex: 1, padding: '10px', backgroundColor: '#586379',
            color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer',
          }}>
            ✏️ Edit
          </button>
          <button onClick={handleDelete} style={{
            flex: 1, padding: '10px', backgroundColor: '#a94442',
            color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer',
          }}>
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Pagination Controls ──────────────────────────────────────────────────────

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  const btnBase = {
    padding: '8px 14px', border: '2px solid #737958', borderRadius: '4px',
    cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold',
    transition: 'background-color 0.2s, color 0.2s', minWidth: '40px',
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
      <button
        style={currentPage === 1 ? { ...btnBase, backgroundColor: '#f0f0f0', color: '#aaa', borderColor: '#ccc', cursor: 'not-allowed' } : { ...btnBase, backgroundColor: 'white', color: '#737958' }}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >← Prev</button>

      {getPageNumbers().map((page, idx) =>
        page === '...' ? (
          <span key={`e-${idx}`} style={{ padding: '8px 4px', color: '#737958' }}>…</span>
        ) : (
          <button
            key={page}
            style={page === currentPage
              ? { ...btnBase, backgroundColor: '#737958', color: 'white' }
              : { ...btnBase, backgroundColor: 'white', color: '#737958' }}
            onClick={() => onPageChange(page)}
          >{page}</button>
        )
      )}

      <button
        style={currentPage === totalPages ? { ...btnBase, backgroundColor: '#f0f0f0', color: '#aaa', borderColor: '#ccc', cursor: 'not-allowed' } : { ...btnBase, backgroundColor: 'white', color: '#737958' }}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >Next →</button>
    </div>
  );
};

// ─── ResultList (paginated wrapper) ──────────────────────────────────────────

export const ResultList = ({ records = [], pageSize = 20, onDeleteSuccess }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(records.length / pageSize);
  const paginated = records.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = () => {
    setCurrentPage(1);
    if (onDeleteSuccess) onDeleteSuccess();
  };

  return (
    <div>
      <p style={{ color: '#737958', fontWeight: 'bold', marginBottom: '16px', fontSize: '0.95rem' }}>
        Showing {paginated.length} of {records.length} result{records.length !== 1 ? 's' : ''}
        {totalPages > 1 && ` — Page ${currentPage} of ${totalPages}`}
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '20px'
      }}>
        {paginated.map((record) => (
          <ResultCard key={record._id} record={record} onDeleteSuccess={handleDelete} />
        ))}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  );
};

export default ResultCard;