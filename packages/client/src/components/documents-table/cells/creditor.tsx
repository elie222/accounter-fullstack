import { ReactElement, useCallback, useMemo } from 'react';
import { Indicator, NavLink } from '@mantine/core';
import { DocumentsTableCreditorFieldsFragmentDoc, DocumentType } from '../../../gql/graphql.js';
import { FragmentType, getFragmentData } from '../../../gql/index.js';
import { useUpdateDocument } from '../../../hooks/use-update-document.js';
import { useUrlQuery } from '../../../hooks/use-url-query.js';
import { getBusinessHref } from '../../charges/helpers.js';
import { ConfirmMiniButton } from '../../common/index.js';

// eslint-disable-next-line @typescript-eslint/no-unused-expressions -- used by codegen
/* GraphQL */ `
  fragment DocumentsTableCreditorFields on Document {
    id
    documentType
    ... on FinancialDocument {
      creditor {
        id
        name
      }
      debtor {
        id
      }
      missingInfoSuggestions {
        isIncome
        counterparty {
          id
          name
        }
        owner {
          id
          name
        }
      }
    }
  }
`;

type Props = {
  data: FragmentType<typeof DocumentsTableCreditorFieldsFragmentDoc>;
  refetchDocument: () => void;
};

export const Creditor = ({ data, refetchDocument }: Props): ReactElement => {
  const { get } = useUrlQuery();
  const document = getFragmentData(DocumentsTableCreditorFieldsFragmentDoc, data);
  const dbCreditor = 'creditor' in document ? document.creditor : undefined;

  const shouldHaveCreditor = ![DocumentType.Unprocessed, DocumentType.Other].includes(
    document.documentType as DocumentType,
  );
  const isError =
    (shouldHaveCreditor && !dbCreditor?.id) ||
    [DocumentType.Unprocessed].includes(document.documentType as DocumentType);

  const encodedFilters = get('chargesFilters');

  const getHref = useCallback(
    (businessId: string) => getBusinessHref(businessId, encodedFilters as string),
    [encodedFilters],
  );

  const suggestedCreditor = useMemo(() => {
    if (dbCreditor || !('missingInfoSuggestions' in document) || !document.missingInfoSuggestions) {
      // case when creditor is already set or no suggestions
      return undefined;
    }
    const suggestedOwner = document.missingInfoSuggestions.owner;
    const suggestedCounterparty = document.missingInfoSuggestions.counterparty;
    if (document.missingInfoSuggestions?.isIncome == null) {
      // case when we don't know if it's income or expense
      if (document.debtor?.id) {
        const debtorId = document.debtor.id;
        if (suggestedOwner?.id === debtorId && suggestedCounterparty) {
          // case when owner is debtor and we have counterparty
          return suggestedCounterparty;
        }
        if (suggestedCounterparty?.id === debtorId && suggestedOwner) {
          // case when counterparty is debtor and we have owner
          return suggestedOwner;
        }
      }
    } else if (document.missingInfoSuggestions.isIncome && suggestedOwner) {
      // case when it's income and we have owner
      return suggestedOwner;
    } else if (!document.missingInfoSuggestions.isIncome && suggestedCounterparty) {
      // case when it's expense and we have counterparty
      return suggestedCounterparty;
    }
    return undefined;
  }, [document, dbCreditor]);

  const hasAlternative = !dbCreditor && !!suggestedCreditor;

  const creditor = dbCreditor ?? suggestedCreditor;

  const { updateDocument, fetching } = useUpdateDocument();

  const updateCreditor = useCallback(
    (creditorId?: string) => {
      if (creditorId !== undefined) {
        updateDocument({
          documentId: document.id,
          fields: {
            creditorId,
          },
        }).then(refetchDocument);
      }
    },
    [document.id, updateDocument, refetchDocument],
  );

  const { name = 'Missing', id } = creditor || {};

  return (
    <td>
      <div className="flex flex-wrap">
        <div className="flex flex-col justify-center">
          <Indicator inline size={12} disabled={!isError} color="red" zIndex="auto">
            {shouldHaveCreditor &&
              (id ? (
                <a href={getHref(id)} target="_blank" rel="noreferrer">
                  <NavLink label={name} className="[&>*>.mantine-NavLink-label]:font-semibold" />
                </a>
              ) : (
                name
              ))}
            {isError && <p className="bg-yellow-400">{name}</p>}
          </Indicator>
        </div>
        {hasAlternative && (
          <ConfirmMiniButton
            onClick={(): void => updateCreditor(suggestedCreditor.id)}
            disabled={fetching}
          />
        )}
      </div>
    </td>
  );
};
