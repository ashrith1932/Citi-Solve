/**
 * PageLoader — a full-screen centred spinner that matches the
 * background colour of the destination portal.
 *
 * Usage:
 *   <PageLoader theme="admin" />   → dark  #0a0a0a, grey ring
 *   <PageLoader theme="staff" />   → light #e8f4f8, blue ring
 *   <PageLoader theme="citizen" /> → warm  #fefae0, golden ring
 */

const THEMES = {
  admin: {
    background: '#0a0a0a',
    ring: 'rgba(255,255,255,0.12)',
    accent: '#888',
  },
  staff: {
    background: 'linear-gradient(135deg, #e8f4f8 0%, #d4e7f0 100%)',
    ring: 'rgba(74,144,226,0.2)',
    accent: '#4a90e2',
  },
  citizen: {
    background: 'linear-gradient(135deg, #fefae0 0%, #f4e8c1 100%)',
    ring: 'rgba(221,161,94,0.25)',
    accent: '#bc6c25',
  },
};

const PageLoader = ({ theme = 'citizen' }) => {
  const t = THEMES[theme] || THEMES.citizen;

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    background: t.background,
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999,
  };

  const spinnerStyle = {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    border: `5px solid ${t.ring}`,
    borderTopColor: t.accent,
    animation: 'pageLoaderSpin 0.75s linear infinite',
  };

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes pageLoaderSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={spinnerStyle} />
    </div>
  );
};

export default PageLoader;
