import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface SEOProps {
  title?: string;
  description?: string;
  name?: string;
  type?: string;
}

const SEO: React.FC<SEOProps> = ({ title, description, name = 'Petflik', type = 'website' }) => {
  const { t, i18n } = useTranslation();

  const seoTitle = title || t('seo.title');
  const seoDescription = description || t('seo.description');
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://petflik.com';

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <html lang={i18n.language} />

      {/* Facebook tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:url" content={currentUrl} />

      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
    </Helmet>
  );
};

export default SEO;

