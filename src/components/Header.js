import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" to="/" aria-label="Little Lemon home">
          <img src="/images/Logo.svg" alt="Little Lemon" width="148" height="40" />
        </Link>
        <nav className="site-nav" aria-label="Main navigation">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><a href="/#about">About</a></li>
            <li><a href="/#menu">Menu</a></li>
            <li><Link to="/booking">Reservations</Link></li>
            <li><a href="/#menu">Order Online</a></li>
            <li><a href="/login">Login</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
