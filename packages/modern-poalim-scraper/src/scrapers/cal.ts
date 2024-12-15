import { Frame, Page } from 'puppeteer';
import { subYears } from 'date-fns';
import { waitUntil } from '../helpers/waiting.js';
import type { CalGetCardTransactionsDetailsResponse, CalTransaction } from './types/cal/get-card-transactions-details.js';
import { fetchPostWithinPage } from '../utils/fetch.js';

const LOGIN_URL = 'https://www.cal-online.co.il/';
const TRANSACTIONS_REQUEST_ENDPOINT = 'https://api.cal-online.co.il/Transactions/api/transactionsDetails/getCardTransactionsDetails';

const last4DigitsToCardIds: Record<string, string> = {}; // last4Digits -> cardId

function getCardId(last4Digits: string) {
  return last4DigitsToCardIds[last4Digits];
}

export async function cal(page: Page, credentials: CalCredentials, options: CalOptions = {}) {
  await login(credentials, page);

  const authToken = await getAuthorizationHeader(page);
  const xSiteId = await getXSiteId();

  const cards = await getCards(page);
  for (const card of cards) {
    last4DigitsToCardIds[card.last4Digits] = card.cardUniqueId;
  }

  return {
    getMonthTransactions: async (last4Digits: string, month: Date) => {
      const cardId = getCardId(last4Digits);
      if (!cardId) 
        throw new Error(`Card ID not found for last 4 digits: ${last4Digits}`);
      return fetchMonthCompletedTransactions(
        page,
        cardId,
        authToken,
        xSiteId,
        month
      );
    },
    getTransactions: async () => {
      return fetchTransactions(page, options, authToken, xSiteId);
    },
  }
}

async function login(credentials: CalCredentials, page: Page) {
  await page.goto(LOGIN_URL);
  
  // Wait for and click the login button
  await page.waitForSelector('#ccLoginDesktopBtn', { visible: true });
  await page.click('#ccLoginDesktopBtn');
  
  // Get the login frame using the proper frame detection
  const frame = await getLoginFrame(page);

  await sleep(1000);
  
  // Switch to regular login tab
  await waitUntilElementFound(frame, '#regular-login');
  await frame.click('#regular-login');
  await waitUntilElementFound(frame, 'regular-login'); // Wait for tab to be active
  
  await sleep(1000);

  // Fill login form within the frame
  await waitUntilElementFound(frame, '[formcontrolname="userName"]');
  await frame.type('[formcontrolname="userName"]', credentials.username);
  await frame.type('[formcontrolname="password"]', credentials.password);

  await sleep(1000);
  
  // Submit the form
  await waitUntilElementFound(frame, 'button[type="submit"]');
  await sleep(500);
  await frame.click('button[type="submit"]');

  console.debug('Clicked sign in');

  await sleep(1000);
  
  // Handle post-login scenarios
  try {
    // Wait for navigation
    await Promise.race([
      page.waitForNavigation(),
      page.waitForSelector('button.btn-close'),
    ]);

    console.debug('Navigated');

    await sleep(1000);
    
    // Check if we're on the tutorial page and close it if needed
    const currentUrl = page.url();
    console.log("🚀 ~ login ~ currentUrl:", currentUrl)
    if (currentUrl.endsWith('site-tutorial')) {
      console.debug('Found tutorial page');
      await page.click('button.btn-close');
    }
    
    // Check for password change requirement
    const passwordChangeForm = await page.$('form[name="changePasswordForm"]');
    if (passwordChangeForm) {
      throw new Error('Password change required');
    }
  } catch (e) {
    if (e instanceof Error && e.message === 'Password change required') {
      throw e;
    }
    
    // Check if we successfully reached the dashboard
    const currentUrl = page.url();
    if (!currentUrl.includes('dashboard')) {
      throw new Error('Login failed');
    }
  }
}

async function fetchTransactions(page: Page, options: CalOptions = {}, authToken: string, xSiteId: string) {
  const startDate = options.startDate || subYears(new Date(), 1);
  const cards = await getCards(page);
  console.debug(`Found ${cards.length} cards`);
  console.debug(cards.map((c) => c.last4Digits).join(', '));

  const transactions: CalTransaction[] = [];

  for (const card of cards) {
    try {
      console.debug(`Fetching completed transactions for card ${card.last4Digits}`);
      const completedTxns = await fetchCompletedTransactions(page, card.cardUniqueId, authToken, xSiteId, startDate);
      console.debug(`Found ${completedTxns.length} completed transactions`);
      transactions.push(...completedTxns);
    } catch (error) {
      console.error(`Failed to fetch completed transactions: ${card.last4Digits} ${error}`);
    }
  }

  console.debug(`Found ${transactions.length} transactions in total`);
  console.debug(transactions);

  return transactions;
}

async function fetchCompletedTransactions(
  page: Page, 
  cardId: string, 
  authToken: string, 
  xSiteId: string,
  startDate: Date,
) {
  console.debug("fetchCompletedTransactions", { cardId, startDate });

  const endDate = new Date();
  
  const transactions: CalTransaction[] = [];
  const currentDate = new Date(endDate);

  while (currentDate >= startDate) {
    const monthTransactions = await fetchMonthCompletedTransactions(
      page,
      cardId,
      authToken,
      xSiteId,
      currentDate
    );

    console.debug("Found transactions for month", {
      month: currentDate.getMonth(),
      year: currentDate.getFullYear(),
      transactions: monthTransactions.length,
    });
    
    transactions.push(...monthTransactions);
    currentDate.setMonth(currentDate.getMonth() - 1);
  }

  return transactions;
}

async function fetchMonthCompletedTransactions(
  page: Page,
  cardId: string,
  authToken: string,
  xSiteId: string,
  date: Date
): Promise<CalTransaction[]> {
  const response = await fetchPostWithinPage<CalGetCardTransactionsDetailsResponse>(
    page,
    TRANSACTIONS_REQUEST_ENDPOINT,
    { 
      cardUniqueId: cardId,
      month: (date.getMonth() + 1).toString(),
      year: date.getFullYear().toString()
    },
    {
      Authorization: authToken,
      'X-Site-Id': xSiteId,
      'Content-Type': 'application/json',
    }
  );

  if (response?.statusCode === 1) {
    const bankAccounts = response.result?.bankAccounts || [];
    const regularDebitDays = bankAccounts.flatMap((accounts) => accounts.debitDates);
    const immediateDebitDays = bankAccounts.flatMap((accounts) => accounts.immidiateDebits.debitDays);
    return [...regularDebitDays, ...immediateDebitDays].flatMap((debitDate) => debitDate.transactions);
  }
  
  console.error(`Failed to fetch completed transactions: ${response?.statusDescription || 'Unknown error'}`);
  return [];
}

async function getLoginFrame(page: Page) {
  let frame: Frame | null = null;
  console.debug('wait until login frame found');
  await waitUntil(() => {
    // find iframe with src: https://connect.cal-online.co.il/index.html
    const frames = page.frames();
    frame = frames.find((f) => f.url().includes('connect')) || null;
    return Promise.resolve(!!frame);
  }, 'wait for iframe with login form', 10_000, 1000);

  if (!frame) {
    console.debug('failed to find login frame for 10 seconds');
    throw new Error('failed to extract login iframe');
  }

  return frame as Frame;
}

async function getCards(page: Page) {
  const initData = await waitUntil(
    () => getFromSessionStorage<{
      result: {
        cards: {
          cardUniqueId: string;
          last4Digits: string;
          [key: string]: unknown;
        }[];
      };
    }>(page, 'init'),
    'get init data in session storage',
    10_000,
    1000,
  );
  if (!initData) {
    throw new Error('could not find \'init\' data in session storage');
  }
  return initData?.result.cards.map(({ cardUniqueId, last4Digits }) => ({ cardUniqueId, last4Digits }));
}

async function getFromSessionStorage<T>(page: Page, key: string): Promise<T | null> {
  const strData = await page.evaluate((k: string) => {
    return sessionStorage.getItem(k);
  }, key);

  if (!strData) return null;

  return JSON.parse(strData) as T;
}

async function getAuthorizationHeader(page: Page) {
  const authModule = await getFromSessionStorage<{ auth: { calConnectToken: string } }>(page, 'auth-module');
  if (!authModule) {
    throw new Error('could not find \'auth-module\' in session storage');
  }
  return `CALAuthScheme ${authModule.auth.calConnectToken}`;
}

async function waitUntilElementFound(page: Page | Frame, elementSelector: string, onlyVisible = false, timeout = 10_000) {
  await page.waitForSelector(elementSelector, { visible: onlyVisible, timeout });
}

async function getXSiteId() {
  /*
    I don't know if the constant below will change in the feature.
    If so, use the next code:

    return this.page.evaluate(() => new Ut().xSiteId);

    To get the classname search for 'xSiteId' in the page source
    class Ut {
      constructor(_e, on, yn) {
          this.store = _e,
          this.config = on,
          this.eventBusService = yn,
          this.xSiteId = "09031987-273E-2311-906C-8AF85B17C8D9",
  */
  return Promise.resolve('09031987-273E-2311-906C-8AF85B17C8D9');
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class CalCredentials {
  username: string = '';
  password: string = '';
  last4Digits: string = '';
}

export class CalOptions {
  startDate?: Date;
}