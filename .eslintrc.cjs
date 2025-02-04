const { dirname } = require('node:path');

const MODULES_PATH = 'packages/server/src/modules/*/typeDefs/*.graphql.ts';
const OPERATIONS_PATH = 'packages/client/src/**/*.{,c,m}{j,t}s{,x}';

module.exports = {
  extends: ['@theguild'],
  rules: {
    'no-console': 1,
  },
  parserOptions: {
    project: ['tsconfig.json', '*/tsconfig.json'],
  },
  overrides: [
    {
      // Setup GraphQL Parser
      files: '**/*.{graphql,gql}',
      parser: '@graphql-eslint/eslint-plugin',
      plugins: ['@graphql-eslint'],
      parserOptions: {
        graphQLConfig: {
          schema: MODULES_PATH,
          documents: OPERATIONS_PATH,
        },
      },
    },
    {
      // Setup processor for code-files
      files: [OPERATIONS_PATH, MODULES_PATH],
      processor: '@graphql-eslint/graphql',
    },
    {
      // Setup recommended config for schema file
      files: `${dirname(MODULES_PATH)}/**/*.{graphql,gql}`,
      extends: 'plugin:@graphql-eslint/schema-recommended',
      rules: {
        '@graphql-eslint/description-style': ['error', { style: 'inline' }],
        '@graphql-eslint/strict-id-in-types': [
          'error',
          {
            acceptedIdTypes: ['ID', 'UUID'],
            exceptions: {
              types: [
                'AccountantApproval',
                'BusinessTripSummary',
                'BusinessTripSummaryRow',
                'ChargeMetadata',
                'ChargeSuggestions',
                'ChargesWithLedgerChangesResult',
                'CommonError',
                'ConversionRate',
                'DateRange',
                'DocumentSuggestions',
                'ExchangeRates',
                'FinancialAmount',
                'FinancialIntAmount',
                'FlagForeignFeeTransactionsResult',
                'GeneratedLedgerRecords',
                'IncomeExpenseChart',
                'IncomeExpenseChartMonthData',
                'Ledger',
                'LedgerBalanceInfo',
                'LedgerBalanceUnbalancedEntity',
                'LedgerValidation',
                'MergeChargeSuccessfulResult',
                'MergeChargesByTransactionReferenceResult',
                'PageInfo',
                'PaginatedCharges',
                'PaginatedBusinesses',
                'PaginatedFinancialEntities',
                'PCNFileResult',
                'PCNRawData',
                'SicknessDays',
                'SortCode',
                'Suggestions',
                'ReportCommentary',
                'ReportCommentaryRecord',
                'ReportCommentarySubRecord',
                'TransactionSuggestions',
                'UncategorizedTransaction',
                'UpdateChargeSuccessfulResult',
                'VatReportResult',
                'VatReportRecord',
                'VacationDays',
                'ValidationData',
                'YearOfRelevance',
              ],
            },
          },
        ],
      },
    },
    {
      // Setup recommended config for operations files
      files: `${dirname(OPERATIONS_PATH)}/**/*.{graphql,gql}`,
      extends: 'plugin:@graphql-eslint/operations-recommended',
      rules: {
        '@graphql-eslint/unique-operation-name': 'error',
        '@graphql-eslint/unique-fragment-name': 'error',
        '@graphql-eslint/known-directives': [
          'warn',
          { ignoreClientDirectives: ['@defer', '@stream'] },
        ],
      },
    },
    {
      files: OPERATIONS_PATH,
      extends: '@theguild/eslint-config/react',
      env: {
        browser: true,
      },
    },
    {
      files: 'server/**',
      env: {
        node: true,
      },
    },
  ],
  ignorePatterns: [
    'packages/old-accounter/**',
    '**/__generated__/**',
    'schema.graphql',
    '**/__tests__/**',
    '.eslintrc.cjs',
    '.*rc.*js',
    '.bob/',
    '**/tsup.config.ts',
  ],
};
