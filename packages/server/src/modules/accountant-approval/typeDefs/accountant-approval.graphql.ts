import { gql } from 'graphql-modules';

// eslint-disable-next-line import/no-default-export
export default gql`
  extend type Mutation {
    toggleChargeAccountantApproval(chargeId: UUID!, approved: Boolean!): Boolean!
      @auth(role: ACCOUNTANT)
  }

  " info regarding the accountant approval process "
  type AccountantApproval {
    approved: Boolean!
    remark: String
  }

  " input variables for updateCharge.AccountantApproval"
  input AccountantApprovalInput {
    approved: Boolean!
    remark: String
  }

  extend interface Charge {
    " calculated based on ledger record and transaction approvals "
    accountantApproval: AccountantApproval!
  }

  extend type CommonCharge {
    accountantApproval: AccountantApproval!
  }

  extend type ConversionCharge {
    accountantApproval: AccountantApproval!
  }

  extend type SalaryCharge {
    accountantApproval: AccountantApproval!
  }

  extend type InternalTransferCharge {
    accountantApproval: AccountantApproval!
  }

  extend type DividendCharge {
    accountantApproval: AccountantApproval!
  }

  extend type BusinessTripCharge {
    accountantApproval: AccountantApproval!
  }

  extend type MonthlyVatCharge {
    accountantApproval: AccountantApproval!
  }

  extend input UpdateChargeInput {
    accountantApproval: AccountantApprovalInput
  }
`;
