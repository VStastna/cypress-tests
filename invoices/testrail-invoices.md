C5072779 Invoice is available on the Invoices page
Given a user opens a confirmed booking
And the user wishes to view an invoice for their booking/additional service
When the user clicks the Invoices button
Then the user is taken to the Invoices page
And the user can see the correct number of invoices with the relevant Invoice name

C5072780 User can download their Invoice
Given a user is on the Invoices page
And the user wishes to download their invoices
When the user clicks the 'Download' button
Then the invoice opens in a new tab

C5072781 Invoices page displays invoice with the 'Download' button
Given a user is on the Invoices page
And the user has an Invoice for their booking/additional service
When the user clicks the 'Download' button in the invoice box
Then the Invoice file opens in a new tab