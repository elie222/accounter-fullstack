import { useCallback } from 'react';
import { useMutation } from 'urql';
import { notifications } from '@mantine/notifications';
import {
  UpdateDocumentDocument,
  UpdateDocumentMutation,
  UpdateDocumentMutationVariables,
} from '../gql/graphql.js';
import { useHandleKnownErrors } from './use-handle-known-errors.js';

// eslint-disable-next-line @typescript-eslint/no-unused-expressions -- used by codegen
/* GraphQL */ `
  mutation UpdateDocument($documentId: UUID!, $fields: UpdateDocumentFieldsInput!) {
    updateDocument(documentId: $documentId, fields: $fields) {
      __typename
      ... on CommonError {
        message
      }
      ... on UpdateDocumentSuccessfulResult {
        document {
          id
        }
      }
    }
  }
`;

type UpdateDocumentSuccessfulResult = Extract<
  UpdateDocumentMutation['updateDocument'],
  { __typename: 'UpdateDocumentSuccessfulResult' }
>;

type UseUpdateDocument = {
  fetching: boolean;
  updateDocument: (
    variables: UpdateDocumentMutationVariables,
  ) => Promise<UpdateDocumentSuccessfulResult>;
};

const NOTIFICATION_ID = 'updateDocument';

export const useUpdateDocument = (): UseUpdateDocument => {
  // TODO: add authentication
  // TODO: add local data update method after change

  const [{ fetching }, mutate] = useMutation(UpdateDocumentDocument);
  const { handleKnownErrors } = useHandleKnownErrors();

  const updateDocument = useCallback(
    async (variables: UpdateDocumentMutationVariables): Promise<UpdateDocumentSuccessfulResult> => {
      const notificationId = `${NOTIFICATION_ID}-${variables.documentId}`;

      return new Promise<UpdateDocumentSuccessfulResult>((resolve, reject) => {
        notifications.show({
          id: notificationId,
          loading: true,
          title: 'Updating document',
          message: 'Please wait...',
          autoClose: false,
          withCloseButton: true,
        });
        return mutate(variables).then(res => {
          const message = `Error updating document ID [${variables.documentId}]`;
          const data = handleKnownErrors(res, reject, message, notificationId);
          if (data) {
            if (data.updateDocument.__typename === 'CommonError') {
              console.error(`${message}: ${data.updateDocument.message}`);
              notifications.update({
                id: notificationId,
                message,
                color: 'red',
                autoClose: 5000,
              });
              return reject(data.updateDocument.message);
            }
            notifications.update({
              id: notificationId,
              title: 'Update Successful!',
              autoClose: 5000,
              message: 'Document is updated',
              withCloseButton: true,
            });
            return resolve(data.updateDocument);
          }
        });
      });
    },
    [handleKnownErrors, mutate],
  );

  return {
    fetching,
    updateDocument,
  };
};
