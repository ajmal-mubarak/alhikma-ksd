import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

const EMPTY_FORM = { name: '', register_number: '', status: 'not_eligible' };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [lastCreatedReg, setLastCreatedReg] = useState(null);
  const fileInputRef = useRef(null);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getStudents(search);
      setStudents(res.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
    setEditId(null);
    setError('');
    setLastCreatedReg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('register_number', form.register_number);
      fd.append('status', form.status);
      if (imageFile) fd.append('image', imageFile);

      if (editId) {
        await api.updateStudent(editId, fd);
        showSuccess('Student updated successfully!');
        setEditId(null);
      } else {
        const res = await api.createStudent(fd);
        setLastCreatedReg(res.data.register_number);
        showSuccess(`Student added! Register No: ${res.data.register_number}`);
      }
      setForm(EMPTY_FORM);
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadStudents();
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Failed to save. Check all fields.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (student) => {
    setEditId(student.id);
    setLastCreatedReg(null);
    setForm({ name: student.name, register_number: student.register_number, status: student.status });
    setImagePreview(student.image_url || null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    await api.deleteStudent(id);
    showSuccess('Student deleted.');
    loadStudents();
  };

  const handleStatus = async (student, newStatus) => {
    await api.updateStatus(student.id, newStatus);
    loadStudents();
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="admin-page">
        {/* Header */}
        <div className="admin-header">
          <div className="admin-title-row">
            <img src="/alhikmalogo.png" alt="logo" className="brand-logo" />
            <div>
              <h1>AL HIKMA WOMEN'S COLLEGE</h1>
              <div style={{ fontSize: '.75rem', opacity: .8, marginTop: '.15rem' }}>Admin Panel — HET Result 2026</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>

        {successMsg && <div className="success-msg">✅ {successMsg}</div>}

        <div className="admin-grid">
          {/* ── ADD / EDIT FORM ── */}
          <div className="card form-card">
            <h2>{editId ? '✏️ Edit Student' : '➕ Add New Student'}</h2>

            {lastCreatedReg && !editId && (
              <div className="reg-number-badge">
                🪪 Register No: <strong>{lastCreatedReg}</strong>
              </div>
            )}
            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleSubmit}>
              {/* Register Number */}
              <div className="form-group">
                <label>Register Number *</label>
                <input
                  type="text"
                  placeholder="e.g. AW1042"
                  value={form.register_number}
                  onChange={e => setForm(f => ({ ...f, register_number: e.target.value }))}
                  required
                  disabled={!!editId}
                  style={editId ? { background: '#f5f5f5', color: '#888', cursor: 'not-allowed' } : {}}
                />
                {!editId && <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: '.3rem' }}>Enter a unique register number for this student</p>}
                {editId && <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: '.3rem' }}>Register number cannot be changed after creation</p>}
              </div>

              {/* Name */}
              <div className="form-group">
                <label>Student Name *</label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              {/* Image upload */}
              <div className="form-group">
                <label>Student Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                />
                {imagePreview && (
                  <img src={imagePreview} alt="preview" className="img-preview" />
                )}
              </div>

              {/* Status radio pills */}
              <div className="form-group">
                <label>Eligibility Status *</label>
                <div className="radio-group">
                  <div className="radio-pill eligible">
                    <input
                      type="radio"
                      id="status-eligible"
                      name="status"
                      value="eligible"
                      checked={form.status === 'eligible'}
                      onChange={() => setForm(f => ({ ...f, status: 'eligible' }))}
                    />
                    <label htmlFor="status-eligible">✅ Eligible</label>
                  </div>
                  <div className="radio-pill not-eligible">
                    <input
                      type="radio"
                      id="status-not-eligible"
                      name="status"
                      value="not_eligible"
                      checked={form.status === 'not_eligible'}
                      onChange={() => setForm(f => ({ ...f, status: 'not_eligible' }))}
                    />
                    <label htmlFor="status-not-eligible">❌ Not Eligible</label>
                  </div>
                </div>
              </div>



              <button type="submit" className="btn btn-green btn-full" disabled={saving}>
                {saving ? <span className="spinner" /> : editId ? 'Update Student' : 'Add Student'}
              </button>
              {editId && (
                <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
              )}
            </form>
          </div>

          {/* ── STUDENT LIST ── */}
          <div className="card students-card">
            <h2>All Students <span>{students.length} records</span></h2>
            <input
              className="search-admin"
              placeholder="🔍 Search by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {loading && <div className="loading-row"><span className="spinner spinner-green" /></div>}
            {!loading && students.length === 0 && (
              <div className="empty-state">
                {search ? 'No students match your search.' : 'No students yet. Add one using the form.'}
              </div>
            )}
            {!loading && students.map(student => (
              <div className="student-item" key={student.id}>
                <div className="student-item-top">
                  {student.image_url
                    ? <img src={student.image_url} alt={student.name} className="student-thumb" />
                    : <div className="student-avatar">{student.name.charAt(0).toUpperCase()}</div>
                  }
                  <div className="student-info">
                    <div className="sname">{student.name}</div>
                    <div className="smeta">{student.register_number}</div>
                    <span className={`status-badge ${student.status === 'eligible' ? 'eligible' : 'not-eligible'}`}>
                      {student.status === 'eligible' ? 'Eligible' : 'Not Eligible'}
                    </span>
                  </div>
                </div>
                <div className="student-actions">
                  <button
                    className="btn-sm btn-eligible"
                    onClick={() => handleStatus(student, 'eligible')}
                    disabled={student.status === 'eligible'}
                  >✅ Eligible</button>
                  <button
                    className="btn-sm btn-not-eligible"
                    onClick={() => handleStatus(student, 'not_eligible')}
                    disabled={student.status === 'not_eligible'}
                  >❌ Not Eligible</button>
                  <button className="btn-sm btn-edit-sm" onClick={() => handleEdit(student)}>✏️</button>
                  <button className="btn-sm btn-delete" onClick={() => handleDelete(student.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
