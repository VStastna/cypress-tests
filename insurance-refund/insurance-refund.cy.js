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
 * Intercepts PUT request to 'orders' as 'orders'.
 *
 * @param {string} bookingId
 */

export const interceptOrders = bookingId => {
    cy.intercept('PUT', `${Cypress.env('PAYMENTS_BASE_URL')}?booking_id=${bookingId}`).as('orders')
}
export const DEFAULT_ADULT = {
    birthday: '1996-06-06',
    category: 'adult',
    ...DEFAULT_DOCUMENT,
    email: 'mmbcypress@kiwi.com',
    name: 'TEST',
    surname: 'TEST',
    title: 'ms',
    nationality: 'fr',
    phone: '+33 55555555',
    passenger_ancillaries: { ...DEFAULT_PASSENGER_ANCILLARIES, axa_insurance: null },
}

import { getBookingWithCondition, loadPage } from '../../../support/helpers'
//import {
//    interceptAncillariesOffersCheck,
//    interceptBooking,
//    interceptOrders,
//    interceptPassengerDetails,
//} from '../../../support/intercept'
import { FILTERS } from '../../../support/utils'
//import { DEFAULT_ADULT, DEFAULT_BOOKING_ANCILLARIES } from '../../../support/data'
const BOOKING_DATA = {
    booking_ancillaries: DEFAULT_BOOKING_ANCILLARIES,
    booking_passengers: [
        {
            ...DEFAULT_ADULT,
            passenger_ancillaries: { axa_insurance: 'plus' },
        },
    ],
}
describe('Insurance - Successful refund', () => {
    it('C3991522, C3991523, C3991524, C3991525, C3991526, C3991527, C4010439 - Successfully refund AXA Travel Plus Insurance', () => {
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
                } = booking.response.body.axa_insurance.find(insurance =>
                    insurance.items.some(item => item.is_active === true),
                )

                const postBookingInsuranceLength = booking.response.body.axa_insurance.filter(
                    ({ source }) => source === 'post_booking',
                ).length
                if (postBookingInsuranceLength > 0) {
                    cy.step('C3991522 MMB displays order card for an already purchased Insurance')
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
                        cy.contains('[data-test="AxaInsurancePassengers-PassengerTile"]', 'TEST TEST')
                            .should('be.visible')
                            .within(() => {
                                cy.log('The "No insurance" option is not displayed as active')
                                cy.findByRole('button', { name: /No insurance/ })
                                    .should('be.visible')
                                    .and('not.have.class', '_active')
                                cy.log('The "Travel Plus" option is displayed as active')
                                cy.findByRole('button', { name: /Travel Plus/ })
                                    .should('be.visible')
                                    .and('have.class', '_active')
                            })
                        cy.findByTestId('ModalCloseButton').should('be.visible').click()
                    })
                cy.findByTestId('InsuranceModal').should('not.exist')

                cy.step(
                    'C3991524 The passenger can see the already purchased insurance level assigned in the MMB2 Passenger details page',
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
                                .and('contain', 'Travel Plus Insurance')
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
                            cy.contains('[data-test="AxaInsurancePassengers-PassengerTile"]', 'TEST TEST')
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

                    cy.step('C3991527 Refunded Insurance is reflected on the MMB2 Passenger details page')
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
                                .and('not.contain', 'Travel Plus Insurance')
                                .and('contain', 'None selected')
                        })
                })
                
                cy.step('C4010439 Correct Insurance level is pre-selected for a purchase')
                cy.findByTestId('InsuranceCard').within(() => {
                    cy.findByRole('link', { name: 'Manage' }).should('be.visible').click()
                })
                cy.wait('@ancillariesAxaInsurance').then(ancillariesAxaInsurance => {
                    /** Save the prices of Travel Basic and Travel Plus insurances (without processing fee) from the response */
                    const { amount: travelBasicPrice } =
                        ancillariesAxaInsurance.response.body.axa_insurance.offers[0].meta.options.find(
                            option => option.level === 'basic',
                        ).price
                    const { amount: travelPlusPrice } =
                        ancillariesAxaInsurance.response.body.axa_insurance.offers[0].meta.options.find(
                            option => option.level === 'plus',
                        ).price
                    cy.location('pathname').should('eq', `/en/manage/${bookingId}`)
                    cy.location('search').should('include', 'deeplink=insurance')
                    cy.findByTestId('InsuranceModal')
                        .should('be.visible')
                        .within(() => {
                            cy.findByRole('heading', { name: 'Insurance' }).should('be.visible')
                            cy.contains('[data-test="AxaInsurancePassengers-PassengerTile"]', 'TEST TEST')
                                .should('be.visible')
                                .within(() => {
                                    cy.log('The "No insurance" option is displayed as active')
                                    cy.findByRole('button', { name: /No insurance/ })
                                        .should('be.visible')
                                        .and('have.class', '_active')
                                    cy.log('Travel Basic insurance option is pre-selected')
                                    cy.findByRole('button', { name: /Travel Basic/ })
                                        .should('be.visible')
                                        .and('contain', `${travelBasicPrice}`)
                                        .and('have.class', '_selected')
                                    cy.log('Travel Plus insurance option is not pre-selected or active')
                                    cy.findByRole('button', { name: /Travel Plus/ })
                                        .should('be.visible')
                                        .and('contain', `${travelPlusPrice}`)
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
