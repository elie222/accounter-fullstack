console.log('this should display only in browser');
export function printElement(clickedElement, newValue) {
    const changeRequest = {
        newValue: newValue,
        propertyToChange: clickedElement.className,
        bank_reference: clickedElement.parentElement.getAttribute('bank_reference'),
        account_number: clickedElement.parentElement.getAttribute('account_number'),
        account_type: clickedElement.parentElement.getAttribute('account_type'),
        currency_code: clickedElement.parentElement.getAttribute('currency_code'),
        event_date: clickedElement.parentElement.getAttribute('event_date'),
        event_amount: clickedElement.parentElement.getAttribute('event_amount'),
        event_number: clickedElement.parentElement.getAttribute('event_number'),
    };
    console.log(changeRequest);
    fetch('/editProperty', {
        method: 'POST',
        body: JSON.stringify(changeRequest),
    }).then(response => {
        console.log('Request complete! response:', response);
    });
}
//# sourceMappingURL=browser.js.map