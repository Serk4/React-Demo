import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Enterprise CI/CD Pipeline</h1>
        <p className="hero-subtitle">
          Professional React Full-Stack Application demonstrating enterprise DevOps practices
        </p>
      </div>

      <div className="deployment-info">
        <h3>🌐 Deployment Architecture</h3>
        <p>
          This application demonstrates professional Preview → Production workflow. 
          Every code change triggers automated testing and preview deployment, 
          followed by manual promotion to production after quality verification.
        </p>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <h3>🚀 CI/CD Pipeline</h3>
          <p>Automated testing, security scanning, and dual deployment with Preview → Production workflow</p>
        </div>
        
        <div className="feature-card">
          <h3>🏗️ Microservices</h3>
          <p>Independent frontend and backend deployments with stable URL coordination</p>
        </div>
        
        <div className="feature-card">
          <h3>🧪 Testing Suite</h3>
          <p>28 comprehensive API tests covering CRUD operations and integration scenarios</p>
        </div>
        
        <div className="feature-card">
          <h3>🗄️ Database Migration</h3>
          <p>Professional SQL Server → MySQL migration with smart fallback system</p>
        </div>
      </div>

      <div className="tech-stack">
        <h2>Technology Stack</h2>
        <div className="tech-badges">
          <span className="tech-badge react">React 19</span>
          <span className="tech-badge typescript">TypeScript</span>
          <span className="tech-badge nodejs">Node.js</span>
          <span className="tech-badge mysql">MySQL</span>
          <span className="tech-badge vite">Vite</span>
          <span className="tech-badge vercel">Vercel</span>
        </div>
      </div>

      <div className="cta-section">
        <h2>Explore the Application</h2>
        <div className="cta-buttons">
          <Link to="/users" className="btn-primary">
            View User Management
          </Link>
          <a 
            href="https://github.com/Serk4/React-Demo" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            💻 View Source Code
          </a>
        </div>
      </div>
    </div>
  );
}
