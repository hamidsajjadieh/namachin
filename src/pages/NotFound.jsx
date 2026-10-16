import { Link } from 'react-router-dom';
import { useI18n, to } from '../i18n';
import { ArrowRight } from '../components/Icons';

export default function NotFound() {
  const { t, lang } = useI18n();
  return (
    <div className="container notfound">
      <div>
        <p className="notfound__code ltr">404</p>
        <h1>{t('notFound.title')}</h1>
        <p>{t('notFound.sub')}</p>
        <Link className="btn btn--primary" to={to('', lang)}>
          {t('notFound.cta')}
          <ArrowRight size={16} className="icon-flip" />
        </Link>
      </div>
    </div>
  );
}
