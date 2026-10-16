import { useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { LangProvider, LANGS, DEFAULT_LANG } from './i18n';
import { FavoritesProvider } from './components/FavoritesProvider';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Projects from './pages/Projects';
import About from './pages/About';
import Agencies from './pages/Agencies';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import Magazine from './pages/Magazine';
import FacadeDesign from './pages/FacadeDesign';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

function savedLang() {
  try {
    const v = localStorage.getItem('nemachin_lang');
    return LANGS.includes(v) ? v : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

function RootRedirect() {
  return <Navigate to={`/${savedLang()}`} replace />;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Shell() {
  const { lang } = useParams();
  if (!LANGS.includes(lang)) {
    return <Navigate to={`/${savedLang()}`} replace />;
  }
  return (
    <LangProvider lang={lang}>
      <ScrollToTop />
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </LangProvider>
  );
}

export default function App() {
  return (
    <FavoritesProvider>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/:lang" element={<Shell />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:code" element={<ProductDetail />} />
          <Route path="projects" element={<Projects />} />
          <Route path="about" element={<About />} />
          <Route path="agencies" element={<Agencies />} />
          <Route path="articles" element={<Articles />} />
          <Route path="articles/:slug" element={<ArticleDetail />} />
          <Route path="magazine" element={<Magazine />} />
          <Route path="facade-design" element={<FacadeDesign />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="*" element={<Navigate to={`/${DEFAULT_LANG}`} replace />} />
      </Routes>
    </FavoritesProvider>
  );
}
