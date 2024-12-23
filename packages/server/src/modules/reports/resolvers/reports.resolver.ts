import { format } from 'date-fns';
import { BusinessesProvider } from '@modules/financial-entities/providers/businesses.provider.js';
import { FinancialEntitiesProvider } from '@modules/financial-entities/providers/financial-entities.provider.js';
import { DEFAULT_LOCAL_CURRENCY } from '@shared/constants';
import {
  dateToTimelessDateString,
  formatFinancialAmount,
  formatFinancialIntAmount,
  optionalDateToTimelessDateString,
} from '@shared/helpers';
import { generatePcnFromCharges } from '../helpers/pcn.helper.js';
import type { RawVatReportRecord } from '../helpers/vat-report.helper.js';
import type { ReportsModule } from '../types.js';
import { getVatRecords } from './get-vat-records.resolver.js';
import {
  corporateTaxRulingComplianceReport,
  corporateTaxRulingComplianceReportDifferences,
} from './reports/corporate-tax-ruling-compliance-report.js';
import {
  profitAndLossReport,
  profitAndLossReportYearMapper,
  reportCommentaryRecordMapper,
  reportCommentarySubRecordMapper,
} from './reports/profit-and-loss-report.resolver.js';
import { taxReport, taxReportYearMapper } from './reports/tax-report.js';

export const reportsResolvers: ReportsModule.Resolvers = {
  Query: {
    vatReport: getVatRecords,
    pcnFile: async (_, { fromDate, toDate, financialEntityId }, context, __) => {
      const financialEntity = await context.injector
        .get(BusinessesProvider)
        .getBusinessByIdLoader.load(financialEntityId);
      if (!financialEntity?.vat_number) {
        throw new Error(`Financial entity ${financialEntityId} has no VAT number`);
      }
      const vatRecords = await getVatRecords(
        _,
        { filters: { fromDate, toDate, financialEntityId } },
        context,
        __,
      );
      const reportMonth = format(new Date(fromDate), 'yyyyMM');
      return generatePcnFromCharges(
        [
          ...(vatRecords.income as RawVatReportRecord[]),
          ...(vatRecords.expenses as RawVatReportRecord[]),
        ],
        financialEntity.vat_number,
        reportMonth,
      );
    },
    profitAndLossReport,
    taxReport,
    corporateTaxRulingComplianceReport,
  },
  VatReportRecord: {
    documentId: raw => raw.documentId,
    chargeAccountantStatus: raw => raw.chargeAccountantStatus,
    chargeId: raw => raw.chargeId,
    amount: raw => formatFinancialAmount(raw.documentAmount, raw.currencyCode),
    business: (raw, _, { injector }) =>
      raw.businessId
        ? injector
            .get(FinancialEntitiesProvider)
            .getFinancialEntityByIdLoader.load(raw.businessId)
            .then(res => res ?? null)
        : null,
    chargeDate: raw => dateToTimelessDateString(raw.chargeDate),
    documentDate: raw => optionalDateToTimelessDateString(raw.documentDate),
    documentSerial: raw => raw.documentSerial,
    image: raw => raw.documentUrl,
    localAmount: raw =>
      raw.eventLocalAmount
        ? formatFinancialAmount(raw.eventLocalAmount, DEFAULT_LOCAL_CURRENCY)
        : null,
    localVatAfterDeduction: raw =>
      raw.localVatAfterDeduction
        ? formatFinancialAmount(raw.localVatAfterDeduction, DEFAULT_LOCAL_CURRENCY)
        : null,
    roundedLocalVatAfterDeduction: raw =>
      raw.roundedVATToAdd
        ? formatFinancialIntAmount(raw.roundedVATToAdd, DEFAULT_LOCAL_CURRENCY)
        : null,
    taxReducedLocalAmount: raw =>
      raw.localAmountBeforeVAT
        ? formatFinancialIntAmount(raw.localAmountBeforeVAT, DEFAULT_LOCAL_CURRENCY)
        : null,
    taxReducedForeignAmount: raw =>
      raw.foreignAmountBeforeVAT
        ? formatFinancialIntAmount(raw.foreignAmountBeforeVAT, raw.currencyCode)
        : null,
    localVat: raw =>
      raw.localVat ? formatFinancialAmount(raw.localVat, DEFAULT_LOCAL_CURRENCY) : null,
    foreignVat: raw =>
      raw.foreignVat ? formatFinancialAmount(raw.foreignVat, raw.currencyCode) : null,
    foreignVatAfterDeduction: raw =>
      raw.foreignVatAfterDeduction
        ? formatFinancialAmount(raw.foreignVatAfterDeduction, raw.currencyCode)
        : null,
    vatNumber: (raw, _, { injector }) =>
      raw.businessId
        ? injector
            .get(BusinessesProvider)
            .getBusinessByIdLoader.load(raw.businessId)
            .then(entity => entity?.vat_number ?? null)
        : null,
  },
  CorporateTaxRulingComplianceReport: {
    id: report => report.id,
    year: report => report.year,
    totalIncome: report => report.totalIncome,
    businessTripRndExpenses: report => report.businessTripRndExpenses,
    foreignDevelopmentExpenses: report => report.foreignDevelopmentExpenses,
    foreignDevelopmentRelativeToRnd: report => report.foreignDevelopmentRelativeToRnd,
    localDevelopmentExpenses: report => report.localDevelopmentExpenses,
    localDevelopmentRelativeToRnd: report => report.localDevelopmentRelativeToRnd,
    researchAndDevelopmentExpenses: report => report.researchAndDevelopmentExpenses,
    rndRelativeToIncome: report => report.rndRelativeToIncome,
    differences: corporateTaxRulingComplianceReportDifferences,
  },
  ProfitAndLossReportYear: profitAndLossReportYearMapper,
  TaxReportYear: taxReportYearMapper,
  ReportCommentaryRecord: reportCommentaryRecordMapper,
  ReportCommentarySubRecord: reportCommentarySubRecordMapper,
};
