import { useState, useCallback } from 'react';
import { api } from '../api';

function ResultModal({ student, onClose }) {
  const isEligible = student.status === 'eligible';

  const handleDownload = useCallback(async () => {
    if (!student.image_url) {
      alert('No image uploaded for this student.');
      return;
    }
    try {
      const response = await fetch(student.image_url);
      const blob = await response.blob();
      const ext = student.image_url.split('.').pop().split('?')[0] || 'jpg';
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${student.name.replace(/\s+/g, '_')}_${student.register_number}.${ext}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to download image.');
    }
  }, [student]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        {/* Top bar */}
        <div className="modal-topbar">
          <div className="mtb-icon">🎓</div>
          <div>
            <div className="mtb-title">Exam Result</div>
            <div className="mtb-sub">Official Result Card</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Photo */}
        {student.image_url
          ? <img src={student.image_url} alt={student.name} className="modal-photo" />
          : <div className="modal-photo-placeholder">👤</div>
        }

        {/* Result block */}
        <div className={`modal-result ${isEligible ? 'eligible' : 'not-eligible'}`}>
          <div className="modal-result-icon">{isEligible ? '✅' : '❌'}</div>
          <div className="modal-result-label">{isEligible ? 'Result' : 'Result'}</div>
          <div className="modal-student-name">{student.name}</div>
          <div className="modal-status-badge">
            {isEligible ? '✓ Eligible for Exam' : '✗ Not Eligible for Exam'}
          </div>
        </div>

        {/* Footer actions */}
        <div className="modal-footer">
          <button className="btn-download" onClick={handleDownload}>
            ⬇ Download Result
          </button>
          <button className="btn-close-modal" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [regNo, setRegNo] = useState('');
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmed = regNo.trim();
    if (!trimmed) return;
    setLoading(true);
    setResult(null);
    setNotFound(false);
    setShowModal(false);
    try {
      const res = await api.getResult(trimmed);
      setResult(res.data);
      setShowModal(true);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="site-header">
        <img src="/alhikmalogo.png" alt="Al Hikma Logo" className="logo-img" />
        <h1>Alhikma Womens College</h1>
        <p className="subtitle">Exam Result — 2026</p>
        <p className="tagline">Check Your Eligibility Status Below</p>
      </header>

      <div className="search-section">
        <div className="card">
          <div className="card-label">Enter Register Number</div>
          <form className="search-row" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="e.g. AW1042"
              value={regNo}
              onChange={e => setRegNo(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn btn-green" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Search'}
            </button>
          </form>
          <p className="search-hint">Enter your register number to check your exam result</p>
        </div>

        {notFound && !loading && (
          <div className="card" style={{ marginTop: '1rem', textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>🔍</div>
            <h3 style={{ fontWeight: 700, marginBottom: '.4rem' }}>Not Found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '.88rem' }}>
              Register number <strong>{regNo.toUpperCase()}</strong> was not found. Please check and try again.
            </p>
          </div>
        )}
      </div>

      <div className="how-section">
        <h2>How to Check Your Result</h2>
        <div className="steps">
          <div className="step">
            <div className="step-num">1</div>
            <p>Enter your <strong>Register Number</strong> in the search box above</p>
          </div>
          <div className="step">
            <div className="step-num">2</div>
            <p>Tap <strong>Search</strong> to view your result</p>
          </div>
          <div className="step">
            <div className="step-num">3</div>
            <p>Your photo and <strong>eligibility status</strong> will appear in a popup</p>
          </div>
        </div>
      </div>

      <footer>
        <p>© 2026 Alhikma Womens College. All rights reserved.</p>
      </footer>

      {showModal && result && (
        <ResultModal student={result} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
