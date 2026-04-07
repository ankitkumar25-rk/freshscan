import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ScanSearch, History, Home, Leaf } from 'lucide-react';
import './Navbar.css';

const navLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/scan', label: 'Scan', icon: ScanSearch },
  { to: '/history', label: 'History', icon: History },
];

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        {/* Brand */}
        <Link to="/" className="navbar__brand">
          <div className="navbar__logo">
            <Leaf size={20} />
          </div>
          <span className="navbar__brand-name">
            Fresh<span className="gradient-text">Scan</span>
          </span>
        </Link>

        {/* Links */}
        <ul className="navbar__links">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                className={`navbar__link ${location.pathname === to ? 'navbar__link--active' : ''}`}
              >
                <Icon size={16} />
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link to="/scan" className="btn btn-primary navbar__cta">
          <ScanSearch size={16} />
          Scan Now
        </Link>
      </div>
    </nav>
  );
}
