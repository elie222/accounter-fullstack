import { GraphQLError } from 'graphql';
import { FinancialEntitiesProvider } from '@modules/financial-entities/providers/financial-entities.provider.js';
import { IGetFinancialEntitiesByIdsResult } from '@modules/financial-entities/types.js';
import { LedgerProvider } from '@modules/ledger/providers/ledger.provider.js';
import { IGetLedgerRecordsByDatesResult } from '@modules/ledger/types.js';
import { DEFAULT_LOCAL_CURRENCY } from '@shared/constants';
import {
  ProfitAndLossReport,
  QueryProfitAndLossReportArgs,
  RequireFields,
  ResolverFn,
  ResolversParentTypes,
  ResolversTypes,
} from '@shared/gql-types';
import { formatFinancialAmount } from '@shared/helpers';
import {
  decorateLedgerRecords,
  getProfitLossReportAmounts,
} from '../../helpers/profit-and-loss.helper.js';

export const profitAndLossReport: ResolverFn<
  ReadonlyArray<ResolversTypes['ProfitAndLossReport']>,
  ResolversParentTypes['Query'],
  GraphQLModules.Context,
  RequireFields<QueryProfitAndLossReportArgs, 'years'>
> = async (_, { years }, { injector }) => {
  years.map(year => {
    if (year < 2000 || year > new Date().getFullYear()) {
      throw new GraphQLError('Invalid year');
    }
  });

  const from = new Date(Math.min(...years), 0, 1);
  const to = new Date(Math.max(...years) + 1, 0, 0);
  const ledgerRecords = await injector
    .get(LedgerProvider)
    .getLedgerRecordsByDates({ fromDate: from, toDate: to });

  const financialEntitiesIds = new Set(
    ledgerRecords
      .map(record => [
        record.credit_entity1,
        record.credit_entity2,
        record.debit_entity1,
        record.debit_entity2,
      ])
      .flat()
      .filter(Boolean) as string[],
  );
  const financialEntities = (await injector
    .get(FinancialEntitiesProvider)
    .getFinancialEntityByIdLoader.loadMany(Array.from(financialEntitiesIds))
    .then(res =>
      res.filter(entity => {
        if (!entity) {
          return false;
        }
        if (entity instanceof Error) {
          throw entity;
        }
        return true;
      }),
    )) as IGetFinancialEntitiesByIdsResult[];

  const financialEntitiesDict = new Map(financialEntities.map(entity => [entity.id, entity]));

  const ledgerByYear = new Map<number, IGetLedgerRecordsByDatesResult[]>(
    years.map(year => [year, []]),
  );

  ledgerRecords.map(record => {
    const year = record.invoice_date.getFullYear();
    ledgerByYear.get(year)?.push(record);
  });

  const yearlyReports: ProfitAndLossReport[] = [];
  for (const [year, ledgerRecords] of ledgerByYear) {
    const decoratedLedgerRecords = decorateLedgerRecords(ledgerRecords, financialEntitiesDict);

    const {
      revenueAmount,
      costOfSalesAmount,
      grossProfitAmount,
      researchAndDevelopmentExpensesAmount,
      marketingExpensesAmount,
      managementAndGeneralExpensesAmount,
      operatingProfitAmount,
      financialExpensesAmount,
      otherIncomeAmount,
      profitBeforeTaxAmount,
    } = getProfitLossReportAmounts(decoratedLedgerRecords);

    // 999: profitBeforeTaxAmount

    // הוצאות מימון (שערוכים, שערי המרה) 990 למעט to pay / to collect

    // רווח לפני מיסים (דלתא)

    // מיסים
    // 3 סוגי התאמות:
    // מתנות - אף פעם לא מוכר
    // קנסות
    // מחקר ופיתוח: פער זמני, נפרש על פני 3 שנים
    // דוחות נסיעה

    // רווח שנתי נטו

    //   untaxable expenses:
    //     gifts over 190 ILS per gift
    //     fines
    //     a portion of the salary expenses of Uri&Dotan - a report from accounting
    //     R&D expenses - spread over 3 years

    yearlyReports.push({
      year,
      revenue: formatFinancialAmount(revenueAmount, DEFAULT_LOCAL_CURRENCY),
      costOfSales: formatFinancialAmount(costOfSalesAmount, DEFAULT_LOCAL_CURRENCY),
      grossProfit: formatFinancialAmount(grossProfitAmount, DEFAULT_LOCAL_CURRENCY),
      researchAndDevelopmentExpenses: formatFinancialAmount(
        researchAndDevelopmentExpensesAmount,
        DEFAULT_LOCAL_CURRENCY,
      ),
      marketingExpenses: formatFinancialAmount(marketingExpensesAmount, DEFAULT_LOCAL_CURRENCY),
      managementAndGeneralExpenses: formatFinancialAmount(
        managementAndGeneralExpensesAmount,
        DEFAULT_LOCAL_CURRENCY,
      ),
      operatingProfit: formatFinancialAmount(operatingProfitAmount, DEFAULT_LOCAL_CURRENCY),
      financialExpenses: formatFinancialAmount(financialExpensesAmount, DEFAULT_LOCAL_CURRENCY),
      otherIncome: formatFinancialAmount(otherIncomeAmount, DEFAULT_LOCAL_CURRENCY),
      profitBeforeTax: formatFinancialAmount(profitBeforeTaxAmount, DEFAULT_LOCAL_CURRENCY),
      tax: formatFinancialAmount(0, DEFAULT_LOCAL_CURRENCY),
      netProfit: formatFinancialAmount(0, DEFAULT_LOCAL_CURRENCY),
    });
  }

  return yearlyReports.sort((a, b) => a.year - b.year);
};
