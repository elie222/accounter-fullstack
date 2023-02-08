import { Dispatch, SetStateAction, useState } from 'react';
import { ActionIcon } from '@mantine/core';
import { CaretDown, CaretUp } from 'tabler-icons-react';
import { FragmentType, getFragmentData } from '../../../gql';
import {
  EditChargeFieldsFragmentDoc,
  VarReportMissingInfoFieldsFragmentDoc,
} from '../../../gql/graphql';
import { AllChargesTable } from '../../all-charges/all-charges-table';

/* GraphQL */ `
  fragment VarReportMissingInfoFields on VatReportResult {
    missingInfo {
      id
      # ...ChargesFields
      ...AllChargesAccountFields
      ...AllChargesAccountantApprovalFields
      ...AllChargesAmountFields
      ...AllChargesDateFields
      ...AllChargesDescriptionFields
      ...AllChargesEntityFields
      ...AllChargesTagsFields
      ...AllChargesShareWithFields
      ...AllChargesVatFields
      ...EditChargeFields
      ...SuggestedCharge
      ...ChargeExtendedInfoFields

      # next are some fields for the temp columns:
      ledgerRecords {
        id
      }
      additionalDocuments {
        id
      }
      counterparty {
        name
      }
      ###
    }
}
`;

interface Props {
  data?: FragmentType<typeof VarReportMissingInfoFieldsFragmentDoc>;
  setEditCharge: Dispatch<
    SetStateAction<FragmentType<typeof EditChargeFieldsFragmentDoc> | undefined>
  >;
  setInsertLedger: React.Dispatch<React.SetStateAction<string | undefined>>;
  setInsertDocument: React.Dispatch<React.SetStateAction<string | undefined>>;
  setUploadDocument: React.Dispatch<React.SetStateAction<string | undefined>>;
  setMatchDocuments: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export const MissingInfoTable = ({
  data,
  setEditCharge,
  setInsertLedger,
  setInsertDocument,
  setUploadDocument,
  setMatchDocuments,
}: Props) => {
  const chargesData = getFragmentData(VarReportMissingInfoFieldsFragmentDoc, data);
  const [isOpened, setOpened] = useState(true);

  return (
    <>
      <span className="text-lg font-semibold whitespace-nowrap flex flex-row gap-4">
        <ActionIcon variant="default" onClick={() => setOpened(i => !i)} size={30}>
          {isOpened ? <CaretUp size={20} /> : <CaretDown size={20} />}
        </ActionIcon>
        Missing Info
      </span>
      {isOpened && chargesData && (
        <AllChargesTable
          setEditCharge={setEditCharge}
          setInsertLedger={setInsertLedger}
          setInsertDocument={setInsertDocument}
          setMatchDocuments={setMatchDocuments}
          setUploadDocument={setUploadDocument}
          data={chargesData.missingInfo}
          isAllOpened={false}
        />
      )}
    </>
  );
};