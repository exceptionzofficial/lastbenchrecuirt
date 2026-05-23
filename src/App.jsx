import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Users, 
  Plus, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  Search, 
  Clock, 
  CheckCircle, 
  X, 
  ArrowRight, 
  Filter, 
  ShieldAlert, 
  UploadCloud,
  ChevronRight,
  TrendingUp,
  Download,
  AlertCircle
} from 'lucide-react';

// Hardcoded fallbacks in case the local API server is not running
const fallbackJobs = [
  {
    id: 'job-1',
    title: 'Frontend Engineer (React / Next.js)',
    department: 'Frontend',
    location: 'Remote',
    type: 'Full-time',
    experience: '1-3 Years',
    skills: ['React', 'Next.js', 'CSS', 'Tailwind CSS', 'Git'],
    description: 'We are looking for a sharp Frontend Engineer who loves building fast, responsive, and gorgeous web applications. You will own client-facing features from day one.'
  },
  {
    id: 'job-2',
    title: 'Backend Engineer (Node.js / Express)',
    department: 'Backend',
    location: 'Remote',
    type: 'Full-time',
    experience: '2-4 Years',
    skills: ['Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'REST APIs'],
    description: 'Join our team to build scalable APIs, solid databases, and reliable background systems. You will work on real-world integrations and optimize server performances.'
  },
  {
    id: 'job-3',
    title: 'Mobile App Developer (Flutter / React Native)',
    department: 'Mobile',
    location: 'Remote',
    type: 'Full-time',
    experience: '1-3 Years',
    skills: ['Flutter', 'Dart', 'React Native', 'Firebase', 'App Store Deployment'],
    description: 'Build cross-platform mobile apps for iOS and Android. From simple client MVPs to heavy-duty consumer applications, you will handle the entire mobile lifecycle.'
  },
  {
    id: 'job-4',
    title: 'UI/UX Designer & Builder',
    department: 'Design',
    location: 'Remote',
    type: 'Internship',
    experience: 'Freshers / Portfolio Required',
    skills: ['Figma', 'Prototyping', 'Tailwind CSS', 'HTML/CSS'],
    description: 'We need a creative designer who also understands code. You will design clean, high-fidelity prototypes in Figma and help translate them into beautiful frontend interfaces.'
  }
];

const fallbackApplications = [];

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? '/api'
  : 'https://lastbenchbackend.vercel.app/api';

function App() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('admin'); // Exclusively recruiter view
  const [isApiOnline, setIsApiOnline] = useState(false);
  const [recruiterPanelTab, setRecruiterPanelTab] = useState('applications'); // 'applications' or 'jobs'

  // Candidate view states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedJob, setSelectedJob] = useState(null); // Job for apply modal

  // Apply Form states
  const [applyName, setApplyName] = useState('');
  const [applyEmail, setApplyEmail] = useState('');
  const [applyMobile, setApplyMobile] = useState('');
  const [applyResume, setApplyResume] = useState(null);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);

  // Admin Form states
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobDept, setNewJobDept] = useState('');
  const [newJobLoc, setNewJobLoc] = useState('Remote');
  const [newJobType, setNewJobType] = useState('Full-time');
  const [newJobExp, setNewJobExp] = useState('');
  const [newJobSkills, setNewJobSkills] = useState('');
  const [newJobDesc, setNewJobDesc] = useState('');
  const [newJobSuccess, setNewJobSuccess] = useState(false);

  // Admin detail view state
  const [selectedAppDetail, setSelectedAppDetail] = useState(null);

  // Fetch jobs and applications
  const fetchData = async () => {
    try {
      const jobsRes = await fetch(`${API_BASE}/jobs`);
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData);
        setIsApiOnline(true);
      } else {
        throw new Error();
      }
    } catch {
      // Fallback to LocalStorage or Mock Seed Data
      const localJobs = localStorage.getItem('lastbench_jobs');
      if (localJobs) {
        setJobs(JSON.parse(localJobs));
      } else {
        setJobs(fallbackJobs);
        localStorage.setItem('lastbench_jobs', JSON.stringify(fallbackJobs));
      }
      setIsApiOnline(false);
    }

    try {
      const appsRes = await fetch(`${API_BASE}/applications`);
      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData);
      } else {
        throw new Error();
      }
    } catch {
      const localApps = localStorage.getItem('lastbench_applications');
      if (localApps) {
        setApplications(JSON.parse(localApps));
      } else {
        setApplications(fallbackApplications);
        localStorage.setItem('lastbench_applications', JSON.stringify(fallbackApplications));
      }
    }
  };

  useEffect(() => {
    fetchData();
    // Poll API status every 15s
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Handle Candidate Application Submission
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyName || !applyEmail || !applyMobile) return;

    setApplyLoading(true);

    const applicationPayload = {
      candidateName: applyName,
      email: applyEmail,
      mobile: applyMobile,
      jobId: selectedJob.id,
      resumeName: applyResume ? applyResume.name : 'Resume.pdf',
      resumeBase64: 'JVBERi0xLjQKJcOkw7zDtsOf...' // Simulating uploaded file base64
    };

    try {
      if (isApiOnline) {
        const res = await fetch(`${API_BASE}/applications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(applicationPayload)
        });
        if (res.ok) {
          const newApp = await res.json();
          setApplications(prev => [newApp, ...prev]);
        } else {
          throw new Error();
        }
      } else {
        // LocalStorage Fallback
        const newApp = {
          ...applicationPayload,
          id: 'app-' + Date.now(),
          jobTitle: selectedJob.title,
          appliedDate: new Date().toISOString(),
          status: 'Pending'
        };
        const updatedApps = [newApp, ...applications];
        setApplications(updatedApps);
        localStorage.setItem('lastbench_applications', JSON.stringify(updatedApps));
      }

      setApplySuccess(true);
      setTimeout(() => {
        setApplySuccess(false);
        setSelectedJob(null);
        setApplyName('');
        setApplyEmail('');
        setApplyMobile('');
        setApplyResume(null);
      }, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setApplyLoading(false);
    }
  };

  // Handle Admin posting a job
  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!newJobTitle || !newJobDept || !newJobDesc) return;

    const jobPayload = {
      title: newJobTitle,
      department: newJobDept,
      location: newJobLoc,
      type: newJobType,
      experience: newJobExp || 'Freshers / Experienced',
      skills: newJobSkills.split(',').map(s => s.trim()).filter(Boolean),
      description: newJobDesc
    };

    try {
      if (isApiOnline) {
        const res = await fetch(`${API_BASE}/jobs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jobPayload)
        });
        if (res.ok) {
          const savedJob = await res.json();
          setJobs(prev => [savedJob, ...prev]);
        } else {
          throw new Error();
        }
      } else {
        // LocalStorage Fallback
        const savedJob = {
          ...jobPayload,
          id: 'job-' + Date.now()
        };
        const updatedJobs = [savedJob, ...jobs];
        setJobs(updatedJobs);
        localStorage.setItem('lastbench_jobs', JSON.stringify(updatedJobs));
      }

      setNewJobSuccess(true);
      setNewJobTitle('');
      setNewJobDept('');
      setNewJobLoc('Remote');
      setNewJobType('Full-time');
      setNewJobExp('');
      setNewJobSkills('');
      setNewJobDesc('');

      setTimeout(() => setNewJobSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Application Status Update
  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      if (isApiOnline) {
        const res = await fetch(`${API_BASE}/applications/${appId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
          setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus } : app));
          if (selectedAppDetail && selectedAppDetail.id === appId) {
            setSelectedAppDetail(prev => ({ ...prev, status: newStatus }));
          }
        }
      } else {
        // LocalStorage Fallback
        const updatedApps = applications.map(app => app.id === appId ? { ...app, status: newStatus } : app);
        setApplications(updatedApps);
        localStorage.setItem('lastbench_applications', JSON.stringify(updatedApps));
        if (selectedAppDetail && selectedAppDetail.id === appId) {
          setSelectedAppDetail(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Job Status Activation Toggle (Enable / Disable)
  const handleToggleJobActive = async (jobId, currentActiveState) => {
    const newActiveState = currentActiveState === false ? true : false;
    try {
      if (isApiOnline) {
        const res = await fetch(`${API_BASE}/jobs/${jobId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ active: newActiveState })
        });
        if (res.ok) {
          const updatedJob = await res.json();
          setJobs(prev => prev.map(j => j.id === jobId ? updatedJob : j));
        }
      } else {
        // LocalStorage Fallback
        const updatedJobs = jobs.map(j => j.id === jobId ? { ...j, active: newActiveState } : j);
        setJobs(updatedJobs);
        localStorage.setItem('lastbench_jobs', JSON.stringify(updatedJobs));
      }
    } catch (err) {
      console.error('Failed to toggle job activation:', err);
    }
  };

  // Helper to open PDF preview or trigger DOCX/DOC file download
  const handleViewResume = (app) => {
    if (!app.resumeBase64) {
      alert('No resume file uploaded.');
      return;
    }

    try {
      // Decode Base64 safely, stripping any data URL prefixes
      const base64Data = app.resumeBase64.includes(',') 
        ? app.resumeBase64.split(',')[1] 
        : app.resumeBase64;

      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Determine correct mime type based on candidate's original filename
      const filename = app.resumeName || 'Resume.pdf';
      const ext = filename.split('.').pop().toLowerCase();
      let mimeType = 'application/pdf';
      if (ext === 'docx') {
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      } else if (ext === 'doc') {
        mimeType = 'application/msword';
      }

      const blob = new Blob([bytes], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);

      // Fulfill requirement: PDF previews in new tab, DOCX downloads
      if (ext === 'pdf') {
        window.open(blobUrl, '_blank');
      } else {
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      console.error('Failed to parse candidate resume file:', err);
      alert('Error: Could not parse candidate resume file. Ensure the uploaded format is correct.');
    }
  };

  // Filters for Candidate View
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = selectedDept === 'All' || job.department === selectedDept;
    const matchesType = selectedType === 'All' || job.type === selectedType;
    return matchesSearch && matchesDept && matchesType;
  });

  // Extract unique departments for filters
  const departments = ['All', ...new Set(jobs.map(j => j.department))];

  // Admin stats
  const totalAppsCount = applications.length;
  const pendingAppsCount = applications.filter(a => a.status === 'Pending').length;
  const shortlistedAppsCount = applications.filter(a => a.status === 'Shortlisted').length;
  const activeJobsCount = jobs.filter(j => j.active !== false).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* ─── HEADER ─── */}
      <header style={{ 
        height: '80px', 
        background: 'rgba(245, 245, 220, 0.98)', 
        borderBottom: '1px solid rgba(62, 39, 35, 0.1)',
        display: 'flex', 
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'var(--primary-color)',
              color: 'var(--bg-color)',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.2rem'
            }}>LB</div>
            <div>
              <h2 style={{ fontSize: '1.2rem', color: 'var(--primary-color)', fontWeight: 700 }}>Last Bench</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 500, display: 'block', marginTop: '-3px' }}>CAREER PORTAL</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              padding: '8px 16px', 
              borderRadius: '12px', 
              background: 'rgba(62, 39, 35, 0.05)', 
              border: '1px solid rgba(62, 39, 35, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--primary-color)'
            }}>
              <Users size={16} />
              <span>Recruiter Panel</span>
            </div>
            <a 
              href="http://localhost:5173" 
              style={{
                fontSize: '0.88rem',
                color: 'var(--accent-color)',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Main Site</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main style={{ flex: 1, padding: '40px 0' }}>
        
        {/* API STATUS BAR IF OFFLINE */}
        {!isApiOnline && (
          <div className="container" style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 20px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              color: '#b45309',
              fontSize: '0.88rem'
            }}>
              <AlertCircle size={18} />
              <span><strong>Standalone Demo Mode:</strong> The local API sync server is currently offline. All operations (applying for jobs, posting jobs, editing candidate status) will save and sync inside your browser's <strong>LocalStorage</strong> perfectly! Run <code>node server.js</code> to enable real-time local file database storage.</span>
            </div>
          </div>
        )}



        {/* ─── ADMIN DASHBOARD ─── */}
        {activeTab === 'admin' && (
          <div className="animate-fade-in container">
            
            {/* ADMIN TITLE */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span className="badge badge-shortlisted" style={{ marginBottom: '8px' }}>Recruiter View</span>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-color)', margin: 0 }}>Recruitment Dashboard</h1>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ padding: '8px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(62,39,35,0.06)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                  <span style={{ width: '8px', height: '8px', background: isApiOnline ? '#10b981' : '#f59e0b', borderRadius: '50%' }}></span>
                  <strong>Status:</strong> {isApiOnline ? 'Live File Server connected' : 'Offline LocalStorage Mode'}
                </div>
              </div>
            </div>

            {/* RECRUITER STATS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '36px' }}>
              <div className="glass" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: 'rgba(212,163,115,0.15)', color: 'var(--accent-color)', padding: '12px', borderRadius: '12px' }}>
                  <Briefcase size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 500 }}>Active Roles</span>
                  <h3 style={{ fontSize: '1.6rem', color: 'var(--primary-color)', fontWeight: 700 }}>{activeJobsCount}</h3>
                </div>
              </div>

              <div className="glass" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: 'rgba(62,39,35,0.06)', color: 'var(--primary-color)', padding: '12px', borderRadius: '12px' }}>
                  <Users size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 500 }}>Total Applications</span>
                  <h3 style={{ fontSize: '1.6rem', color: 'var(--primary-color)', fontWeight: 700 }}>{totalAppsCount}</h3>
                </div>
              </div>

              <div className="glass" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: 'rgba(245,158,11,0.12)', color: '#d97706', padding: '12px', borderRadius: '12px' }}>
                  <Clock size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 500 }}>Pending Review</span>
                  <h3 style={{ fontSize: '1.6rem', color: '#d97706', fontWeight: 700 }}>{pendingAppsCount}</h3>
                </div>
              </div>

              <div className="glass" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: 'rgba(16,185,129,0.12)', color: '#059669', padding: '12px', borderRadius: '12px' }}>
                  <CheckCircle size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 500 }}>Shortlisted Candidates</span>
                  <h3 style={{ fontSize: '1.6rem', color: '#059669', fontWeight: 700 }}>{shortlistedAppsCount}</h3>
                </div>
              </div>
            </div>

            {/* DASHBOARD COLUMNS */}
            <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
              
              {/* APPLICATIONS AND JOB OPENINGS MULTI-TAB WORKSPACE */}
              <div className="glass" style={{ flex: 1, minWidth: '320px', padding: '24px', overflow: 'hidden' }}>
                
                {/* SUB-TABS INTERACTIVE SWITCHER */}
                <div style={{ display: 'flex', gap: '16px', borderBottom: '2px solid rgba(62, 39, 35, 0.06)', paddingBottom: '0px', marginBottom: '20px' }}>
                  <button 
                    onClick={() => setRecruiterPanelTab('applications')}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: recruiterPanelTab === 'applications' ? 'var(--primary-color)' : 'var(--text-light)',
                      cursor: 'pointer',
                      padding: '10px 4px',
                      borderBottom: recruiterPanelTab === 'applications' ? '3px solid var(--primary-color)' : '3px solid transparent',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s',
                      outline: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FileText size={18} />
                    <span>Applications ({applications.length})</span>
                  </button>
                  <button 
                    onClick={() => setRecruiterPanelTab('jobs')}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: recruiterPanelTab === 'jobs' ? 'var(--primary-color)' : 'var(--text-light)',
                      cursor: 'pointer',
                      padding: '10px 4px',
                      borderBottom: recruiterPanelTab === 'jobs' ? '3px solid var(--primary-color)' : '3px solid transparent',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s',
                      outline: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Briefcase size={18} />
                    <span>Job Openings ({jobs.length})</span>
                  </button>
                </div>

                {recruiterPanelTab === 'applications' ? (
                  /* APPLICATIONS VIEW */
                  applications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)', border: '1px dashed rgba(62,39,35,0.08)', borderRadius: '12px' }}>
                      No applications received yet.
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid rgba(62,39,35,0.08)', color: 'var(--primary-color)', fontWeight: 600 }}>
                            <th style={{ padding: '12px 8px' }}>Candidate</th>
                            <th style={{ padding: '12px 8px' }}>Role</th>
                            <th style={{ padding: '12px 8px' }}>Applied Date</th>
                            <th style={{ padding: '12px 8px' }}>Status</th>
                            <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {applications.map(app => (
                            <tr 
                              key={app.id} 
                              style={{ 
                                borderBottom: '1px solid rgba(62,39,35,0.04)',
                                cursor: 'pointer',
                                background: selectedAppDetail && selectedAppDetail.id === app.id ? 'rgba(212,163,115,0.06)' : 'transparent'
                              }}
                              onClick={() => setSelectedAppDetail(app)}
                            >
                              <td style={{ padding: '14px 8px' }}>
                                <div style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{app.candidateName}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{app.email}</div>
                              </td>
                              <td style={{ padding: '14px 8px', fontWeight: 500 }}>{app.jobTitle}</td>
                              <td style={{ padding: '14px 8px', color: 'var(--text-light)', fontSize: '0.8rem' }}>
                                {new Date(app.appliedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                              <td style={{ padding: '14px 8px' }}>
                                <span className={`badge badge-${app.status.toLowerCase()}`}>
                                  {app.status}
                                </span>
                              </td>
                              <td style={{ padding: '14px 8px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                                <select 
                                  value={app.status} 
                                  onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    border: '1px solid rgba(62,39,35,0.15)',
                                    background: 'white',
                                    color: 'var(--text-main)',
                                    fontWeight: 500,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Reviewed">Reviewed</option>
                                  <option value="Shortlisted">Shortlisted</option>
                                  <option value="Rejected">Rejected</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                ) : (
                  /* JOBS OPENINGS VIEW */
                  jobs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)', border: '1px dashed rgba(62,39,35,0.08)', borderRadius: '12px' }}>
                      No job openings created yet.
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid rgba(62, 39, 35, 0.08)', color: 'var(--primary-color)', fontWeight: 600 }}>
                            <th style={{ padding: '12px 8px' }}>Role / Department</th>
                            <th style={{ padding: '12px 8px' }}>Experience</th>
                            <th style={{ padding: '12px 8px' }}>Status</th>
                            <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {jobs.map(job => {
                            const isActive = job.active !== false;
                            return (
                              <tr key={job.id} style={{ borderBottom: '1px solid rgba(62, 39, 35, 0.04)' }}>
                                <td style={{ padding: '14px 8px' }}>
                                  <div style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{job.title}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{job.department} · {job.type}</div>
                                </td>
                                <td style={{ padding: '14px 8px', color: 'var(--text-light)', fontWeight: 500 }}>{job.experience}</td>
                                <td style={{ padding: '14px 8px' }}>
                                  <span style={{
                                    background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(107, 114, 128, 0.12)',
                                    color: isActive ? '#059669' : '#4b5563',
                                    border: `1px solid ${isActive ? '#10b98122' : '#6b728022'}`,
                                    padding: '4px 10px',
                                    borderRadius: '50px',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    display: 'inline-block'
                                  }}>
                                    {isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                                  <button
                                    onClick={() => handleToggleJobActive(job.id, job.active)}
                                    style={{
                                      padding: '5px 12px',
                                      borderRadius: '50px',
                                      fontSize: '0.78rem',
                                      fontWeight: 700,
                                      border: '1.5px solid',
                                      borderColor: isActive ? '#ef4444' : 'var(--accent-color)',
                                      background: 'transparent',
                                      color: isActive ? '#dc2626' : 'var(--primary-color)',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s',
                                      outline: 'none'
                                    }}
                                  >
                                    {isActive ? 'Disable' : 'Enable'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )
                )}
              </div>

              {/* POST A JOB FORM */}
              <div className="glass" style={{ width: '340px', padding: '24px', alignSelf: 'flex-start' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--primary-color)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                  <Plus size={18} />
                  <span>Post a New Job</span>
                </h3>

                {newJobSuccess && (
                  <div style={{ background: 'rgba(16,185,129,0.12)', color: '#059669', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '16px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={16} />
                    <span>Job listing posted successfully!</span>
                  </div>
                )}

                <form onSubmit={handlePostJob}>
                  <div className="form-group">
                    <label>Job Title</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input" 
                      placeholder="e.g. Flutter Developer" 
                      value={newJobTitle}
                      onChange={(e) => setNewJobTitle(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Department</label>
                    <select 
                      className="form-select"
                      value={newJobDept}
                      onChange={(e) => setNewJobDept(e.target.value)}
                      required
                    >
                      <option value="">Select Department...</option>
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                      <option value="Mobile">Mobile</option>
                      <option value="Design">Design</option>
                      <option value="Full Stack">Full Stack</option>
                      <option value="QA">QA</option>
                      <option value="Management">Management</option>
                    </select>
                  </div>

                  <div className="form-row" style={{ display: 'flex', gap: '12px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Location</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Remote" 
                        value={newJobLoc}
                        onChange={(e) => setNewJobLoc(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Job Type</label>
                      <select 
                        className="form-select"
                        value={newJobType}
                        onChange={(e) => setNewJobType(e.target.value)}
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Internship">Internship</option>
                        <option value="Contract">Contract</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Experience Required</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Freshers / 1-2 Years" 
                      value={newJobExp}
                      onChange={(e) => setNewJobExp(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Skills (comma separated)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="React Native, Firebase, Git" 
                      value={newJobSkills}
                      onChange={(e) => setNewJobSkills(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Job Description</label>
                    <textarea 
                      required 
                      className="form-input" 
                      rows="3" 
                      placeholder="Outline key responsibilities and roles..."
                      value={newJobDesc}
                      onChange={(e) => setNewJobDesc(e.target.value)}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                    <span>Publish Role</span>
                    <Plus size={16} />
                  </button>
                </form>
              </div>

            </div>

            {/* CANDIDATE DETAIL MODAL DRAWER */}
            {selectedAppDetail && (
              <div style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '450px',
                background: 'white',
                boxShadow: '-10px 0 30px rgba(62,39,35,0.15)',
                zIndex: 200,
                padding: '36px',
                display: 'flex',
                flexDirection: 'column',
                borderLeft: '1px solid rgba(62,39,35,0.08)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ color: 'var(--primary-color)', fontWeight: 700, fontSize: '1.25rem' }}>Application Profile</h3>
                  <button 
                    onClick={() => setSelectedAppDetail(null)} 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'rgba(212,163,115,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: 'var(--primary-color)'
                    }}>
                      {selectedAppDetail.candidateName.charAt(0)}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.15rem', color: 'var(--primary-color)', fontWeight: 700 }}>{selectedAppDetail.candidateName}</h4>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-light)', fontWeight: 500 }}>Applied for {selectedAppDetail.jobTitle}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem' }}>
                      <Mail size={16} style={{ color: 'var(--accent-color)' }} />
                      <a href={`mailto:${selectedAppDetail.email}`} style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500 }}>{selectedAppDetail.email}</a>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem' }}>
                      <Phone size={16} style={{ color: 'var(--accent-color)' }} />
                      <a href={`tel:${selectedAppDetail.mobile}`} style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500 }}>{selectedAppDetail.mobile}</a>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem' }}>
                      <Clock size={16} style={{ color: 'var(--accent-color)' }} />
                      <span style={{ color: 'var(--text-light)' }}>
                        Applied on {new Date(selectedAppDetail.appliedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <hr style={{ border: 0, borderTop: '1px solid rgba(62,39,35,0.08)', marginBottom: '24px' }} />

                  {/* RESUME CARD */}
                  <h4 style={{ color: 'var(--primary-color)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '12px' }}>Candidate Resume</h4>
                  <div style={{ 
                    background: 'rgba(62,39,35,0.02)', 
                    border: '1px solid rgba(62,39,35,0.06)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '24px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <FileText size={24} style={{ color: 'var(--accent-color)' }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary-color)' }}>{selectedAppDetail.resumeName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Mock PDF Document · 185 KB</div>
                      </div>
                    </div>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem' }}
                      onClick={() => handleViewResume(selectedAppDetail)}
                    >
                      <Download size={14} />
                      <span>View</span>
                    </button>
                  </div>

                  {/* STATUS EDIT */}
                  <h4 style={{ color: 'var(--primary-color)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '12px' }}>Application Status</h4>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['Pending', 'Reviewed', 'Shortlisted', 'Rejected'].map(status => (
                      <button
                        key={status}
                        onClick={() => handleUpdateStatus(selectedAppDetail.id, status)}
                        style={{
                          flex: 1,
                          padding: '8px 4px',
                          borderRadius: '8px',
                          border: '1px solid',
                          borderColor: selectedAppDetail.status === status 
                            ? (status === 'Shortlisted' ? '#10b981' : status === 'Pending' ? '#f59e0b' : status === 'Reviewed' ? '#3b82f6' : '#ef4444')
                            : 'rgba(62,39,35,0.1)',
                          background: selectedAppDetail.status === status
                            ? (status === 'Shortlisted' ? 'rgba(16,185,129,0.12)' : status === 'Pending' ? 'rgba(245,158,11,0.12)' : status === 'Reviewed' ? 'rgba(59,130,246,0.12)' : 'rgba(239,68,68,0.12)')
                            : 'white',
                          color: selectedAppDetail.status === status
                            ? (status === 'Shortlisted' ? '#059669' : status === 'Pending' ? '#b45309' : status === 'Reviewed' ? '#2563eb' : '#dc2626')
                            : 'var(--text-light)',
                          fontWeight: 600,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ width: '100%' }}
                    onClick={() => setSelectedAppDetail(null)}
                  >
                    Close Profile
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
      </main>



      {/* ─── FOOTER ─── */}
      <footer style={{ 
        background: 'var(--primary-color)', 
        color: 'rgba(245, 245, 220, 0.7)', 
        padding: '24px 0',
        borderTop: '1px solid rgba(212, 163, 115, 0.15)',
        fontSize: '0.85rem',
        textAlign: 'center'
      }}>
        <div className="container">
          <p>© 2026 Last Bench Software. All rights reserved. &nbsp;·&nbsp; Recruiter & Job Seeker Dashboard</p>
        </div>
      </footer>

    </div>
  );
}

export default App;
