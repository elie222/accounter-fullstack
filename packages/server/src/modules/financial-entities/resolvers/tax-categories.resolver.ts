import { GraphQLError } from 'graphql';
import { TaxCategoriesProvider } from '../providers/tax-categories.provider.js';
import type { FinancialEntitiesModule } from '../types.js';
import { commonTaxChargeFields } from './common.js';

export const taxCategoriesResolvers: FinancialEntitiesModule.Resolvers = {
  Query: {
    taxCategories: async (_parent, _args, { injector }) => {
      return injector
        .get(TaxCategoriesProvider)
        .getAllTaxCategories()
        .then(res => res.filter(c => !!c.name));
    },
    taxCategoryByBusinessId: async (_, args, { injector }) => {
      const { businessId, ownerId } = args;
      return injector
        .get(TaxCategoriesProvider)
        .taxCategoryByBusinessAndOwnerIDsLoader.load({ businessId, ownerId })
        .then(res => res ?? null);
    },
  },
  CommonCharge: commonTaxChargeFields,
  FinancialCharge: commonTaxChargeFields,
  ConversionCharge: commonTaxChargeFields,
  SalaryCharge: commonTaxChargeFields,
  InternalTransferCharge: commonTaxChargeFields,
  DividendCharge: commonTaxChargeFields,
  BusinessTripCharge: commonTaxChargeFields,
  MonthlyVatCharge: commonTaxChargeFields,
  BankDepositCharge: commonTaxChargeFields,
  CreditcardBankCharge: commonTaxChargeFields,
  LtdFinancialEntity: {
    taxCategory: async (parent, _, { injector, adminContext: { defaultAdminBusinessId } }) => {
      const taxCategory = await injector
        .get(TaxCategoriesProvider)
        .taxCategoryByBusinessAndOwnerIDsLoader.load({
          businessId: parent.id,
          ownerId: defaultAdminBusinessId,
        });
      if (!taxCategory) {
        throw new GraphQLError(`Tax category for business ID="${parent.id}" not found`);
      }
      return taxCategory;
    },
  },
};
