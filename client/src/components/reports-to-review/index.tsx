import { useSearchParams } from 'react-router-dom';
import { parseMonth, parseYear } from '../../helpers';
import { LastInvoiceNumbers } from '../financial-status/last-invoice-numbers';
import { ReportToReview } from './report-to-review';

export const ReportsToReview = () => {
  const [searchParams] = useSearchParams();

  const month = searchParams.get('month');
  const year = searchParams.get('year');

  const parsedMonth = month ? parseMonth(month) : '10';
  const parsedYear = year ? parseYear(year) : '2020';

  const reportMonthToReview = `${parsedYear}-${parsedMonth}-01`;
  console.log('reportMonthToReview', reportMonthToReview);

  const currrentCompany = searchParams.get('company') ?? 'Software Products Guilda Ltd.';
  console.log('currrentCompany', currrentCompany);

  // TODO: complete missing parts
  return (
    <>
      {/* {taxReportHTML.monthTaxHTMLTemplate} */}
      <br />
      {/* {taxReportHTML.overallMonthTaxHTMLTemplate} */}
      <br />
      {/* {taxReportHTML.monthVATReportHTMLTemplate} */}
      <br />
      Left transactions:
      {/* {taxReportHTML.leftMonthVATReportHTMLTemplate} */}
      <br />
      {/* {taxReportHTML.overallVATHTMLTemplate} */}
      <br />
      <h3>Last invoice numbers</h3>
      <LastInvoiceNumbers />
      <h1>Report to review</h1>
      <ReportToReview reportMonthToReview={reportMonthToReview} currrentCompany={currrentCompany} />
    </>
  );
};