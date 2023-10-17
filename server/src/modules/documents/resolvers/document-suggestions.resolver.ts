// import { FinancialEntitiesProvider } from '@modules/financial-entities/providers/financial-entities.provider.js';
// import { TagsProvider } from '@modules/tags/providers/tags.provider.js';
// import { TransactionsProvider } from '@modules/transactions/providers/transactions.provider.js';
import { ChargesProvider } from '@modules/charges/providers/charges.provider.js';
import {
  InvoiceReceiptResolvers,
  InvoiceResolvers,
  Maybe,
  ReceiptResolvers,
  Resolver,
  ResolversParentTypes,
  ResolversTypes,
} from '@shared/gql-types';
import { formatCurrency, formatFinancialAmount } from '@shared/helpers';
import type { DocumentSuggestionsProto } from '@shared/types';
// import { formatAmount, formatFinancialAmount } from '@shared/helpers';
import type { DocumentsModule } from '../types.js';

type Suggestion = Awaited<ResolversTypes['DocumentSuggestions']>;

const missingInfoSuggestions: Resolver<
  Maybe<Suggestion>,
  | ResolversParentTypes['Invoice']
  | ResolversParentTypes['Receipt']
  | ResolversParentTypes['InvoiceReceipt'],
  GraphQLModules.Context
> = async (RawDocument, _, { injector }) => {
  const response: DocumentSuggestionsProto = {};
  if (RawDocument.charge_id_new) {
    const charge = await injector
      .get(ChargesProvider)
      .getChargeByIdLoader.load(RawDocument.charge_id_new);
    if (charge?.business_id) {
      response.counterpartyId = charge.business_id;
    }
    if (charge?.owner_id) {
      response.ownerId = charge.owner_id;
    }
    if (charge?.transactions_event_amount) {
      const amount = Number(charge.transactions_event_amount);
      if (!Number.isNaN(amount)) {
        response.isIncome = Number(charge.transactions_event_amount) > 0;
      }
    }
    if (charge?.transactions_event_amount && charge?.transactions_currency) {
      // use transactions info, if exists
      response.amount = {
        amount: charge.transactions_event_amount,
        currency: formatCurrency(charge.transactions_currency),
      };
    } else if (charge?.documents_event_amount && charge?.documents_currency) {
      // Use parallel documents (if exists) as documents_event_amount is based on invoices OR receipts
      response.amount = {
        amount: String(charge.documents_event_amount),
        currency: formatCurrency(charge.documents_currency),
      };
    }
  }

  return response;
};

export const documentSuggestionsResolvers: DocumentsModule.Resolvers = {
  Invoice: {
    missingInfoSuggestions: missingInfoSuggestions as InvoiceResolvers['missingInfoSuggestions'],
  },
  Receipt: {
    missingInfoSuggestions: missingInfoSuggestions as ReceiptResolvers['missingInfoSuggestions'],
  },
  InvoiceReceipt: {
    missingInfoSuggestions:
      missingInfoSuggestions as InvoiceReceiptResolvers['missingInfoSuggestions'],
  },
  Proforma: {
    missingInfoSuggestions:
      missingInfoSuggestions as InvoiceReceiptResolvers['missingInfoSuggestions'],
  },
  DocumentSuggestions: {
    counterparty: suggestion => suggestion.counterpartyId ?? null,
    owner: suggestion => suggestion.ownerId ?? null,
    amount: suggestion =>
      suggestion.amount
        ? formatFinancialAmount(suggestion.amount.amount, suggestion.amount.currency)
        : null,
    isIncome: suggestion => (suggestion.isIncome == null ? null : suggestion.isIncome),
  },
};