import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useI18n, useDocumentMeta, to } from '../i18n';
import { COMPANY } from '../data/company';
import { dimLabel, getProduct, similarProducts } from '../data/products';

import Gallery from '../components/Gallery';
import Breadcrumb from '../components/Breadcrumb';
import ProductCard, { FavBtn } from '../components/ProductCard';
import InquiryForm from '../components/InquiryForm';
import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';
import NotFound from './NotFound';
import {
  CheckIcon,
  ClockIcon,
  MailIcon,
  PhoneIcon,
  SupportIcon,
} from '../components/Icons';

export default function ProductDetail() {
  const { code } = useParams();
  const { t, tr, fmt, lang } = useI18n();
  const product = getProduct(code);

  useDocumentMeta(
    product ? `${tr(product.name)} | ${t('brand.name')}` : t('meta.products.title'),
    product ? tr(product.description) : t('meta.products.desc')
  );

  useEffect(() => {
    document.body.classList.add('has-sticky-callout');
    return () => document.body.classList.remove('has-sticky-callout');
  }, []);

  if (!product) return <NotFound />;

  const name = tr(product.name);

  return (
    <>
      <Breadcrumb
        items={[
          { label: t('nav.home'), to: to('', lang) },
          { label: t('nav.products'), to: to('/products', lang) },
          { label: name },
        ]}
      />

      <div className="container" style={{ paddingBottom: '1rem' }}>
        <div className="detail-grid">
          <Gallery images={product.images} alt={name} />

          <div>
            <p className="kicker">{t(`groups.${product.group}`)}</p>
            <h1 className="title-lg" style={{ marginTop: '0.6rem' }}>
              {name}
            </h1>
            <p className="product-card__code ltr" style={{ marginTop: '0.4rem' }}>
              {product.code}
            </p>

            <div className="detail-price">
              <strong>{fmt(product.price)}</strong>
              <span>{t('detail.perM2')}</span>
            </div>

            <div className="detail-actions">
              <FavBtn variant="inline" code={product.code} name={name} />
              <a className="btn btn--primary" href={COMPANY.phoneHref}>
                <PhoneIcon size={16} />
                {t('projectsPage.callForPrice')}
              </a>
            </div>

            <h2 className="detail-section-title" style={{ fontSize: '1.15rem' }}>
              {t('detail.specsTitle')}
            </h2>
            <dl className="spec-table">
              <div>
                <dt>{t('specs.dimensions')}</dt>
                <dd>
                  <span className="ltr">{dimLabel(product.dims)} mm</span>
                </dd>
              </div>
              <div>
                <dt>{t('specs.color')}</dt>
                <dd>{t(`colors.${product.color}`)}</dd>
              </div>
              <div>
                <dt>{t('specs.group')}</dt>
                <dd>{t(`groups.${product.group}`)}</dd>
              </div>
              <div>
                <dt>{t('specs.strength')}</dt>
                <dd>
                  <span className="ltr">{fmt(product.strength)} MPa</span>
                </dd>
              </div>
              <div>
                <dt>{t('specs.perPackage')}</dt>
                <dd>{fmt(product.perPackage)}</dd>
              </div>
              <div>
                <dt>{t('specs.absorption')}</dt>
                <dd>
                  <span className="ltr">{fmt(product.absorption)}%</span>
                </dd>
              </div>
              <div>
                <dt>{t('specs.frost')}</dt>
                <dd>{product.frost ? t('specs.frostYes') : t('specs.frostNo')}</dd>
              </div>
            </dl>

            <h2 className="detail-section-title" style={{ fontSize: '1.15rem' }}>
              {t('detail.descTitle')}
            </h2>
            <p className="detail-desc">{tr(product.description)}</p>

            <h2 className="detail-section-title" style={{ fontSize: '1.15rem' }}>
              {t('detail.featuresTitle')}
            </h2>
            <ul className="detail-features">
              {product.features.map((f) => (
                <li key={f}>
                  <CheckIcon size={15} />
                  {t(`features.${f}`)}
                </li>
              ))}
            </ul>

            <h2 className="detail-section-title" style={{ fontSize: '1.15rem' }}>
              {t('detail.agentTitle')}
            </h2>
            <div className="agent-box">
              <p className="agent-box__head">
                <SupportIcon size={18} />
                {t('detail.agentName')}
              </p>
              <ul>
                <li>
                  <PhoneIcon size={14} />
                  <a className="ltr" href={COMPANY.phoneHref}>
                    {COMPANY.phone}
                  </a>
                </li>
                <li>
                  <MailIcon size={14} />
                  <a className="ltr" href={COMPANY.emailHref}>
                    {COMPANY.email}
                  </a>
                </li>
                <li>
                  <ClockIcon size={14} />
                  {t('contactPage.hoursValue')}
                </li>
              </ul>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-3)' }}>
                {t('detail.agentRole')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Inquiry ---------- */}
      <section className="section section--tint" id="inquiry">
        <div className="container" style={{ maxWidth: '820px' }}>
          <SectionHeading
            align="center"
            label={t('cta.btn')}
            title={t('detail.inquiryTitle')}
            sub={t('detail.inquiryDesc')}
          />
          <Reveal>
            <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: 'clamp(1.4rem, 3vw, 2.4rem)', border: '1px solid var(--line)' }}>
              <InquiryForm productCode={product.code} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Similar products ---------- */}
      <section className="section">
        <div className="container">
          <SectionHeading title={t('detail.similarTitle')} />
          <div className="results-grid">
            {similarProducts(product).map((p) => (
              <ProductCard key={p.code} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Mobile sticky callout ---------- */}
      <div className="sticky-callout">
        <a className="btn btn--primary" href={COMPANY.phoneHref}>
          {t('detail.stickyCall')}
        </a>
        <a className="btn btn--outline" href="#inquiry">
          {t('detail.stickyRequest')}
        </a>
      </div>

    </>
  );
}
