import { getBookingWithCondition, loadPage } from '../../support/helpers'
import { interceptBooking, interceptInvoices } from 'support/helpers/intercept.js'
import { INVOICE_TYPE } from 'support/helpers/consts.js'
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
                                            name: INVOICE_TYPE[invoiceCategory].displayText,
                                        }).should('be.visible')

                                        cy.step('C5072780 User can download their Invoice')
                                        cy.findByRole('button', { name: 'Download' })
                                            .should('be.visible')
                                            .and('have.attr', 'target', '_blank')
                                            .and('have.attr', 'href')
                                    })
                            })

                        cy.log('Return to Manage Booking')
                        cy.findByRole('link', { name: 'My trip' }).should('be.visible').click()
                        cy.location('pathname').should('eq', `/en/manage/${bookingId}/`)
                        cy.findByTestId('BookingHeader').should('be.visible')
                        cy.findByTestId('BookingContent').should('be.visible')
                    })
                })
            })
    })
})

