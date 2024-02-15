import { DEEPLINKS } from 'support/helpers/consts.js'
import { getBookingWithCondition, loadPage } from '../../support/helpers'
import {
    interceptBookingDetails,
    interceptInvoices,
    interceptSeatingSummary,
} from 'support/helpers/intercept.js'
describe('Deeplinks', () => {
    it('C3687093 - Visit MMB of a confirmed booking with the "invoice" deeplink in the url', () => {
        getBookingWithCondition().then(({ bookingId, simpleToken }) => {
            interceptInvoices(bookingId)
            /** After the MMB url with an 'invoices' deeplink is fully loaded, user is immediately redirected to MMB2. */
            loadPage({
                bookingId,
                deeplink: DEEPLINKS.INVOICES,
                simpleToken,
                checkPage: false,
            })

            cy.step('C3687093 Invoices deeplink redirects user to the MMB2 Invoices page')
            cy.location('pathname').should('eq', `/en/trips/${bookingId}/invoices/`)
            cy.findByRole('heading', { name: 'Invoices' }).should('be.visible')

            cy.log('The Invoices page shows the correct number of invoices')
            cy.wait('@invoices').then(invoices => {
                const noOfInvoices = invoices.response.body.invoices.length
                cy.findAllByTestId('InvoicesItem').should('be.visible').and('have.length', noOfInvoices)
            })
        })
    })

    it('C3692434, C3687094, C3721802 - Visit MMB of a confirmed booking with the "seating" deeplink in the url', () => {
        getBookingWithCondition().then(({ bookingId, simpleToken }) => {
            interceptBookingDetails(bookingId)
            interceptSeatingSummary(bookingId)
            /** After the MMB url with a 'seating' deeplink is fully loaded, user is immediately redirected to MMB2. */
            loadPage({
                bookingId,
                deeplink: DEEPLINKS.SEATING,
                simpleToken,
                checkPage: false,
            })

            cy.wait('@bookingDetails').then(details => {
                const seating =
                    details.response.body.booking_details.additional_services.services_data.seating

                if (!seating) {
                    cy.step(
                        'C3721802 Seating deeplink does not redirect to MMB2 Seating page when the service is not available at all',
                    )
                    cy.location('pathname').should('eq', `/en/manage/${bookingId}`)
                    cy.findByTestId('ServiceUnavailableDeeplinkFallbackModal')
                        .should('be.visible')
                        .within(() => {
                            cy.findByText(`Additional service "seating" isn't available.`).should('be.visible')
                        })
                } else if (seating.status === 'too_late_to_order') {
                    cy.step(
                        'C3692434 Seating deeplink does not redirect to MMB2 Seating page when seating is no longer available for purchase',
                    )
                    cy.location('pathname').should('eq', `/en/manage/${bookingId}`)
                    cy.findByTestId('ServiceTooLateToOrderModal')
                        .should('be.visible')
                        .within(() => {
                            cy.findByRole('heading', {
                                name: 'It’s no longer possible to add this service',
                            }).should('be.visible')
                        })
                } else {
                    cy.step('C3687094 Seating deeplink redirects user to the MMB2 Seating page')
                    cy.location('pathname').should('eq', `/en/trips/${bookingId}/seating/`)
                    cy.findByRole('heading', { name: 'Select your seating' }).should('be.visible')

                    cy.log('The Seating page shows the correct number of segments')
                    cy.wait('@seatingSummary').then(seatingSummary => {
                        const seating = seatingSummary.response.body.seating
                        const numberOfSegments = seating.sectors.reduce((prev, curr) => {
                            return prev + curr.segments.length
                        }, 0)
                        cy.get('[data-test^=SummaryPageContent-Segment-]')
                            .should('be.visible')
                            .and('have.length', numberOfSegments)
                    })
                }
            })
        })
    })
})