import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="hero" id="about" aria-labelledby="hero-heading">
      <div className="container hero-grid">
        <div className="hero-copy">
          <h1 id="hero-heading" tabIndex="-1">Little Lemon</h1>
          <h2>Chicago</h2>
          <p>We are a family owned Mediterranean restaurant, focused on traditional recipes served with a modern twist.</p>
          <Link className="button" to="/booking">Reserve a Table</Link>
        </div>
        <img className="hero-image" src="/images/restauranfood.jpg" alt="Chef serving Mediterranean appetizers" width="375" height="400" />
      </div>
    </section>
  );
}
