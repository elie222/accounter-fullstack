import { ReactElement, useCallback, useState } from 'react';
import { CheckIcon } from 'lucide-react';
import { ChargeFilter, TransactionsTableEntityFieldsFragmentDoc } from '../../../../gql/graphql.js';
import { FragmentType, getFragmentData } from '../../../../gql/index.js';
import { useGetBusinesses } from '../../../../hooks/use-get-businesses.js';
import { useUpdateTransaction } from '../../../../hooks/use-update-transaction.js';
import { useUrlQuery } from '../../../../hooks/use-url-query.js';
import { InsertBusiness } from '../../../common/modals/insert-business.js';
import { SimilarTransactionsModal } from '../../../common/modals/similar-transactions-modal.js';
import { Button } from '../../../ui/button.js';
import { SelectWithSearch } from '../../../ui/select-with-search.js';
import { Tooltip } from '../../index.js';

// eslint-disable-next-line @typescript-eslint/no-unused-expressions -- used by codegen
/* GraphQL */ `
  fragment TransactionsTableEntityFields on Transaction {
    id
    counterparty {
      name
      id
    }
    sourceDescription
    missingInfoSuggestions {
      business {
        id
        name
      }
    }
  }
`;

type Props = {
  data: FragmentType<typeof TransactionsTableEntityFieldsFragmentDoc>;
  enableEdit?: boolean;
  onChange?: () => void;
};

export function Counterparty({ data, onChange, enableEdit }: Props): ReactElement {
  const { get } = useUrlQuery();
  const {
    id,
    counterparty,
    missingInfoSuggestions,
    id: transactionId,
    sourceDescription,
  } = getFragmentData(TransactionsTableEntityFieldsFragmentDoc, data);

  const hasSuggestion = !!missingInfoSuggestions?.business && enableEdit;
  const suggestedName = hasSuggestion ? missingInfoSuggestions?.business?.name : 'Missing';
  const suggestedId = hasSuggestion ? missingInfoSuggestions?.business?.id : null;

  const name = counterparty?.name ?? suggestedName;

  const [similarTransactionsOpen, setSimilarTransactionsOpen] = useState(false);

  const { updateTransaction, fetching } = useUpdateTransaction();
  const updateBusiness = useCallback(
    async (counterpartyId: string) => {
      await updateTransaction({
        transactionId,
        fields: {
          counterpartyId,
        },
      });
      setSimilarTransactionsOpen(true);
    },
    [transactionId, updateTransaction],
  );

  const onAddBusiness = useCallback(
    async (businessId: string) => {
      await updateBusiness(businessId);
      onChange?.();
    },
    [updateBusiness, onChange],
  );

  const encodedFilters = get('chargesFilters');

  const getHref = useCallback(
    (businessID: string) => {
      const currentFilters = encodedFilters
        ? (JSON.parse(decodeURIComponent(encodedFilters as string)) as ChargeFilter)
        : {};
      const encodedNewFilters = {
        fromDate: currentFilters.fromDate
          ? `%252C%2522fromDate%2522%253A%2522${currentFilters.fromDate}%2522`
          : '',
        toDate: currentFilters.toDate
          ? `%252C%2522toDate%2522%253A%2522${currentFilters.toDate}%2522`
          : '',
        financialEntityIds:
          currentFilters.byOwners && currentFilters.byOwners.length > 0
            ? `%2522${currentFilters.byOwners.join('%2522%252C%2522')}%2522`
            : '',
      };
      return `/business-transactions?transactionsFilters=%257B%2522ownerIds%2522%253A%255B${
        encodedNewFilters.financialEntityIds
      }%255D%252C%2522businessIDs%2522%253A%255B%2522${encodeURIComponent(businessID)}%2522%255D${
        encodedNewFilters.fromDate
      }${encodedNewFilters.toDate}%257D`;
    },
    [encodedFilters],
  );

  const { selectableBusinesses: selectOptions, fetching: businessesLoading } = useGetBusinesses();

  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(suggestedId ?? null);

  const [search, setSearch] = useState<string | null>(sourceDescription);

  return (
    <td>
      <div className="flex flex-wrap gap-1 items-center justify-center">
        {counterparty?.id ? (
          <a href={getHref(counterparty.id)} target="_blank" rel="noreferrer">
            {name}
          </a>
        ) : (
          <>
            <SelectWithSearch
              options={selectOptions}
              value={selectedBusinessId}
              onChange={setSelectedBusinessId}
              search={search}
              onSearchChange={setSearch}
              placeholder="Choose or create a business"
              empty={search ? <InsertBusiness description={search} onAdd={onAddBusiness} /> : null}
            />
            <Tooltip content="Approve">
              <Button
                variant="outline"
                size="icon"
                onClick={() => selectedBusinessId && updateBusiness(selectedBusinessId)}
                disabled={fetching || businessesLoading || !selectedBusinessId}
              >
                <CheckIcon className="size-4" />
              </Button>
            </Tooltip>
          </>
        )}
      </div>

      <SimilarTransactionsModal
        transactionId={id}
        counterpartyId={counterparty?.id ?? selectedBusinessId}
        open={similarTransactionsOpen}
        onOpenChange={setSimilarTransactionsOpen}
        onClose={onChange}
      />
    </td>
  );
}
