// themeConfig of the site's own theme (config.mts → useData().theme)
export interface NavItem {
  text: string;
  link: string;
  /** a regular expression on the page path; without it the link is active on its own path */
  activeMatch?: string;
}

export interface SiteTheme {
  siteTitle: string;
  logo: { light: string; dark: string; alt: string };
  nav: NavItem[];
  footer: { message: string; copyright: string };
}
