import { ReactElement, useState } from 'react';
import { RefreshDot } from 'tabler-icons-react';
import { ActionIcon, ActionIconProps, Tooltip } from '@mantine/core';
import { useRegenerateLedgerRecords } from '../../../hooks/use-regenerate-ledger-records.js';
import { ConfirmationModal } from '../index.js';

type Props = {
  chargeId: string;
  onChange: () => void;
} & ActionIconProps;

export function RegenerateLedgerRecordsButton({
  chargeId,
  onChange,
  ...buttonProps
}: Props): ReactElement {
  const [opened, setOpened] = useState(false);
  const { regenerateLedgerRecords } = useRegenerateLedgerRecords();

  function onRegenerate(): void {
    regenerateLedgerRecords({
      chargeId,
    }).then(onChange);
    setOpened(false);
  }

  return (
    <>
      <ConfirmationModal
        opened={opened}
        onClose={(): void => setOpened(false)}
        onConfirm={onRegenerate}
        title="Are you sure you want to regenerate ledger records?"
      />
      <Tooltip label="Regenerate Ledger">
        <ActionIcon
          onClick={(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void => {
            event.stopPropagation();
            setOpened(true);
          }}
          {...buttonProps}
        >
          <RefreshDot size={20} />
        </ActionIcon>
      </Tooltip>
    </>
  );
}
