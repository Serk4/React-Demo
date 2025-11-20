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
          This application demonstrates a simplified, production-ready CI/CD pipeline. 
          Every code change goes through automated testing, security scanning, and quality gates 
          before deploying to a unified full-stack environment.
        </p>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <h3>🚀 Enterprise CI/CD</h3>
          <p>Feature branch development, automated testing, pull request workflow, and production deployment with branch protection rules</p>
        </div>
        
        <div className="feature-card">
          <h3>🏗️ Unified Architecture</h3>
          <p>Single Vercel deployment serving both frontend and backend with intelligent in-memory database fallback</p>
        </div>
        
        <div className="feature-card">
          <h3>🧪 Comprehensive Testing</h3>
          <p>33 automated tests covering API endpoints, integration scenarios, and user management with quality gate enforcement</p>
        </div>
        
        <div className="feature-card">
          <h3>🎯 Demo-Friendly Design</h3>
          <p>Smart user limits with educational messaging, shared demo environment, and automatic reset capabilities</p>
        </div>
      </div>

      <div className="tech-stack">
        <h2>Enterprise Best Practices Demonstrated</h2>
        <div className="practices-grid">
          <div className="practice-item">
            <strong>🌿 Feature Branch Development</strong>
            <span>Isolated development with branch protection</span>
          </div>
          <div className="practice-item">
            <strong>🔄 Pull Request Workflow</strong>
            <span>Code review and automated quality checks</span>
          </div>
          <div className="practice-item">
            <strong>🧪 Test-Driven Quality</strong>
            <span>Required status checks before merge</span>
          </div>
          <div className="practice-item">
            <strong>🚀 Automated Deployment</strong>
            <span>Clean merge strategies with production rollout</span>
          </div>
          <div className="practice-item">
            <strong>🧹 Repository Hygiene</strong>
            <span>Squash merges and branch cleanup</span>
          </div>
          <div className="practice-item">
            <strong>📊 Demo Engineering</strong>
            <span>User-friendly limits and educational messaging</span>
          </div>
        </div>
      </div>

      <div className="tech-stack">
        <h2>Technology Stack</h2>
        <div className="tech-badges">
          <span className="tech-badge react">React 19</span>
          <span className="tech-badge typescript">TypeScript</span>
          <span className="tech-badge nodejs">Node.js</span>
          <span className="tech-badge mysql">MySQL Fallback</span>
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
