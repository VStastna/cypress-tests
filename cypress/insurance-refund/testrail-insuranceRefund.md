C3991522 Manage Booking displays order card for an already purchased Insurance  
Given a user visits a booking with an already purchased Insurance  
And the Insurance was purchased post booking  
When the user scrolls down to the Requests section  
Then the user can see an Insurance order card with status ‘completed’

C3991523 The passenger has an already purchased insurance level assigned in the Insurance modal  
Given a user visits a booking with an already purchased Insurance  
When the user opens the Insurance modal  
Then the user can see the already purchased Insurance level as active

C3991524 The passenger can see the already purchased insurance level assigned in the Passenger details page  
Given a user visits a booking with an already purchased Insurance   
When the user goes to the Passengers details page  
Then the user can see the already purchased level of Insurance in the Insurance section

C3991525 User can refund Insurance in the Insurance modal  
Given a user is on the Passenger details page  
And the user wishes to refund their Insurance  
When the user clicks the ‘Manage’ button in the Insurance section  
Then the user is redirected to the Insurance modal  
And the 'No insurance' button displays the correct refundable amount

C3991526 It's possible to refund an already purchased Insurance  
Given a user visits a booking with an already purchased Insurance  
And the user is in the Insurance modal  
And the user selects the ‘No insurance’ option  
When the user clicks the ‘Confirm and receive refund’ button  
Then the Insurance is refunded  
And the user is informed that the Insurance change was requested successfully

C3991527 Refunded Insurance is reflected on the Passenger details page  
Given a user has just refunded their Insurance  
When the user re-visits the Passenger details page  
Then the user can see 'None selected' in the Insurance section

C4010439 Correct Insurance level is pre-selected for a purchase  
Given a user has just refunded their Insurance  
And the user is on the Passenger details page  
When the user visits the Insurance modal again, by clicking the 'Manage' button  
Then the user is redirected to the Insurance modal  
And the correct Insurance level is pre-selected for a purchase  