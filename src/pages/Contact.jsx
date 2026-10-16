import { useI18n, useDocumentMeta } from '../i18n';
import { COMPANY } from '../data/company';
import Reveal from '../components/Reveal';
import InquiryForm from '../components/InquiryForm';
import {
  ClockIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
} from '../components/Icons';

export default function Contact() {
  const { t } = useI18n();
  useDocumentMeta(t('meta.contact.title'), t('meta.contact.desc'));

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="kicker">{t('brand.tag')}</p>
          <h1>{t('contactPage.title')}</h1>
          <p>{t('contactPage.sub')}</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '3rem' }}>
        <div className="container contact-grid">
          {/* Info */}
          <Reveal>
            <h2 className="title-md" style={{ marginBottom: '1.4rem' }}>
              {t('contactPage.infoTitle')}
            </h2>
            <div className="contact-info">
              <div className="contact-info__item">
                <span className="contact-info__icon">
                  <PhoneIcon size={20} />
                </span>
                <div>
                  <h3>{t('contactBlock.phone')}</h3>
                  <p>
                    <a className="ltr" href={COMPANY.phoneHref}>
                      {COMPANY.phone}
                    </a>
                  </p>
                </div>
              </div>
              <div className="contact-info__item">
                <span className="contact-info__icon">
                  <MailIcon size={20} />
                </span>
                <div>
                  <h3>{t('contactBlock.email')}</h3>
                  <p>
                    <a className="ltr" href={COMPANY.emailHref}>
                      {COMPANY.email}
                    </a>
                  </p>
                </div>
              </div>
              <div className="contact-info__item">
                <span className="contact-info__icon">
                  <PinIcon size={20} />
                </span>
                <div>
                  <h3>{t('contactBlock.address')}</h3>
                  <p>{t('contactBlock.addressValue')}</p>
                </div>
              </div>
              <div className="contact-info__item">
                <span className="contact-info__icon">
                  <ClockIcon size={20} />
                </span>
                <div>
                  <h3>{t('contactPage.hoursLabel')}</h3>
                  <p>{t('contactPage.hoursValue')}</p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Form */}
          <Reveal delay={0.12}>
            <div
              style={{
                background: '#fff',
                borderRadius: 'var(--radius-lg)',
                padding: 'clamp(1.4rem, 3vw, 2.4rem)',
                border: '1px solid var(--line)',
              }}
            >
              <h2 className="title-md" style={{ marginBottom: '1.4rem' }}>
                {t('contactPage.formTitle')}
              </h2>
              <InquiryForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
