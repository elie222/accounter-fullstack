import { gql } from 'graphql-modules';

// eslint-disable-next-line import/no-default-export
export default gql`
  extend type Query {
    businessTransactionsSumFromLedgerRecords(
      filters: BusinessTransactionsFilter
    ): BusinessTransactionsSumFromLedgerRecordsResult!
    businessTransactionsFromLedgerRecords(
      filters: BusinessTransactionsFilter
    ): BusinessTransactionsFromLedgerRecordsResult!
    businessNamesFromLedgerRecords: [String!]!
  }

  " input variables for businessTransactions "
  input BusinessTransactionsFilter {
    businessNames: [String!]
    financialEntityIds: [ID!]
    fromDate: TimelessDate
    toDate: TimelessDate
  }

  " result type for businessTransactionsSumFromLedgerRecords "
  union BusinessTransactionsSumFromLedgerRecordsResult =
      BusinessTransactionsSumFromLedgerRecordsSuccessfulResult
    | CommonError

  " result type for businessTransactionsSumFromLedgerRecords" # eslint-disable-next-line @graphql-eslint/strict-id-in-types -- no current solution for this
  type BusinessTransactionsSumFromLedgerRecordsSuccessfulResult {
    businessTransactionsSum: [BusinessTransactionSum!]!
  }

  " single business transaction summery " # eslint-disable-next-line @graphql-eslint/strict-id-in-types -- no current solution for this
  type BusinessTransactionSum {
    businessName: String!
    credit: FinancialAmount!
    debit: FinancialAmount!
    total: FinancialAmount!
    eurSum: ForeignCurrencySum
    gbpSum: ForeignCurrencySum
    usdSum: ForeignCurrencySum
  }

  " summary of foreign currency business transactions " # eslint-disable-next-line @graphql-eslint/strict-id-in-types -- no current solution for this
  type ForeignCurrencySum {
    credit: FinancialAmount!
    debit: FinancialAmount!
    total: FinancialAmount!
  }

  " result type for businessTransactionsFromLedgerRecords "
  union BusinessTransactionsFromLedgerRecordsResult =
      BusinessTransactionsFromLedgerRecordsSuccessfulResult
    | CommonError

  " result type for businessTransactionsFromLedgerRecords" # eslint-disable-next-line @graphql-eslint/strict-id-in-types -- no current solution for this
  type BusinessTransactionsFromLedgerRecordsSuccessfulResult {
    businessTransactions: [BusinessTransaction!]!
  }

  " single business transaction info " # eslint-disable-next-line @graphql-eslint/strict-id-in-types -- no current solution for this
  type BusinessTransaction {
    amount: FinancialAmount!
    businessName: String!
    eurAmount: FinancialAmount
    gbpAmount: FinancialAmount
    usdAmount: FinancialAmount
    invoiceDate: TimelessDate!
    reference1: String
    reference2: String
    details: String
    counterAccount: String
  }
`;
