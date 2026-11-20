const specials = [
  {
    name: 'Greek salad', price: '$12.99', image: '/images/greek salad.jpg',
    alt: 'Greek salad with tomatoes, cucumber, olives and feta',
    description: 'The famous greek salad of crispy lettuce, peppers, olives and our Chicago style feta cheese, garnished with crunchy garlic and rosemary croutons.',
  },
  {
    name: 'Bruschetta', price: '$5.99', image: '/images/bruchetta.svg',
    alt: 'Toasted bruschetta topped with fresh tomatoes and herbs',
    description: 'Our Bruschetta is made from grilled bread that has been smeared with garlic and seasoned with salt and olive oil.',
  },
  {
    name: 'Lemon Dessert', price: '$5.00', image: '/images/lemon dessert.jpg',
    alt: 'Slice of lemon layer cake',
    description: "This comes straight from grandma’s recipe book, every last ingredient has been sourced and is as authentic as can be imagined.",
  },
];

function SpecialCard({ dish }) {
  return (
    <article className="special-card">
      <img className="dish-image" src={dish.image} alt={dish.alt} width="428" height="285" />
      <div className="card-body">
        <div className="dish-heading"><h3>{dish.name}</h3><span className="price">{dish.price}</span></div>
        <p>{dish.description}</p>
        <a className="delivery-link" href="/order-online">Order a delivery <img src="/images/Dish icon.svg" alt="" width="18" height="18" /></a>
      </div>
    </article>
  );
}

export default function Specials() {
  return (
    <section className="container specials" id="menu" aria-labelledby="specials-heading">
      <div className="section-heading"><h2 id="specials-heading">This weeks specials!</h2><a className="button" href="/menu">Online Menu</a></div>
      <div className="specials-grid">{specials.map(dish => <SpecialCard key={dish.name} dish={dish} />)}</div>
    </section>
  );
}
