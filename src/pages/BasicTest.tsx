export default function BasicTest() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'red', 
      padding: '20px',
      color: 'white',
      fontSize: '24px'
    }}>
      <h1>BASIC TEST - If you see this, React is working!</h1>
      <p>Time: {new Date().toISOString()}</p>
      <p>This page has no dependencies - just pure React</p>
    </div>
  );
}