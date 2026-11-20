import './App.css';
import { BrowserRouter } from 'react-router-dom';
import Header from './components/Header';
import Main from './components/Main';

function App() {
  return (
    <BrowserRouter>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Header />
      <Main />
    </BrowserRouter>
  );
}

export default App;
