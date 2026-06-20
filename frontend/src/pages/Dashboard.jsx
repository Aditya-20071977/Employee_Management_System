import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { useNavigate, useLocation } from 'react-router-dom';

const Dashboard = () => {
    const [employees, setEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedEmpId, setSelectedEmpId] = useState(null);

    // Form inputs state
    const [formValues, setFormValues] = useState({
        fullName: '',
        email: '',
        mobile: '',
        department: '',
        designation: '',
        joiningDate: new Date().toISOString().split('T')[0]
    });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const currentUser = localStorage.getItem('username') || 'Administrator';

    const fetchEmployees = async (searchVal = '') => {
        setLoading(true);
        setError('');
        try {
            const url = searchVal ? `/employees?search=${encodeURIComponent(searchVal)}` : '/employees';
            const res = await api.get(url);
            setEmployees(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to retrieve employees list');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (location.state?.successMessage) {
            setSuccess(location.state.successMessage);
            window.history.replaceState({}, document.title);
            setTimeout(() => setSuccess(''), 4000);
        }
        fetchEmployees();
    }, [location]);

    // Handle search input change (debounced search could be nice, but simple input works well)
    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        fetchEmployees(val);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/login', { state: { successMessage: 'You have been logged out successfully.' } });
    };

    // Open modal to add new employee
    const openAddModal = () => {
        setIsEditing(false);
        setSelectedEmpId(null);
        setFormValues({
            fullName: '',
            email: '',
            mobile: '',
            department: '',
            designation: '',
            joiningDate: new Date().toISOString().split('T')[0]
        });
        setFormErrors({});
        setShowModal(true);
    };

    // Open modal to edit existing employee
    const openEditModal = (emp) => {
        setIsEditing(true);
        setSelectedEmpId(emp._id);
        setFormValues({
            fullName: emp.fullName,
            email: emp.email,
            mobile: emp.mobile,
            department: emp.department,
            designation: emp.designation,
            joiningDate: emp.joiningDate ? emp.joiningDate.split('T')[0] : new Date().toISOString().split('T')[0]
        });
        setFormErrors({});
        setShowModal(true);
    };

    // Form validations
    const validateForm = () => {
        const errors = {};
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        const mobileRegex = /^[0-9\-\+\s]{10,15}$/;

        if (!formValues.fullName.trim()) {
            errors.fullName = 'Full name is required';
        }
        if (!formValues.email.trim()) {
            errors.email = 'Email is required';
        } else if (!emailRegex.test(formValues.email)) {
            errors.email = 'Please fill a valid email address';
        }
        if (!formValues.mobile.trim()) {
            errors.mobile = 'Mobile number is required';
        } else if (!mobileRegex.test(formValues.mobile)) {
            errors.mobile = 'Valid phone is required (10-15 digits)';
        }
        if (!formValues.department.trim()) {
            errors.department = 'Department is required';
        }
        if (!formValues.designation.trim()) {
            errors.designation = 'Designation is required';
        }
        if (!formValues.joiningDate) {
            errors.joiningDate = 'Joining date is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Submit form logic
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            if (isEditing) {
                const res = await api.put(`/employees/${selectedEmpId}`, formValues);
                setSuccess(res.data.message || 'Employee updated successfully');
            } else {
                const res = await api.post('/employees/add', formValues);
                setSuccess(res.data.message || 'Employee added successfully');
            }
            setShowModal(false);
            fetchEmployees(searchTerm);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setFormErrors({ apiError: err.response?.data?.message || 'Action failed. Please check inputs.' });
        } finally {
            setSubmitting(false);
        }
    };

    // Delete employee logic
    const handleDeleteEmployee = async (id) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) return;

        try {
            const res = await api.delete(`/employees/${id}`);
            setSuccess(res.data.message || 'Employee deleted successfully');
            fetchEmployees(searchTerm);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete employee');
            setTimeout(() => setError(''), 4000);
        }
    };

    // Compute stats dynamically
    const totalEmployees = employees.length;
    const departmentCounts = employees.reduce((acc, emp) => {
        const dept = emp.department ? emp.department.trim() : 'Unknown';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
    }, {});

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            {/* SIDEBAR */}
            <aside className="no-scrollbar" style={{
                width: '280px',
                backgroundColor: 'var(--bg-sidebar)',
                borderRight: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                padding: '30px 24px',
                flexShrink: 0,
                overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px var(--primary-glow)'
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 21h18" />
                            <path d="M5 21V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v13" />
                            <path d="M13 21V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v17" />
                            <path d="M8 10h2" />
                            <path d="M8 14h2" />
                            <path d="M16 6h2" />
                            <path d="M16 10h2" />
                            <path d="M16 14h2" />
                        </svg>
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.25rem', margin: 0, letterSpacing: '-0.02em' }}>EMS Pro</h1>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Corporate Portal</span>
                    </div>
                </div>

                <div style={{ flexGrow: 1 }}>
                    <h3 style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: '16px'
                    }}>
                        Statistics
                    </h3>

                    {/* Stats Card */}
                    <div style={{
                        backgroundColor: 'var(--bg-app)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px',
                        marginBottom: '24px',
                        border: '1px solid var(--border-color)'
                    }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Employees</span>
                        <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '4px', color: 'var(--primary)' }}>
                            {totalEmployees}
                        </div>
                    </div>

                    <h3 style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: '16px'
                    }}>
                        Departments
                    </h3>

                    <div className="no-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto' }}>
                        {Object.keys(departmentCounts).length === 0 ? (
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No departments found</span>
                        ) : (
                            Object.entries(departmentCounts).map(([dept, count]) => (
                                <div key={dept} className="dept-item" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: '0.85rem',
                                    padding: '8px 12px',
                                    backgroundColor: 'var(--bg-app)',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border-color)',
                                    cursor: 'default'
                                }}>
                                    <span style={{ fontWeight: '500', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>{dept}</span>
                                    <span style={{
                                        backgroundColor: 'var(--primary-glow)',
                                        color: 'var(--primary)',
                                        fontWeight: '700',
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        fontSize: '0.75rem'
                                    }}>{count}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar footer user / logout */}
                <div style={{
                    paddingTop: '24px',
                    marginTop: 'auto'
                }}>
                    <div style={{
                        backgroundColor: 'var(--bg-card-profile, rgba(255, 255, 255, 0.02))',
                        borderRadius: 'var(--radius-lg)',
                        padding: '16px',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '700',
                                fontSize: '1rem',
                                flexShrink: 0,
                                boxShadow: '0 4px 10px var(--primary-glow)'
                            }}>
                                {currentUser.substring(0, 2).toUpperCase()}
                            </div>
                            <div style={{ overflow: 'hidden', flexGrow: 1 }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{currentUser}</div>
                                <span style={{
                                    display: 'inline-block',
                                    fontSize: '0.7rem',
                                    color: 'var(--primary)',
                                    fontWeight: '700',
                                    backgroundColor: 'var(--primary-glow)',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    marginTop: '2px'
                                }}>
                                    Administrator
                                </span>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="btn-logout" style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-app)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN WORKSPACE */}
            <main style={{
                flexGrow: 1,
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-app)'
            }}>
                {/* Header Actions */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '32px',
                    gap: '20px',
                    flexWrap: 'wrap'
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '4px' }}>Employee Workspace</h2>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Search, add, modify and track corporate staffing records</p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Live Search */}
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="form-control"
                                style={{ paddingLeft: '40px', width: '280px', height: '44px' }}
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <svg 
                                width="18" 
                                height="18" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="var(--text-muted)" 
                                strokeWidth="2.5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                                style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)'
                                }}
                            >
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>

                        {/* Add Employee Button */}
                        <button onClick={openAddModal} className="btn btn-primary" style={{ height: '44px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Add Employee
                        </button>
                    </div>
                </div>

                {/* Notifications Banners */}
                {success && (
                    <div className="alert alert-success">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span>{success}</span>
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {/* DATA TABLE VIEW */}
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: '16px' }}>
                        <div className="spinner spinner-primary" style={{ width: '40px', height: '40px' }}></div>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Retrieving employee ledger...</span>
                    </div>
                ) : employees.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        border: '2px dashed var(--border-color)',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: 'var(--bg-sidebar)'
                    }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No records found</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '360px', margin: '0 auto' }}>
                            {searchTerm ? `No employee matches the name "${searchTerm}". Try a different spelling.` : "Start assembling your organizational ledger by adding your first employee."}
                        </p>
                    </div>
                ) : (
                    <div className="table-container no-scrollbar animate-fade-in">
                        <table className="emp-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '60px' }}>S.No</th>
                                    <th>Full Name</th>
                                    <th>Email Address</th>
                                    <th>Mobile Phone</th>
                                    <th>Department</th>
                                    <th>Designation</th>
                                    <th>Joining Date</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((emp, index) => (
                                    <tr key={emp._id}>
                                        <td style={{ fontWeight: '600', color: 'var(--text-muted)', width: '60px' }}>{index + 1}</td>
                                        <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{emp.fullName}</td>
                                        <td>{emp.email}</td>
                                        <td>{emp.mobile}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                backgroundColor: 'var(--bg-app)',
                                                border: '1px solid var(--border-color)',
                                                color: 'var(--text-secondary)'
                                            }}>
                                                {emp.department}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{emp.designation}</td>
                                        <td>
                                            {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            }) : 'N/A'}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                                                {/* Edit Action */}
                                                <button 
                                                    onClick={() => openEditModal(emp)} 
                                                    className="btn-icon" 
                                                    title="Edit Record"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                </button>
                                                {/* Delete Action */}
                                                <button 
                                                    onClick={() => handleDeleteEmployee(emp._id)} 
                                                    className="btn-icon" 
                                                    style={{ color: 'var(--error)' }}
                                                    title="Delete Record"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* ADD / EDIT MODAL INTERFACE */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 style={{ fontSize: '1.25rem' }}>{isEditing ? 'Modify Employee Record' : 'Enroll New Employee'}</h2>
                            <button onClick={() => setShowModal(false)} className="btn-icon" style={{ borderRadius: '50%' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit}>
                            <div className="modal-body">
                                {formErrors.apiError && (
                                    <div className="alert alert-danger" style={{ padding: '10px 16px', marginBottom: '16px' }}>
                                        <span>{formErrors.apiError}</span>
                                    </div>
                                )}

                                <div className="modal-grid">
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Full Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. John Doe"
                                            value={formValues.fullName}
                                            onChange={(e) => setFormValues({ ...formValues, fullName: e.target.value })}
                                            disabled={submitting}
                                        />
                                        {formErrors.fullName && <div className="form-error">{formErrors.fullName}</div>}
                                    </div>

                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Email Address</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            placeholder="e.g. john@company.com"
                                            value={formValues.email}
                                            onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                                            disabled={submitting}
                                        />
                                        {formErrors.email && <div className="form-error">{formErrors.email}</div>}
                                    </div>

                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Mobile Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. +1 555 1234"
                                            value={formValues.mobile}
                                            onChange={(e) => setFormValues({ ...formValues, mobile: e.target.value })}
                                            disabled={submitting}
                                        />
                                        {formErrors.mobile && <div className="form-error">{formErrors.mobile}</div>}
                                    </div>

                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Joining Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={formValues.joiningDate}
                                            onChange={(e) => setFormValues({ ...formValues, joiningDate: e.target.value })}
                                            disabled={submitting}
                                        />
                                        {formErrors.joiningDate && <div className="form-error">{formErrors.joiningDate}</div>}
                                    </div>

                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Department</label>
                                        <select
                                            className="form-control"
                                            value={formValues.department}
                                            onChange={(e) => setFormValues({ ...formValues, department: e.target.value })}
                                            disabled={submitting}
                                        >
                                            <option value="">Select Department</option>
                                            <option value="IT">IT</option>
                                            <option value="HR">HR</option>
                                            <option value="Finance">Finance</option>
                                            <option value="Marketing">Marketing</option>
                                            <option value="Sales">Sales</option>
                                            <option value="Operations">Operations</option>
                                        </select>
                                        {formErrors.department && <div className="form-error">{formErrors.department}</div>}
                                    </div>

                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Designation</label>
                                        <select
                                            className="form-control"
                                            value={formValues.designation}
                                            onChange={(e) => setFormValues({ ...formValues, designation: e.target.value })}
                                            disabled={submitting}
                                        >
                                            <option value="">Select Designation</option>
                                            <option value="Intern">Intern</option>
                                            <option value="Developer">Developer</option>
                                            <option value="Manager">Manager</option>
                                            <option value="Team Lead">Team Lead</option>
                                            <option value="HR Executive">HR Executive</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                        {formErrors.designation && <div className="form-error">{formErrors.designation}</div>}
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => setShowModal(false)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary" 
                                    disabled={submitting}
                                >
                                    {submitting ? <div className="spinner"></div> : isEditing ? 'Update Record' : 'Add Employee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;