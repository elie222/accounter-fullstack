import { GraphQLError } from 'graphql';
import type { IGetChargesByIdsResult } from '@modules/charges/types';
import { ExchangeProvider } from '@modules/exchange-rates/providers/exchange.provider.js';
import { FinancialAccountsProvider } from '@modules/financial-accounts/providers/financial-accounts.provider.js';
import { TaxCategoriesProvider } from '@modules/financial-entities/providers/tax-categories.provider.js';
import type { IGetTransactionsByChargeIdsResult } from '@modules/transactions/types';
import {
  DEFAULT_LOCAL_CURRENCY,
  ETANA_BUSINESS_ID,
  ETHERSCAN_BUSINESS_ID,
  FEE_CATEGORY_NAME,
  KRAKEN_BUSINESS_ID,
  POALIM_BUSINESS_ID,
} from '@shared/constants';
import type { CounterAccountProto, LedgerProto } from '@shared/types';
import {
  getTaxCategoryNameByAccountCurrency,
  validateTransactionBasicVariables,
} from './utils.helper.js';

export function splitFeeTransactions(transactions: Array<IGetTransactionsByChargeIdsResult>) {
  const feeTransactions = [];
  const mainTransactions = [];
  for (const transaction of transactions) {
    if (transaction.is_fee) {
      // TODO: ugly workaround to set swift as fee
      feeTransactions.push(transaction);
    } else {
      mainTransactions.push(transaction);
    }
  }
  return { feeTransactions, mainTransactions };
}

export function isSupplementalFeeTransaction(
  transaction: IGetTransactionsByChargeIdsResult,
): boolean {
  if (!transaction.is_fee) {
    return false;
  }
  if (!transaction.business_id) {
    throw new Error(
      `Transaction ID="${transaction.id}" is missing business_id, which is required to figure if fee is supplemental`,
    );
  }

  // TODO: improve this raw implementation
  const supplementalFeeBusinesses: string[] = [
    // TODO: improve this logic
    ETHERSCAN_BUSINESS_ID,
    ETANA_BUSINESS_ID,
    KRAKEN_BUSINESS_ID,
    POALIM_BUSINESS_ID,
  ];
  if (supplementalFeeBusinesses.includes(transaction.business_id)) {
    return true;
  }

  const fundamentalFeeBusinesses: string[] = [
    'a62a631b-54b2-4bc1-bd61-6672c3c5d45a', // swift
  ];
  if (fundamentalFeeBusinesses.includes(transaction.business_id)) {
    return false;
  }
  throw new Error(
    `Unable to determine if business ID="${transaction.business_id}" is supplemental or fundamental fee`,
  );
}

export async function getEntriesFromFeeTransaction(
  transaction: IGetTransactionsByChargeIdsResult,
  charge: IGetChargesByIdsResult,
  context: GraphQLModules.Context,
): Promise<Array<LedgerProto>> {
  const { injector } = context;
  const ledgerEntries: Array<LedgerProto> = [];

  if (!transaction.is_fee) {
    throw new GraphQLError(
      `Who did a non-fee transaction marked as fee? (Transaction ID="${transaction.id}")`,
    );
  }

  const isSupplementalFee = isSupplementalFeeTransaction(transaction);
  const { currency, valueDate, transactionBusinessId } =
    validateTransactionBasicVariables(transaction);

  let amount = Number(transaction.amount);
  let foreignAmount: number | undefined = undefined;

  if (currency !== DEFAULT_LOCAL_CURRENCY) {
    // get exchange rate for currency
    const exchangeRate = await injector
      .get(ExchangeProvider)
      .getExchangeRates(currency, DEFAULT_LOCAL_CURRENCY, valueDate);

    foreignAmount = amount;
    // calculate amounts in ILS
    amount = exchangeRate * amount;
  }

  const feeTaxCategory = await injector
    .get(TaxCategoriesProvider)
    .taxCategoryByNamesLoader.load(FEE_CATEGORY_NAME);
  if (!feeTaxCategory) {
    throw new GraphQLError(`Tax category "${FEE_CATEGORY_NAME}" not found`);
  }

  const isCreditorCounterparty = amount > 0;

  let mainAccount: CounterAccountProto = transactionBusinessId;

  const partialLedgerEntry: LedgerProto = {
    id: transaction.id,
    invoiceDate: transaction.event_date,
    valueDate,
    currency,
    creditAmount1: foreignAmount ? Math.abs(foreignAmount) : undefined,
    localCurrencyCreditAmount1: Math.abs(amount),
    debitAmount1: foreignAmount ? Math.abs(foreignAmount) : undefined,
    localCurrencyDebitAmount1: Math.abs(amount),
    description: transaction.source_description ?? undefined,
    reference1: transaction.source_id,
    isCreditorCounterparty: isSupplementalFee ? isCreditorCounterparty : !isCreditorCounterparty,
    ownerId: charge.owner_id,
    currencyRate: transaction.currency_rate ? Number(transaction.currency_rate) : undefined,
    chargeId: transaction.charge_id,
  };

  if (isSupplementalFee) {
    const account = await injector
      .get(FinancialAccountsProvider)
      .getFinancialAccountByAccountIDLoader.load(transaction.account_id);
    if (!account) {
      throw new GraphQLError(`Transaction ID="${transaction.id}" is missing account`);
    }
    const taxCategoryName = getTaxCategoryNameByAccountCurrency(account, currency);
    const businessTaxCategory = await injector
      .get(TaxCategoriesProvider)
      .taxCategoryByNamesLoader.load(taxCategoryName);
    if (!businessTaxCategory) {
      throw new GraphQLError(`Account ID="${account.id}" is missing tax category`);
    }

    mainAccount = businessTaxCategory;
  } else {
    const mainBusiness = charge.business_id ?? undefined;

    const ledgerEntry: LedgerProto = {
      ...partialLedgerEntry,
      creditAccountID1: isCreditorCounterparty ? mainAccount : mainBusiness,
      debitAccountID1: isCreditorCounterparty ? mainBusiness : mainAccount,
    };

    ledgerEntries.push(ledgerEntry);
  }

  const ledgerEntry: LedgerProto = {
    ...partialLedgerEntry,
    creditAccountID1: isCreditorCounterparty ? feeTaxCategory : mainAccount,
    debitAccountID1: isCreditorCounterparty ? mainAccount : feeTaxCategory,
  };

  ledgerEntries.push(ledgerEntry);

  return ledgerEntries;
}
