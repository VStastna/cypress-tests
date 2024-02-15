C628621 Check-in banner is available when passport details were not added or the health declaration was not confirmed  
Given a user created a booking  
And the booking is in a confirmed state  
And the user didn't add passport details or didn't confirm the Health declaration  
When the user visits Manage Booking  
Then the online check-in banner is visible

C516948 Check-in & Boarding passes section shows 'Details required' status    
Given a user didn't add check-in details yet  
When the user is in Manage Booking of a confirmed booking     
Then the 'Check-in & Boarding passes' section says that passport details are required

C570020 Travel document card is not displayed in the Passenger details page section  
Given a user is in Manage Booking of a confirmed booking  
And the user didn't add passport details yet  
When the user clicks on the Passenger tile in the Passenger card  
Then the user is redirected to Passenger details page  
And the user sees that Travel document card is not displayed

C1724865 Users are offered extras before they are taken to the Check-in page
Given a user wishes to enter the check-in details/confirm Health declaration  
When the user clicks the 'Add check-in details' button  
Then the Check-in offers modal opens up  
And the user is offered Baggage and Seating extras

C254695 Continue to check-in without purchasing recommended extras    
Given a user is in the Check-in Offers modal  
And the user does not wish to purchase any recommended extras  
When the user clicks the 'No thanks, continue to check-in' button  
Then the user is taken to check-in/health declaration page

C2270725 User is taken to the Health Declaration page first when Health declaration confirmation is required  
Given the Health declaration confirmation is required  
And the user has not confirmed it yet  
When the user clicks the 'No thanks, continue to check-in' button  
Then the Health declaration page is displayed and contains all elements

C628619 Confirm Health declaration and continue to the Check-in page  
Given a user is on the Health declaration page  
And the user has not added passport details yet  
When the user confirms the Health declaration  
Then the user is redirected to the Check-in (Travel document) page

C628623 Check-in banner is not available after confirming Health declaration/adding passport details  
Given a user confirmed Health declaration/added passport details  
When the user returns to Manage Booking  
Then the online check-in banner is no longer available

C1449828 User can return to the Health Declaration page in order to re-read the information  
Given a user is on the Check-in (Travel document) page  
And has just confirmed the Health declaration  
And the user wishes to read the Health declaration information again  
When the user clicks the 'Back' button  
Then the user is taken to the Health declaration page again

C234553 Passport details are added and submitted on the MMB2 check-in page  
Given a user is on the Manage Booking check-in page  
When the user fills in the passport details  
And the user submits them for check-in  
Then the page ‘Thanks, we have everything we need to check you in’ appears  
And the user can return to Manage Booking

C516949 Check-in & Boarding passes section shows correct final status    
Given a user returns to Manage Booking after adding their check-in details   
When the user scrolls down to the 'Check-in & Boarding passes' section  
Then the user sees a status 'Waiting for airline/check-in' or "Processing check-in"

C4023057 Travel document card is displayed for all passengers who submitted travel document details  
Given the user created a booking  
And the user previously submitted document details for the passengers  
When the user visits Passenger details page  
Then the Travel document card is displayed for these passengers with the correct info  