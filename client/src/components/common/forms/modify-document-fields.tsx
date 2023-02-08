import { useEffect, useState } from 'react';
import { Control, Controller, UseFormWatch } from 'react-hook-form';
import {
  Currency,
  DocumentType,
  EditDocumentFieldsFragment,
  InsertDocumentInput,
  UpdateDocumentFieldsInput,
} from '../../../gql/graphql';
import { TIMELESS_DATE_REGEX } from '../../../helpers/consts';
import {
  isDocumentInvoice,
  isDocumentInvoiceReceipt,
  isDocumentProforma,
  isDocumentReceipt,
} from '../../../helpers/documents';
import { CurrencyInput, SelectInput, TextInput } from '../../common';
export interface Props {
  document?: EditDocumentFieldsFragment;
  control: Control<UpdateDocumentFieldsInput | InsertDocumentInput, object>;
  watch: UseFormWatch<UpdateDocumentFieldsInput | InsertDocumentInput>;
  defaultCurrency?: Currency;
}

export const ModifyDocumentFields = ({ document, control, watch, defaultCurrency }: Props) => {
  const [showExtendedFields, setShowExtendedFields] = useState<boolean>(false);

  const isDocumentProcessed =
    isDocumentInvoice(document) ||
    isDocumentReceipt(document) ||
    isDocumentInvoiceReceipt(document) ||
    isDocumentProforma(document);

  const type = watch('documentType');

  // auto update vat currency according to amount currency
  useEffect(() => {
    setShowExtendedFields(
      Boolean(type) &&
        (type === DocumentType.Invoice ||
          type === DocumentType.Receipt ||
          type === DocumentType.InvoiceReceipt ||
          type === DocumentType.Proforma),
    );
  }, [type]);

  return (
    <>
      <Controller
        name="documentType"
        control={control}
        rules={{ required: 'Required' }}
        defaultValue={DocumentType.Unprocessed}
        render={({ field, fieldState }) => (
          <SelectInput
            {...field}
            selectionEnum={DocumentType}
            error={fieldState.error?.message}
            label="Type"
          />
        )}
      />
      {showExtendedFields && (
        <>
          <Controller
            name="date"
            control={control}
            defaultValue={isDocumentProcessed ? document?.date : undefined}
            rules={{
              pattern: {
                value: TIMELESS_DATE_REGEX,
                message: 'Date must be im format yyyy-mm-dd',
              },
            }}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                value={field.value ?? undefined}
                error={fieldState.error?.message}
                isDirty={fieldState.isDirty}
                label="Date"
              />
            )}
          />
          <Controller
            name="serialNumber"
            control={control}
            defaultValue={isDocumentProcessed ? document?.serialNumber : undefined}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                value={!field || field.value === 'Missing' ? '' : field.value!}
                error={fieldState.error?.message}
                isDirty={fieldState.isDirty}
                label="Serial Number"
              />
            )}
          />
          <Controller
            name="debtor"
            control={control}
            defaultValue={isDocumentProcessed ? document?.debtor : undefined}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                value={!field || field.value === 'Missing' ? '' : field.value!}
                error={fieldState.error?.message}
                isDirty={fieldState.isDirty}
                label="Debtor"
              />
            )}
          />
          <Controller
            name="creditor"
            control={control}
            defaultValue={isDocumentProcessed ? document?.creditor : undefined}
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                value={!field || field.value === 'Missing' ? '' : field.value!}
                error={fieldState.error?.message}
                isDirty={fieldState.isDirty}
                label="Creditor"
              />
            )}
          />
          <Controller
            name="vat.raw"
            control={control}
            defaultValue={isDocumentProcessed ? document?.vat?.raw : undefined}
            render={({ field: vatField, fieldState: vatFieldState }) => (
              <Controller
                name="vat.currency"
                control={control}
                defaultValue={
                  isDocumentProcessed ? document?.amount?.currency ?? Currency.Ils : defaultCurrency
                }
                render={({ field: currencyCodeField, fieldState: currencyCodeFieldState }) => (
                  <CurrencyInput
                    // className="w-full bg-gray-100 rounded border bg-opacity-50 border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:bg-transparent focus:border-indigo-500 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                    {...vatField}
                    error={vatFieldState.error?.message || currencyCodeFieldState.error?.message}
                    isDirty={vatFieldState.isDirty || currencyCodeFieldState.isDirty}
                    label="VAT"
                    currencyCodeProps={{ ...currencyCodeField, label: 'Currency', disabled: true }}
                  />
                )}
              />
            )}
          />
          <Controller
            name="amount.raw"
            control={control}
            defaultValue={isDocumentProcessed ? document?.amount?.raw : undefined}
            render={({ field: amountField, fieldState: amountFieldState }) => (
              <Controller
                name="amount.currency"
                control={control}
                defaultValue={
                  isDocumentProcessed ? document?.amount?.currency ?? Currency.Ils : defaultCurrency
                }
                render={({ field: currencyCodeField, fieldState: currencyCodeFieldState }) => (
                  <CurrencyInput
                    // className="w-full bg-gray-100 rounded border bg-opacity-50 border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:bg-transparent focus:border-indigo-500 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                    {...amountField}
                    error={amountFieldState.error?.message || currencyCodeFieldState.error?.message}
                    isDirty={amountFieldState.isDirty || currencyCodeFieldState.isDirty}
                    label="Amount"
                    currencyCodeProps={{ ...currencyCodeField, label: 'Currency' }}
                  />
                )}
              />
            )}
          />
        </>
      )}
      <Controller
        name="image"
        control={control}
        defaultValue={document?.image}
        render={({ field, fieldState }) => (
          <TextInput
            {...field}
            value={field.value?.toString()}
            error={fieldState.error?.message}
            isDirty={fieldState.isDirty}
            label="Image URL"
          />
        )}
      />
      <Controller
        name="file"
        control={control}
        defaultValue={document?.file}
        render={({ field, fieldState }) => (
          <div className="flex flex-row">
            <TextInput
              className="grow"
              {...field}
              value={field.value?.toString()}
              error={fieldState.error?.message}
              isDirty={fieldState.isDirty}
              label="File URL"
            />
          </div>
        )}
      />
    </>
  );
};