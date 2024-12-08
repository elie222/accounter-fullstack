import puppeteer from 'puppeteer';
import {
  amex,
  AmexCredentials,
  AmexOptions,
  cal,
  CalCredentials,
  CalOptions,
  hapoalim,
  HapoalimCredentials,
  HapoalimOptions,
  isracard,
  IsracardCredentials,
  IsracardOptions,
} from './scrapers/scrapers-index.js';
import { newPage } from './utils/browser-util.js';

export async function init(headless = true) {
  /* this initiates browser and returns every scraper as function */
  /* each scraper opens its own page                              */
  const browser = await puppeteer.launch({ headless });

  return {
    hapoalim: async (credentials: HapoalimCredentials, options?: HapoalimOptions) => {
      //return hapoalim.init
      const page = await newPage(browser);
      return hapoalim(page, credentials, options);
    },
    isracard: async (credentials: IsracardCredentials, options?: IsracardOptions) => {
      //return isracard.init
      const page = await newPage(browser);
      return isracard(page, credentials, options);
    },
    amex: async (credentials: AmexCredentials, options?: AmexOptions) => {
      //return isracard.init
      const page = await newPage(browser);
      return amex(page, credentials, options);
    },
    cal: async (credentials: CalCredentials, options?: CalOptions) => {
      //return cal.init
      const page = await newPage(browser);
      return cal(page, credentials, options);
    },
    close: () => {
      return browser.close();
    },
  };
}
