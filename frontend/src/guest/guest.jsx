import React, { useState, useEffect } from 'react';
import styles from './gueststyle.module.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

const CitiSolveLanding = () => {
  const navigate = useNavigate();
  const {
  signupUser,
  loginUser,
  verifyOtp,
  resendOTP,
  loading,
  error,
  otpSent,
  setError,
  } = useAuth();


  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [detail, setdetail] = useState("citizen");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [authMode, setAuthMode] = useState('login');

  
  // Location state for Staff signup
  const [locationState, setLocationState] = useState("");
  const [locationDistrict, setLocationDistrict] = useState("");
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [locationFetched, setLocationFetched] = useState(false);

  const handleotpchange = (e, index) => {
    if (isNaN(e.target.value)) return;
    const newotp = [...otp];
    newotp[index] = e.target.value;
    setOtp(newotp);
    if (e.target.nextSibling && e.target.value !== "") {
      e.target.nextSibling.focus();
    }
  };

  const handlekeydown = (e, i) => {
    if (e.key === "Backspace") {
      if (otp[i] === "") {
        if (i === 0) return;
        e.preventDefault();
        const prev = e.target.parentNode.children[i - 1];
        prev.focus();
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setActiveFeature((prev) => (prev + 1) % 4), 3000);
    return () => clearInterval(interval);
  }, []);

  // Reset error when switching auth mode
  useEffect(() => {
    setError('');
    setdetail("citizen");
    setLocationState("");
    setLocationDistrict("");
    setLocationFetched(false);
  }, [authMode, setError]);

  // Fetch location using Geolocation API and reverse geocoding
  const fetchLocation = async () => {
    setFetchingLocation(true);
    setError('');
    
    try {
      // Get user's coordinates
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocoding using OpenStreetMap Nominatim
      const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/geocode/reverse?lat=${latitude}&lon=${longitude}`,{
            credentials: 'include'
          }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch location details');
      }

      const data = await response.json();
      const address = data.address || {};

      // Extract state and district
      const state = address.state || address.region || "";
      const district = address.county || address.state_district || address.city || "";

      setLocationState(state);
      setLocationDistrict(district);
      setLocationFetched(true);

    } catch (err) {
      console.error('Location fetch error:', err);
      setError(err.message === 'User denied Geolocation' 
        ? 'Location access denied. Please enable location permissions.'
        : 'Failed to fetch location. Please try again or report to administrator.');
      setLocationFetched(false);
    } finally {
      setFetchingLocation(false);
    }
  };

  const features = [
    { icon: "📍", title: "Submit Complaints", description: "Report civic issues instantly with photos and location tracking" },
    { icon: "📊", title: "Track Progress", description: "Monitor your complaints in real-time with detailed status updates" },
    { icon: "🔔", title: "Get Notifications", description: "Stay informed with instant alerts on municipal updates and resolutions" },
    { icon: "📈", title: "Analytics Dashboard", description: "Access comprehensive data insights and community complaint trends" }
  ];

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "5K+", label: "Complaints Resolved" },
    { number: "95%", label: "Satisfaction Rate" },
    { number: "24/7", label: "Support Available" }
  ];

  const buildSignupPayload = (formData) => {
  return {
    name: formData.get('fullname')?.trim(),
    email: formData.get('email')?.trim(),
    password: formData.get('password'),
    role: detail,
    ...(detail === 'staff' && {
      department: formData.get('category'),
      state: locationState,
      district: locationDistrict,
    }),
  };
  };


  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.target);

    if (authMode === 'signup') {
      await signupUser(buildSignupPayload(formData));
    } else {
        await loginUser({
          email: formData.get('email')?.trim(),
          password: formData.get('password'),
          role: detail,
        });
    }
  };


  const handleotp = async (e) => {
  e.preventDefault();
  const enteredOtp = otp.join("");
  await verifyOtp(enteredOtp);
  };


  const handleclose = () => {
    setShowAuthModal(false);
  };

  // Loader styles
  const loaderStyles = {
    display: 'inline-block',
    width: '20px',
    height: '20px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTop: '3px solid white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  };

  const errorMessageStyles = {
    color: '#ef4444',
    fontSize: '14px',
    marginTop: '12px',
    marginBottom: '8px',
    padding: '10px',
    backgroundColor: '#fee2e2',
    borderRadius: '6px',
    textAlign: 'center',
  };

  return (
    <div className={styles.container}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      {/* Navigation */}
      <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
        <div className={styles.navContent}>
          <div className={styles.logo}>
            <span className={styles.logoText}>CitiSolve</span>
          </div>
          <div className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
            <span></span><span></span><span></span>
          </div>
          <div className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ''}`}>
            <a href="#features" className={styles.navLink} onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className={styles.navLink} onClick={() => setMenuOpen(false)}>How It Works</a>
            <a href="#about" className={styles.navLink} onClick={() => setMenuOpen(false)}>About</a>
            <button className={styles.authBtn} onClick={() => setShowAuthModal(true)}>Login / Sign Up</button>
          </div>
        </div>
      </nav>
      {/* Auth Modal */}
      {showAuthModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAuthModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={handleclose}>×</button>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Welcome to CitiSolve</h2>
              <div className={styles.tabContainer}>
                <button className={`${styles.tab} ${authMode === 'login' ? styles.tabActive : ''}`} onClick={() => setAuthMode('login')}>
                  Login
                  <img className={styles.signupimg} src='unicycle.png' alt="login" />
                </button>
                <button className={`${styles.tab} ${authMode === 'signup' ? styles.tabActive : ''}`} onClick={() => setAuthMode('signup')}>
                  Sign Up
                  <img className={styles.signupimg} src='circus-tent.png' alt="signup" />
                </button>
              </div>
            </div>
            <div className={styles.profilesections}>
              <button className={`${styles.profiles} ${detail === "citizen" ? styles.active : ""}`} onClick={(e) => {
                e.preventDefault();
                setdetail("citizen");
                setError('');
                setLocationState("");
                setLocationDistrict("");
                setLocationFetched(false);
              }}>
                <img src="/citizen.png" className={styles.profilesimg} alt="citizen" />
                citizen
              </button>
              <button className={`${styles.profiles} ${detail === "staff" ? styles.active : ""}`} onClick={(e) => {
                e.preventDefault();
                setdetail("staff");
                setError('');
                setLocationState("");
                setLocationDistrict("");
                setLocationFetched(false);
              }}>
                <img src="/staff.png" className={styles.profilesimg} alt="staff" />
                Staff
              </button>
              {authMode === 'login' && (
                <button className={`${styles.profiles} ${detail === "admin" ? styles.active : ""}`} onClick={(e) => {
                  e.preventDefault();
                  setdetail("admin");
                  setError('');
                }}>
                  <img src="/admin.png" className={styles.profilesimg} alt="admin" />
                  admin
                </button>
              )}
            </div>
            <form onSubmit={handleAuthSubmit} className={styles.formContainer}>
              {authMode === 'signup' && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Full Name</label>
                  <input type="text" name='fullname' className={styles.input} placeholder="Enter your name" disabled={otpSent} required />
                </div>
              )}
              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input type="email" name='email' className={styles.input} disabled={otpSent} placeholder="Enter your email" required />
              </div>
              {authMode === 'signup' && detail === 'staff' && (
                <div className={styles.formgroupright}>
                  <div className={styles.formgroup}>
                    <label htmlFor="complaint-category">Category *</label>
                    <select id="complaint-category" name="category" disabled={otpSent} required>
                      <option value="">Select a category</option>
                      <option value="roads">🛣️ Roads & Infrastructure</option>
                      <option value="water">💧 Water Supply</option>
                      <option value="power">💡 Power & Electricity</option>
                      <option value="sanitation">🗑️ Sanitation & Garbage</option>
                      <option value="other">📋 Other</option>
                    </select>
                    <span className={styles.formerror}>Please select a category</span>
                  </div>
                  
                  {!otpSent && (
                    <div className={styles.formGroup} style={{ marginBottom: '1rem' }}>
                      <button 
                        type="button" 
                        onClick={fetchLocation} 
                        disabled={fetchingLocation}
                        className={styles.submitBtn}
                        style={{
                          backgroundColor: locationFetched ? '#10b981' : '#667eea',
                          opacity: fetchingLocation ? 0.7 : 1,
                          cursor: fetchingLocation ? 'not-allowed' : 'pointer',
                          marginBottom: '1rem'
                        }}
                      >
                        {fetchingLocation ? (
                          <>
                            <div style={loaderStyles}></div>
                            <span style={{ marginLeft: '8px' }}>Fetching Location...</span>
                          </>
                        ) : locationFetched ? (
                          '✅ Location Fetched'
                        ) : (
                          '📍 Fetch Location (Required)'
                        )}
                      </button>
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label className={styles.label}>State</label>
                    <input 
                      type="text" 
                      name='state' 
                      value={locationState}
                      readOnly
                      placeholder="Auto-filled from location"
                      className={styles.input}
                      style={{
                        backgroundColor: '#f9fafb',
                        color: '#6b7280',
                        cursor: 'not-allowed'
                      }}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>District</label>
                    <input 
                      type="text" 
                      name='district' 
                      value={locationDistrict}
                      readOnly
                      placeholder="Auto-filled from location"
                      className={styles.input}
                      style={{
                        backgroundColor: '#f9fafb',
                        color: '#6b7280',
                        cursor: 'not-allowed'
                      }}
                    />
                    <p style={{
                      fontSize: '12px',
                      color: '#f59e0b',
                      marginTop: '8px',
                      fontStyle: 'italic',
                      textAlign: 'center',
                      backgroundColor: '#797770',
                    }}>
                      ⚠️ If the detected location is incorrect/failing, please report it to the administrator.
                    </p>
                  </div>
                </div>
              )}
              <div className={styles.formGroup}>
                <label className={styles.label}>Password</label>
                <input type="password" name='password' disabled={otpSent} className={styles.input} placeholder="Enter your password" required />
              </div>
              {error && (
                <div style={errorMessageStyles}>
                  {error}
                </div>
              )}
              {otpSent && (
                <>
                  <span className={styles.otpname}>Enter otp</span>
                  <label className={styles.contentxyz}>
                    {otp.map((data, i) => (
                      <input
                        type="text"
                        key={i}
                        value={data}
                        onChange={(e) => handleotpchange(e, i)}
                        onKeyDown={(e) => handlekeydown(e, i)}
                        maxLength="1"
                        name="otp"
                        required
                      />
                    ))}
                  </label>
                </>
              )}
              {!otpSent && (
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? (
                    <div style={loaderStyles}></div>
                  ) : (
                    "Get OTP ✉️"
                  )}
                </button>
              )}
              {otpSent && (
                <>
                  <button
                    type="button"
                    onClick={handleotp}
                    className={styles.submitBtn}
                    disabled={loading}
                  >
                    {loading ? (
                      <div style={loaderStyles}></div>
                    ) : (
                      authMode === 'login' ? 'Login 🚀' : 'Create Account 🚀'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={resendOTP}
                    className={styles.submitBtn}
                    disabled={loading}
                  >
                    {loading ? (
                      <div style={loaderStyles}></div>
                    ) : (
                      "Resend OTP ✉️"
                    )}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Your Voice for a <span className={styles.highlightText}>Better City</span>
            </h1>
            <p className={styles.heroSubtitle}>
              CitiSolve connects citizens with municipal services, making it easier than ever to report issues, track progress, and build stronger communities together.
            </p>
            <div className={styles.heroCta}>
              <button className={styles.primaryBtn} onClick={() => setShowAuthModal(true)}>Get Started Now</button>
            </div>
          </div>
          <div className={styles.heroImage}>
            <div className={styles.floatingCard}>
              <div className={styles.cardIcon}>🏛️</div>
              <h3 className={styles.cardTitle}>Smart City Solutions</h3>
              <p className={styles.cardText}>Empowering citizens, one complaint at a time</p>
            </div>
          </div>
        </div>
      </section>
      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          {stats.map((stat, i) => (
            <div key={i} className={styles.statCard}>
              <div className={styles.statNumber}>{stat.number}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
      {/* Features Section */}
      <section id="features" className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Why Choose CitiSolve?</h2>
          <p className={styles.sectionSubtitle}>Everything you need to make your city better, all in one place</p>
        </div>
        <div className={styles.featuresGrid}>
          {features.map((feature, i) => (
            <div key={i} className={`${styles.featureCard} ${activeFeature === i ? styles.featureCardActive : ''}`} onMouseEnter={() => setActiveFeature(i)}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
      {/* How It Works */}
      <section id="how-it-works" className={styles.howItWorksSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <p className={styles.sectionSubtitle}>Three simple steps to make a difference</p>
        </div>
        <div className={styles.stepsContainer}>
          {[{ num: "1", title: "Report", desc: "Submit your complaint with photos and location" },
            { num: "2", title: "Track", desc: "Monitor progress with real-time updates" },
            { num: "3", title: "Resolve", desc: "Get notified when your issue is resolved" }].map((step, i) => (
            <div key={i} className={styles.stepCard}>
              <div className={styles.stepNumber}>{step.num}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Make a Difference?</h2>
          <p className={styles.ctaSubtitle}>Join thousands of citizens working together to build better communities</p>
          <button className={styles.ctaButton} onClick={() => setShowAuthModal(true)}>Create Your Account</button>
        </div>
      </section>
      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>CitiSolve</div>
            <p className={styles.footerTagline}>Empowering citizens, transforming cities</p>
          </div>
          <div className={styles.footerLinks}>
            <div className={styles.footerColumn}>
              <h4 className={styles.footerColumnTitle}>Product</h4>
              <a href="#" className={styles.footerLink}>Features</a>
              <a href="#" className={styles.footerLink}>Pricing</a>
              <a href="#" className={styles.footerLink}>FAQ</a>
            </div>
            <div className={styles.footerColumn}>
              <h4 className={styles.footerColumnTitle}>Company</h4>
              <a href="#" className={styles.footerLink}>About Us</a>
              <a href="#" className={styles.footerLink}>Contact</a>
              <a href="#" className={styles.footerLink}>Careers</a>
            </div>
            <div className={styles.footerColumn}>
              <h4 className={styles.footerColumnTitle}>Legal</h4>
              <a href="#" className={styles.footerLink}>Privacy</a>
              <a href="#" className={styles.footerLink}>Terms</a>
              <a href="#" className={styles.footerLink}>Security</a>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2025 CitiSolve. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default CitiSolveLanding;