const INVOICE_TYPE = {
    bags: { displayTextMMB2: 'Baggage' },
    booking: { displayTextMMB2: 'Booking' },
    flights: { displayTextMMB2: 'Change flights' },
    guarantee: { displayTextMMB2: 'Kiwi.com Guarantee' },
    update_insurances: { displayTextMMB2: 'Insurance' },
    passenger_details_change: { displayTextMMB2: 'Passenger changes' },
    seating: { displayTextMMB2: 'Seat selection' },
    service_package: { displayTextMMB2: 'Kiwi.com Services' },
}

/**
 * Intercept GET request to the main booking call as 'booking'.
 *
 * @param {string} bookingId
 */
const interceptBooking = bookingId => {
    cy.intercept('GET', `${Cypress.env('BOOKING_DETAILS_BASE_URL')}/bookings/${bookingId}?**`).as(
        'booking',
    )
}

/**
 * Intercept GET request to 'invoices' as 'invoices'.
 *
 * @param {string} bookingId
 */
const interceptInvoices = bookingId => {
    cy.intercept('GET', `${Cypress.env('BFF_BASE_URL')}/bookings/${bookingId}/invoices?**`).as(
        'invoices',
    )
}


import { getBookingWithCondition, loadPage } from '../../support/helpers'
//import { interceptBooking, interceptInvoices } from '../../support/intercept'
//import { INVOICE_TYPE } from '../../support/data/general'
describe('Invoices', () => {
    it('C5072779, C5072780 - Invoices page displays the correct number of Invoices', () => {
        getBookingWithCondition().then(({ bookingId, simpleToken }) => {
            interceptBooking(bookingId)
            interceptInvoices(bookingId)
            loadPage({
                bookingId,
                simpleToken,
            })

            cy.wait('@booking').then(booking => {
                const noOfConfirmedAdditionalServices =
                    booking.response.body.additional_bookings.details.filter(
                        details => details.final_status === 'confirmed',
                    ).length

                cy.step('C5072779 Invoices are available on the Invoices page')
                cy.findByRole('button', { name: 'Invoice' }).should('be.visible').click()
                cy.wait('@invoices').then(invoices => {
                    const noOfInvoices = invoices.response.body.invoices.length

                    /** The number of invoices in the Invoices call should match the number of the actual confirmed Additional services, including
                     * the booking invoice. */
                    expect(noOfInvoices).to.equal(noOfConfirmedAdditionalServices + 1)
                    cy.location('pathname').should('eq', `/en/trips/${bookingId}/invoices/`)
                    cy.findByRole('heading', { name: 'Invoices' }).should('be.visible')

                    cy.findAllByTestId('InvoicesItem')
                        .should('be.visible')
                        .each((invoice, index) => {
                            const { category: invoiceCategory } = invoices.response.body.invoices[index]
                            cy.wrap(invoice)
                                .should('be.visible')
                                .within(() => {
                                    cy.findByRole('heading', {
                                        name: INVOICE_TYPE[invoiceCategory].displayTextMMB2,
                                    }).should('be.visible')

                                    cy.step('C5072780 User can download their Invoice')
                                    cy.findByRole('button', { name: 'Download' })
                                        .should('be.visible')
                                        .and('have.attr', 'target', '_blank')
                                        .and('have.attr', 'href')
                                })
                        })

                    cy.log('Return to MMB')
                    cy.findByRole('link', { name: 'My trip' }).should('be.visible').click()
                    cy.location('pathname').should('eq', `/en/manage/${bookingId}/`)
                    cy.findByTestId('BookingHeader').should('be.visible')
                    cy.findByTestId('BookingContent').should('be.visible')
                })
            })
        })
    })
})
