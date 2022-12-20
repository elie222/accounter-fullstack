import { useState } from 'react';
import { ActionIcon } from '@mantine/core';
import { PlugConnectedX } from 'tabler-icons-react';
import { useUpdateDocument } from '../../../hooks/use-update-document';
import { ConfirmationModal } from '../../common';

interface Props {
  documentId: string;
}

export function UnlinkDocumentButton({ documentId }: Props) {
  const [opened, setOpened] = useState(false);
  const { updateDocument } = useUpdateDocument();

  function onUnlink() {
    updateDocument({
      documentId,
      fields: { chargeId: 'NULL' },
    });
    setOpened(false);
  }

  return (
    <>
      <ConfirmationModal
        opened={opened}
        onClose={() => setOpened(false)}
        onConfirm={onUnlink}
        title="Are you sure you want to unlink this document from the charge?"
      />
      <ActionIcon onClick={() => setOpened(true)}>
        <PlugConnectedX size={20} />
      </ActionIcon>
    </>
  );
}
