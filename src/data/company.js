/* Company-wide contact constants (Latin script preserved across languages) */
export const COMPANY = {
  phone: '031-35493001-6',
  phoneHref: 'tel:+983135493001',
  email: 'info@nemachin-brick.com',
  emailHref: 'mailto:info@nemachin-brick.com',
};

/* Pexels image helper — high-quality architectural photography */
export const px = (id, w = 1600) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export const IMG = {
  hero: px(7031407, 1920),
  aboutMain: px(7587470),
  aboutSecondary: px(17428945),
  aboutStory: px(8143683),
  facadeHero: px(32666364),
  facadeSecondary: px(17158806),
  brands: {
    instagram: null,
  },
};
