import { getBookingWithCondition, loadPage } from '../../../support/helpers'
import {
    interceptAncillariesOffersCheck,
    interceptBooking,
    interceptOrders,
    interceptPassengerDetails,
} from '/support/helpers/intercept.js'
import { FILTERS } from 'support/helpers/filters.js'
import { DEFAULT_ADULT } from 'support/helpers/consts.js'
const BOOKING_DATA = {
    booking_passengers: [
        {
            ...DEFAULT_ADULT,
            passenger_ancillaries: { insurance: 'plus' },
        },
    ],
}
describe('Insurance - Successful refund', () => {
    it('C3991522, C3991523, C3991524, C3991525, C3991526, C3991527, C4010439 - Successfully refund Insurance', () => {
        getBookingWithCondition({
            conditions: [FILTERS.PLUS_INSURANCE, FILTERS.SINGLE_PASSENGER, FILTERS.NON_US_PASSENGERS],
            bookingData: BOOKING_DATA,
        }).then(({ bookingId, simpleToken }) => {
            interceptAncillariesOffersCheck(bookingId)
            interceptOrders(bookingId)
            interceptBooking(bookingId)
            interceptPassengerDetails(bookingId)
            loadPage({
                bookingId,
                simpleToken,
            })

            cy.wait('@booking').then(booking => {
                const {
                    items: [
                        {
                            price: { amount: activeInsurancePrice },
                        },
                    ],
                } = booking.response.body.insurance.find(insurance =>
                    insurance.items.some(item => item.is_active === true),
                )

                const postBookingInsuranceLength = booking.response.body.insurance.filter(
                    ({ source }) => source === 'post_booking',
                ).length
                if (postBookingInsuranceLength > 0) {
                    cy.step('C3991522 Manage Booking displays order card for an already purchased Insurance')
                    cy.findByTestId('ServicesAndRequestsCard')
                        .should('be.visible')
                        .within(() => {
                            cy.findAllByTestId('AdditionalServiceStatus-insurance')
                                .should('be.visible')
                                .and('contain', 'Completed')
                                .and('have.length', postBookingInsuranceLength)
                        })
                }

                cy.step(
                    'C3991523 The passenger has an already purchased insurance level assigned in the Insurance modal',
                )
                cy.findByTestId('NonProminentTile-insurance')
                    .contains('button', 'Manage insurance')
                    .should('be.visible')
                    .click()
                cy.findByTestId('InsuranceModal')
                    .should('be.visible')
                    .within(() => {
                        cy.findByRole('heading', { name: 'Insurance' }).should('be.visible')
                        cy.contains('[data-test="InsurancePassengers-PassengerTile"]', 'TEST TEST')
                            .should('be.visible')
                            .within(() => {
                                cy.log('The "No insurance" option is not displayed as active')
                                cy.findByRole('button', { name: /No insurance/ })
                                    .should('be.visible')
                                    .and('not.have.class', '_active')
                                cy.log('The "Plus" option is displayed as active')
                                cy.findByRole('button', { name: /Plus/ })
                                    .should('be.visible')
                                    .and('have.class', '_active')
                            })
                        cy.findByTestId('ModalCloseButton').should('be.visible').click()
                    })
                cy.findByTestId('InsuranceModal').should('not.exist')

                cy.step(
                    'C3991524 The passenger can see the already purchased insurance level assigned in the Passenger details page',
                )
                cy.contains('[data-test^=PassengersCardTile-]', 'TEST TEST').should('be.visible').click()
                cy.wait('@passengerDetails').then(passengerDetails => {
                    const passengerId = passengerDetails.response.body.passengers[0].id
                    cy.location('pathname').should(
                        'eq',
                        `/en/trips/${bookingId}/passenger-details/${passengerId}/`,
                    )
                    cy.findByRole('heading', { name: 'Passenger details' }).should('be.visible')
                    cy.findByRole('tab', { name: 'TEST TEST' })
                        .should('be.visible')
                        .and('have.attr', 'aria-selected', 'true')
                    cy.findByTestId('InsuranceCard')
                        .should('be.visible')
                        .within(() => {
                            cy.findByRole('heading', { name: 'Insurance' }).should('be.visible')
                            cy.findByTestId('InsuranceDescription')
                                .should('be.visible')
                                .and('contain', 'Plus Insurance')
                        })

                    cy.step('C3991525 User can refund Insurance in the Insurance modal')
                    cy.findByTestId('InsuranceCard').within(() => {
                        cy.findByRole('link', { name: 'Manage' }).should('be.visible').click()
                    })
                    cy.location('pathname').should('eq', `/en/manage/${bookingId}`)
                    cy.location('search').should('include', 'deeplink=insurance')
                    cy.findByTestId('InsuranceModal')
                        .should('be.visible')
                        .within(() => {
                            cy.findByRole('heading', { name: 'Insurance' }).should('be.visible')
                            cy.findByTestId('insuranceForm-insuranceSubmit').should('not.exist')
                            cy.contains('[data-test="InsurancePassengers-PassengerTile"]', 'TEST TEST')
                                .should('be.visible')
                                .within(() => {
                                    cy.findByRole('button', { name: /No insurance/ })
                                        .should('be.visible')
                                        .and('contain', `-${activeInsurancePrice}`)
                                        .and('not.have.class', '_selected')
                                        .click()
                                    cy.findByRole('button', { name: /No insurance/ }).should(
                                        'have.class',
                                        '_selected',
                                    )
                                })

                            cy.step(`C3991526 It's possible to refund an already purchased Insurance`)
                            cy.findByTestId('insuranceForm-insuranceSubmit')
                                .should('be.visible')
                                .invoke('text')
                                .then(buttonText => {
                                    expect(buttonText).to.contain(`Confirm and receive a ${activeInsurancePrice}`)
                                    expect(buttonText).to.contain('€ refund')
                                })
                            cy.findByTestId('insuranceForm-insuranceSubmit').click()
                            cy.findByTestId('insuranceForm-alert-success').should('be.visible')
                            cy.findByTestId('ModalCloseButton').should('be.visible').click()
                            cy.findByTestId('InsuranceModal').should('not.exist')
                        })

                    cy.step('C3991527 Refunded Insurance is reflected on the Passenger details page')
                    cy.contains('[data-test^=PassengersCardTile-]', 'TEST TEST').should('be.visible').click()
                    cy.location('pathname').should(
                        'eq',
                        `/en/trips/${bookingId}/passenger-details/${passengerId}/`,
                    )
                    cy.findByRole('heading', { name: 'Passenger details' }).should('be.visible')
                    cy.findByRole('tab', { name: 'TEST TEST' })
                        .should('be.visible')
                        .and('have.attr', 'aria-selected', 'true')
                    cy.findByTestId('InsuranceCard')
                        .should('be.visible')
                        .within(() => {
                            cy.findByRole('heading', { name: 'Insurance' }).should('be.visible')
                            cy.findByTestId('InsuranceDescription')
                                .should('be.visible')
                                .and('not.contain', 'Plus Insurance')
                                .and('contain', 'None selected')
                        })
                })

                cy.step('C4010439 Correct Insurance level is pre-selected for a purchase')
                cy.findByTestId('InsuranceCard').within(() => {
                    cy.findByRole('link', { name: 'Manage' }).should('be.visible').click()
                })
                cy.wait('@ancillariesInsurance').then(ancillariesInsurance => {
                    /** Save the prices of Basic and Plus insurances from the response */
                    const { amount: basicPrice } =
                        ancillariesInsurance.response.body.insurance.offers[0].meta.options.find(
                            option => option.level === 'basic',
                        ).price
                    const { amount: plusPrice } =
                        ancillariesInsurance.response.body.insurance.offers[0].meta.options.find(
                            option => option.level === 'plus',
                        ).price
                    cy.location('pathname').should('eq', `/en/manage/${bookingId}`)
                    cy.location('search').should('include', 'deeplink=insurance')
                    cy.findByTestId('InsuranceModal')
                        .should('be.visible')
                        .within(() => {
                            cy.findByRole('heading', { name: 'Insurance' }).should('be.visible')
                            cy.contains('[data-test="InsurancePassengers-PassengerTile"]', 'TEST TEST')
                                .should('be.visible')
                                .within(() => {
                                    cy.log('The "No insurance" option is displayed as active')
                                    cy.findByRole('button', { name: /No insurance/ })
                                        .should('be.visible')
                                        .and('have.class', '_active')
                                    cy.log('Basic insurance option is pre-selected')
                                    cy.findByRole('button', { name: /Basic/ })
                                        .should('be.visible')
                                        .and('contain', `${basicPrice}`)
                                        .and('have.class', '_selected')
                                    cy.log('Plus insurance option is not pre-selected or active')
                                    cy.findByRole('button', { name: /Plus/ })
                                        .should('be.visible')
                                        .and('contain', `${plusPrice}`)
                                        .and('not.have.class', '_selected')
                                        .and('not.have.class', '_active')
                                })
                            cy.findByTestId('insuranceForm-insuranceSubmit')
                                .should('be.visible')
                                .and('contain', 'Check out')
                        })
                })
            })
        })
    })
})