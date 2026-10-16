import { useI18n } from '../i18n';
import { COMPANY } from '../data/company';
import Reveal from './Reveal';
import { ArrowRight, KeyIcon } from './Icons';

/* Compact call-to-action band before the footer */
export default function CtaSection() {
  const { t } = useI18n();
  return (
    <section className="section cta-band">
      <div className="container">
        <Reveal className="cta-band__inner">
          <div className="cta-band__icon" aria-hidden="true">
            <KeyIcon size={38} />
          </div>
          <div className="cta-band__text">
            <h2>{t('cta.title')}</h2>
            <p>{t('cta.sub')}</p>
          </div>
          <a className="btn btn--primary" href={COMPANY.phoneHref}>
            {t('cta.btn')}
            <ArrowRight size={16} className="icon-flip" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
