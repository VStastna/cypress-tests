C3687093 Invoices deeplink redirects user to the Invoices page  
Given a user has a confirmed booking  
When the user visits the Manage Booking page with the 'invoices' deeplink in the url  
Then the user is redirected to the Invoices page

C3692434 Seating deeplink does not redirect to Seating page when seating is no longer available for purchase  
Given the seating is no longer available for the confirmed booking  
When the user visits Manage Booking with the 'seating' deeplink in the url  
Then the user is not redirected to the Seating page  
And the user is informed that it is too late to order seating

C3687094 Seating deeplink redirects user to the Seating page  
Given the user has a confirmed booking  
When the user visits Manage Booking with the 'seating' deeplink in the url  
Then the user is redirected to the Invoices page

C3721802 Seating deeplink does not redirect to the Seating page when the service is not available at all  
Given seating is not available at all for the confirmed booking  
When the user visits Manage Booking with the 'seating' deeplink in the url  
Then the user is not redirected to the Seating page  
And the user is informed that the service 'seating' is not available  