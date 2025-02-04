import { ReactElement, useCallback } from 'react';
import { useMutation } from 'urql';
import { Dropzone } from '@mantine/dropzone';
import { showNotification } from '@mantine/notifications';
import { CommonError, UploadDocumentDocument } from '../../../gql/graphql.js';

type Props = {
  children?: ReactElement | ReactElement[];
  chargeId: string;
};

export const DragFile = ({ children, chargeId }: Props): ReactElement => {
  const [res, mutate] = useMutation(UploadDocumentDocument);

  function onFail(message?: string): void {
    showNotification({
      title: 'Error!',
      message: message ?? 'Oh no!, we have an error! 🤥',
    });
  }

  const onDrop = useCallback(
    async (file: File) => {
      mutate({
        file,
        chargeId,
      })
        .then(res => {
          if (res.error || res.data?.uploadDocument.__typename === 'CommonError') {
            onFail();
            console.error(
              `Error uploading document: ${
                res.error?.message || (res.data?.uploadDocument as CommonError).message
              }`,
            );
          } else if (res.data) {
            showNotification({
              title: 'Upload Success!',
              message: 'Hey there, you add new document!',
            });
            console.log(res.data.uploadDocument);
          }
        })
        .catch(e => {
          showNotification({
            title: 'Error!',
            message: 'Oh no!, we have an error! 🤥',
          });
          console.error(`Error uploading document: ${(e as Error)?.message}`);
        });
    },
    [mutate, chargeId],
  );

  return (
    <Dropzone
      onDrop={(files): Promise<void> => onDrop(files[0])}
      onReject={(files): void =>
        onFail(
          `Rejected Files:\n${files.map(file => `"${file.file.name}": ${file.errors}`).join('\n')}`,
        )
      }
      activateOnClick={false}
      activateOnKeyboard={false}
      radius={0}
      padding={0}
      maxFiles={1}
      loading={res.fetching}
      sx={() => ({
        border: 0,
        cursor: 'default',
        width: '100%',
        height: '100%',
        zIndex: 1,
      })}
    >
      {children}
    </Dropzone>
  );
};
