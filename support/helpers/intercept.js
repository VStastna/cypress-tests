/**
 * Intercept GET request to the main booking call as 'booking'.
 *
 * @param {string} bookingId
 */
export const interceptBooking = bookingId => {
    cy.intercept('GET', `${Cypress.env('BOOKING_DETAILS_BASE_URL')}/bookings/${bookingId}?**`).as(
        'booking',
    )
}

/**
 * Intercept GET request to 'bookings' as 'bookingDetails'.
 *
 * @param {string} bookingId
 */
export const interceptBookingDetails = bookingId => {
    cy.intercept({
        method: 'GET',
        url: `${Cypress.env('BFF_BASE_URL')}/bookings/${bookingId}?**`,
        times: 1,
    }).as('bookingDetails')
}

/**
 * Intercept POST request to the 'check-in' call as 'checkInDetails'.
 *
 * @param {string} bookingId
 */
export const interceptCheckInDetails = bookingId => {
    cy.intercept('POST', `${Cypress.env('BFF_BASE_URL')}/bookings/${bookingId}/check-in`).as(
        'checkInDetails',
    )
}

/**
 * Intercept GET request to 'invoices' as 'invoices'.
 *
 * @param {string} bookingId
 */
export const interceptInvoices = bookingId => {
    cy.intercept('GET', `${Cypress.env('BFF_BASE_URL')}/bookings/${bookingId}/invoices?**`).as(
        'invoices',
    )
}

/**
 * Intercepts PUT request to 'orders' as 'orders'.
 *
 * @param {string} bookingId
 */

export const interceptOrders = bookingId => {
    cy.intercept('PUT', `${Cypress.env('PAYMENTS_BASE_URL')}?booking_id=${bookingId}`).as('orders')
}

/**
 * Intercept GET request to 'passenger_details' as 'passengerDetails'.
 *
 * @param {string} bookingId
 */
export const interceptPassengerDetails = bookingId => {
    cy.intercept('GET', `${Cypress.env('BFF_BASE_URL')}/bookings/${bookingId}/passenger_details`).as(
        'passengerDetails',
    )
}

/**
 * Intercept GET request to 'seating_summary' call as 'seatingSummary'.
 *
 * @param {string} bookingId
 */
export const interceptSeatingSummary = bookingId => {
    cy.intercept('GET', `${Cypress.env('BFF_BASE_URL')}/bookings/${bookingId}/seating_summary?**`).as(
        'seatingSummary',
    )
}