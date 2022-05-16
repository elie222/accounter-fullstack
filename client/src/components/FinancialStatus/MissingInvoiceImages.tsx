import { FC, useEffect, useState } from 'react';
import { currencyCodeToSymbol } from '../../helpers/currency';
import { useSql } from '../../hooks/useSql';
import { MissingInvoice } from '../../models/types';

export const MissingInvoiceImages: FC<{ monthTaxReport: string }> = ({
  monthTaxReport,
}) => {
  const { getMissingInvoiceImages } = useSql();
  const [missingInvoiceImages, setMissingInvoiceImages] = useState<
    MissingInvoice[]
  >([]);

  useEffect(() => {
    getMissingInvoiceImages(monthTaxReport).then(setMissingInvoiceImages);
  }, []);

  return (
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
        {missingInvoiceImages.map((row, i) => (
          <tr key={i}>
            <td>
              {new Date(row.event_date)
                .toISOString()
                .replace(/T/, ' ')
                .replace(/\..+/, '')}
            </td>
            <td>
              {row.event_amount}${currencyCodeToSymbol(row.currency_code)}
            </td>
            <td>{row.financial_entity}</td>
            <td>{row.user_description}</td>
            <td>{row.tax_invoice_number}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};