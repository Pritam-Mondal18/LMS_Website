import { useEffect } from 'react';

/**
 * A lightweight dynamic SEO management component that updates page headers,
 * title, meta description, and open graph properties to ensure the site is SEO friendly.
 */
export default function SEO({ title, description, keywords }) {
  useEffect(() => {
    const baseTitle = "Sumit Chakraborty Academy";
    const fullTitle = title ? `${title} | ${baseTitle}` : `${baseTitle} — Premium JEE, NEET & Science Courses`;
    const defaultDesc = "India's trusted online academy for JEE, NEET, Science & Commerce preparation. Live classes, test series, assignments & personal mentorship by expert faculty.";
    const fullDesc = description || defaultDesc;

    // 1. Update document title
    document.title = fullTitle;

    // 2. Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', fullDesc);

    // 3. Update meta keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', keywords);
    }

    // 4. Update Open Graph Properties
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', fullTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', fullDesc);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', window.location.href);

    // 5. Update Twitter Card Properties
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', fullTitle);

    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) twitterDesc.setAttribute('content', fullDesc);

  }, [title, description, keywords]);

  return null;
}
