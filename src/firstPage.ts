import { readFileSync } from 'fs';
import { pool } from './index';

export function currencyCodeToSymbol(currency_code: string): string {
  let currencySymbol = '₪';
  if (currency_code == 'USD') {
    currencySymbol = '$';
  } else if (currency_code == 'EUR') {
    currencySymbol = '€';
  }
  return currencySymbol;
}

export const financialStatus = async (): Promise<string> => {
  const monthTaxReport = '2020-03-01';

  let missingInvoiceDates = await pool.query(
    `
      select *
      from missing_invoice_dates($1)
      order by event_date;
    `,
    [`$$${monthTaxReport}$$`]
  );
  let missingInvoiceDatesHTMLTemplate = '';
  for (const transaction of missingInvoiceDates.rows) {
    missingInvoiceDatesHTMLTemplate = missingInvoiceDatesHTMLTemplate.concat(`
      <tr>
        <td>${transaction.event_date
          .toISOString()
          .replace(/T/, ' ')
          .replace(/\..+/, '')}</td>
        <td>${transaction.event_amount}${currencyCodeToSymbol(
      transaction.currency_code
    )}</td>
        <td>${transaction.financial_entity}</td>
        <td>${transaction.user_description}</td>
        <td>${transaction.tax_invoice_number}</td>
      </tr>
      `);
  }
  missingInvoiceDatesHTMLTemplate = `
      <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Entity</th>
                <th>Description</th>
                <th>Invoice Number</th>
            </tr>
        </thead>
        <tbody>
            ${missingInvoiceDatesHTMLTemplate}
        </tbody>
      </table>  
    `;

  let missingInvoiceNumbers = await pool.query(
    `
      select *
      from missing_invoice_numbers($1)
      order by event_date;
    `,
    [`$$${monthTaxReport}$$`]
  );
  let missingInvoiceNumbersHTMLTemplate = '';
  for (const transaction of missingInvoiceNumbers.rows) {
    missingInvoiceNumbersHTMLTemplate = missingInvoiceNumbersHTMLTemplate.concat(`
      <tr>
        <td>${transaction.event_date
          .toISOString()
          .replace(/T/, ' ')
          .replace(/\..+/, '')}</td>
        <td>${transaction.event_amount}${currencyCodeToSymbol(
      transaction.currency_code
    )}</td>
        <td>${transaction.financial_entity}</td>
        <td>${transaction.user_description}</td>
        <td>${transaction.tax_invoice_number}</td>
      </tr>
      `);
  }
  missingInvoiceNumbersHTMLTemplate = `
      <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Entity</th>
                <th>Description</th>
                <th>Invoice Number</th>
            </tr>
        </thead>
        <tbody>
            ${missingInvoiceNumbersHTMLTemplate}
        </tbody>
      </table>  
    `;

  const lastInvoiceNumbersQuery = readFileSync(
    'src/sql/lastInvoiceNumbers.sql'
  ).toString();
  let lastInvoiceNumbers = await pool.query(lastInvoiceNumbersQuery);
  let lastInvoiceNumbersHTMLTemplate = '';
  for (const transaction of lastInvoiceNumbers.rows) {
    lastInvoiceNumbersHTMLTemplate = lastInvoiceNumbersHTMLTemplate.concat(`
      <tr>
        <td>${transaction.tax_invoice_number}</td>
        <td>${transaction.event_date
          .toISOString()
          .replace(/T/, ' ')
          .replace(/\..+/, '')}</td>
        <td>${transaction.financial_entity}</td>
        <td>${transaction.user_description}</td>
        <td>${transaction.event_amount}</td>
      </tr>
      `);
  }
  lastInvoiceNumbersHTMLTemplate = `
      <table>
        <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Date</th>
              <th>Entity</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            ${lastInvoiceNumbersHTMLTemplate}
        </tbody>
      </table>  
    `;

  const currentVATStatusQuery = readFileSync(
    'src/sql/currentVATStatus.sql'
  ).toString();
  // second bonus is to try to move this into Top level await
  let currentVATStatus = await pool.query(currentVATStatusQuery);

  let VATTransactions = await pool.query(
    `
      select *
      from get_vat_for_month($1);
    `,
    [`$$${monthTaxReport}$$`]
  );
  let VATTransactionsString = '';
  for (const transaction of VATTransactions.rows) {
    VATTransactionsString = VATTransactionsString.concat(`
      <tr>
        <td>${transaction.overall_vat_status}</td>
        <td>${transaction.vat}</td>
        <td>${transaction.event_date
          .toISOString()
          .replace(/T/, ' ')
          .replace(/\..+/, '')}</td>
        <td>${transaction.event_amount}</td>
        <td>${transaction.financial_entity}</td>
        <td>${transaction.user_description}</td>
      </tr>
      `);
  }
  VATTransactionsString = `
      <table>
        <thead>
            <tr>
                <th>Overall VAT Status</th>
                <th>VAT</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Entity</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            ${VATTransactionsString}
        </tbody>
      </table>  
    `;

  const allTransactionsQuery = readFileSync(
    'src/sql/allTransactions.sql'
  ).toString();
  // second bonus is to try to move this into Top level await
  let allTransactions = await pool.query(allTransactionsQuery);

  let allTransactionsString = '';
  for (const transaction of allTransactions.rows) {
    allTransactionsString = allTransactionsString.concat(`
      <tr bank_reference=${transaction.bank_reference}
          account_number=${transaction.account_number}
          account_type=${transaction.account_type}
          currency_code=${transaction.currency_code}
          event_date=${transaction.event_date
            .toISOString()
            .replace(/T/, ' ')
            .replace(/\..+/, '')}
          event_amount=${transaction.event_amount}
          event_number=${transaction.event_number}>
        <td>${transaction.formatted_event_date}</td>
        <td>${transaction.event_amount}${currencyCodeToSymbol(
      transaction.currency_code
    )}</td>
        <td class="financial_entity" onClick='printElement(this, prompt("New financial entity:"));'>${
          transaction.financial_entity
        }</td>
        <td class="user_description" onClick='printElement(this, prompt("New user description:"));'>${
          transaction.user_description
        }</td>
        <td class="personal_category" onClick='printElement(this, prompt("New personal category:"));'>${
          transaction.personal_category
        }</td>
        <td>${transaction.vat}</td>
        <td>${transaction.account_number}${transaction.account_type}</td>
        <td>${transaction.tax_category}</td>
        <td>${transaction.tax_invoice_number}</td>
        <td>${transaction.bank_description}</td>
      </tr>
      `);
  }
  allTransactionsString = `
      <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Entity</th>
                <th>Description</th>
                <th>Category</th>
                <th>VAT</th>
                <th>Account</th>
                <th>Tax category</th>
                <th>Invoice Number</th>
                <th>Bank Description</th>
            </tr>
        </thead>
        <tbody>
            ${allTransactionsString}
        </tbody>
      </table>  
    `;

  return `
      <h1>Accounter</h1>

      <a href="/monthly-report">Monthly report</a>

      <a href="/private-charts">Private Charts</a>
  
      <h3>Missing invoice numbers for a month</h3>
  
      ${missingInvoiceNumbersHTMLTemplate}
  
      <h3>Missing invoice dates for a month</h3>
  
      ${missingInvoiceDatesHTMLTemplate}
  
      <h3>Last invoice numbers</h3>
  
      ${lastInvoiceNumbersHTMLTemplate}
  
      <h3>Current VAT balance</h3>
      
      <div> ₪${currentVATStatus.rows[0].vat_status} </div>
  
      <h3>VAT Transactions for this month:</h3>
  
      ${VATTransactionsString}
  
      <h3>All Transactions</h3>
  
      ${allTransactionsString}
  
      <script type="module" src="/browser.js"></script>
      <script type="module">
        import { printElement } from '/browser.js';
  
        window.printElement = printElement;
      </script>
    `;
};