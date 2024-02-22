import { checkCheckInStatus, checkHealthDeclarationRequirement } from '../../../support/apiClients'
import { CHECKIN_STATUS } from 'support/helpers/consts.js'
import { getBookingWithCondition, loadPage } from '../../../support/helpers'
import {
    interceptBookingDetails,
    interceptCheckInDetails,
    interceptPassengerDetails,
} from 'support/helpers/intercept.js'
import { FILTERS, formatDate } from 'support/helpers/filters.js'
describe('Online check-in - Declaration and passport submission', () => {
    it('C628621, C516948, C570020, C1724865, C254695, C2270725, C628619, C1449828, C234553, C628623, C516949, C4023057 - Successfully confirm Health declaration and submit passport details for an online check-in', () => {
        getBookingWithCondition({
            conditions: [
                FILTERS.CHECK_IN_WITHOUT_PASSPORT_DETAILS_SUBMITTED,
                FILTERS.SINGLE_PASSENGER,
            ],
            origin: 'EDI',
            destination: 'GLA',
            carriers: 'U2',
        }).then(({ bookingId, simpleToken }) => {
            interceptBookingDetails(bookingId)
            interceptCheckInDetails(bookingId)
            interceptPassengerDetails(bookingId)
            checkCheckInStatus({
                bookingId,
                simpleToken,
                expectedStatus: [CHECKIN_STATUS.PROVIDE_AP, CHECKIN_STATUS.WAITING_FOR_AP],
            })
            loadPage({
                bookingId,
                simpleToken,
                checkPage: false,
            })
            checkHealthDeclarationRequirement({ bookingId, simpleToken }).then(
                isHealthDeclarationRequired => {
                    cy.wait('@bookingDetails').then(bookingDetails => {
                        expect(bookingDetails.response.statusCode).eq(200)
                        const { segments } = bookingDetails.response.body.booking_details.boarding_passes
                        const numberOfSegmentsWithProvideStatus = segments.filter(
                            segment => segment.status === CHECKIN_STATUS.PROVIDE_AP,
                        ).length
                        const numberOfSegmentsWithWaitingForStatus = segments.filter(
                            segment => segment.status === CHECKIN_STATUS.WAITING_FOR_AP,
                        ).length

                        cy.step(
                            'C628621 Check-in banner is available when passport details were not added or the health declaration was not confirmed',
                        )
                        cy.findByTestId('CheckInBanner').within(() => {
                            cy.findByRole('heading', { name: 'Online check-in service' }).should('be.visible')
                            cy.findByTestId('CheckInDeadlineBadge').should('be.visible')
                            cy.findByRole('button', { name: 'Add check-in details' }).should('be.visible')
                        })

                        cy.step('C516948 Check-in & Boarding passes section shows "Details required" status')
                        cy.findByTestId('BoardingPasses')
                            .should('be.visible')
                            .within(() => {
                                if (numberOfSegmentsWithProvideApStatus) {
                                    cy.findAllByTestId('BoardingPassHeaderBadge-provide_ap')
                                        .should('be.visible')
                                        .and('have.length', numberOfSegmentsWithProvideApStatus)
                                        .and('contain', 'Details required for 1/1 passengers')
                                }
                                if (numberOfSegmentsWithWaitingForApStatus) {
                                    cy.findAllByTestId('BoardingPassHeaderBadge-waiting_for_ap')
                                        .should('be.visible')
                                        .and('have.length', numberOfSegmentsWithWaitingForApStatus)
                                        .and('contain', 'Details required for 1/1 passengers')
                                }
                            })
                    })

                    cy.step(
                        'C570020 Travel document card is not displayed in the Passenger details page section',
                    )
                    cy.findByTestId('PassengersCard')
                        .should('be.visible')
                        .within(() => {
                            cy.findByRole('heading', { name: 'Passenger details' }).should('be.visible')
                            cy.findByTestId(/PassengersCardTile/)
                                .should('be.visible')
                                .and('have.length', 1)
                                .within(() => {
                                    cy.findByRole('heading', { name: 'TEST TEST' }).should('be.visible')
                                })
                                .click()
                        })

                    cy.wait('@passengerDetails').then(passengerDetails => {
                        const { passengers } = passengerDetails.response.body
                        const passengerId = passengers[0].id
                        expect(passengers).to.have.length(1)
                        expect(passengers[0].travel_document).eq(null)
                        cy.location('pathname').should(
                            'eq',
                            `/en/trips/${bookingId}/passenger-details/${passengerId}/`,
                        )
                        cy.findByRole('heading', { name: 'Passenger details' }).should('be.visible')
                        cy.findByRole('tab', { name: 'TEST TEST' })
                            .should('be.visible')
                            .and('have.attr', 'aria-selected', 'true')
                        cy.findByTestId('TravelDocumentCard').should('not.exist')
                    })
                    cy.findByRole('link', { name: 'My trip' }).should('be.visible').click()

                    cy.step(
                        'C1724865 Users are offered extras before they are taken to the Check-in page',
                    )
                    cy.findByRole('button', { name: 'Add check-in details' }).should('be.visible').click()
                    cy.findByTestId('CheckInMonetizationModal')
                        .should('be.visible')
                        .within(() => {
                            cy.findByRole('heading', {
                                name: 'Avoid random seat selection and paying high fees for baggage',
                            }).should('be.visible')
                            cy.findByTestId('ProminentTile-baggage')
                                .contains('button', 'Buy baggage')
                                .should('be.visible')
                            cy.findByTestId('ProminentTile-seating')
                                .contains('button', 'Reserve seat')
                                .should('be.visible')
                        })

                    cy.step('C254695 Continue to check-in without purchasing recommended extras')
                    cy.findByTestId('CheckInMonetizationModal').should('be.visible')
                    cy.findByRole('button', { name: 'No thanks, continue to check-in' })
                        .should('be.visible')
                        .click()
                    if (isHealthDeclarationRequired) {

                        cy.step(
                            'C2270725 User is taken to the Health Declaration page first when Health declaration confirmation is required',
                        )
                        cy.location('pathname').should(
                            'eq',
                            `/en/trips/${bookingId}/check-in/health-declaration/`,
                        )
                        cy.findByRole('heading', { name: 'Read and confirm this health declaration' }).should(
                            'be.visible',
                        )
                        cy.findByTestId('HealthDeclarationRestrictions')
                            .should('be.visible')
                            .within(() => {
                                cy.findByRole('heading', {
                                    name: 'By continuing with check-in, I agree that I:',
                                }).should('be.visible')
                                cy.findByTestId('HealthDeclarationRestrictionsList').should('be.visible')
                                cy.findByText(
                                    /I declare that all passengers in my booking meet these requirements/i,
                                ).should('be.visible')
                            })

                        cy.step('C628619 Confirm Health declaration and continue to the Check-in page')
                        cy.findByRole('button', { name: 'Confirm & continue' }).should('be.visible').click()
                        cy.location('pathname').should('eq', `/en/trips/${bookingId}/check-in/documents/`)
                        cy.findByRole('heading', { name: 'Add your travel document details' }).should(
                            'be.visible',
                        )

                        cy.step(
                            'C1449828 User can return to the Health declaration page in order to re-read the information',
                        )
                        cy.findByRole('link', { name: 'Back' }).should('be.visible').click()
                        cy.location('pathname').should(
                            'eq',
                            `/en/trips/${bookingId}/check-in/health-declaration/`,
                        )
                        cy.findByRole('heading', { name: 'Read and confirm this health declaration' }).should(
                            'be.visible',
                        )
                        cy.findByRole('button', { name: 'Confirm & continue' }).should('be.visible').click()
                    }
                    cy.location('pathname').should('eq', `/en/trips/${bookingId}/check-in/documents/`)
                    cy.findByRole('heading', { name: 'Add your travel document details' }).should(
                        'be.visible',
                    )

                    cy.step(`Clicking the submit button triggers the passport form's validation`)
                    cy.findByTestId('PassengersTravelDocument').should('be.visible')
                    cy.findByRole('button', { name: 'Submit details' }).should('be.visible').click()
                    cy.findByTestId('DocumentNumberInput').should('have.attr', 'data-state', 'error')
                    cy.findByTestId('DateInput').should('have.attr', 'data-state', 'error')

                    cy.step('C234553 Passport details are added and submitted on the Check-in page')
                    cy.contains('[data-test=PassengersTravelDocument]', 'TEST TEST')
                        .should('be.visible')
                        .within(() => {
                            cy.findByTestId('DocumentNumberInput').type('DC123A456')
                            cy.findByTestId('DateInput-Date').type('20')
                            cy.findByTestId('DateInput-Month').select('December')
                            cy.findByTestId('DateInput-Year').type('2030')
                        })

                    cy.log('Submit the passport details')
                    cy.findByRole('button', { name: 'Submit details' }).should('be.visible').click()

                    /**
                     * Waiting for the check-in call and checking if the Expiration date
                     * and the document number were submitted correctly.
                     * If the Health declaration confirmation was required, checking if the Health declaration was confirmed.
                     */
                    cy.wait('@checkInDetails').then(checkin => {
                        expect(checkin.response.statusCode).eq(200)
                        expect(checkin.request.body.passengers[0].travel_document.identification_expiration).eq(
                            '2030-12-20',
                        )
                        expect(checkin.request.body.passengers[0].travel_document.identification_number).eq(
                            'DC123A456',
                        )
                        if (isHealthDeclarationRequired) {
                            expect(checkin.request.body.has_confirmed_health_declaration).eq(true)
                        }
                    })
                },
            )
            cy.location('pathname').should('eq', `/en/trips/${bookingId}/check-in/success/`)
            cy.findByRole('heading', {
                name: 'Thanks, we have everything we need to check you in',
                timeout: 40000,
            }).should('be.visible')
            interceptBookingDetails(bookingId)
            cy.log('Return to Manage Booking')
            cy.findByRole('link', { name: 'Back to my trip' }).should('be.visible').click()

            /**
             * Checking if the Check-in status is correct after confirming Health declaration/adding passport details.
             */
            cy.wait('@bookingDetails').then(bookingDetails => {
                const { segments } = bookingDetails.response.body.booking_details.boarding_passes
                expect(bookingDetails.response.statusCode).to.eq(200)
                expect(
                    segments.filter(segment => segment.status === CHECKIN_STATUS.PROVIDE_AP),
                ).to.have.length(0)
                const numberOfSegmentsWithWaitingForCheckinStatus = segments.filter(
                    segment => segment.status === CHECKIN_STATUS.WAITING_FOR_CHECKIN,
                ).length
                const numberOfSegmentsWithProcessingStatus = segments.filter(
                    segment => segment.status === CHECKIN_STATUS.PROCESSING,
                ).length

                cy.step(
                    'C628623 Check-in banner is not available after confirming Health declaration/adding passport details',
                )
                cy.findByTestId('BookingContent').should('be.visible')
                cy.findByTestId('CheckInBanner').should('not.exist')

                cy.step('C516949 Check-in & Boarding passes section shows correct final status')
                cy.findByTestId('BoardingPasses')
                    .should('be.visible')
                    .within(() => {
                        if (numberOfSegmentsWithWaitingForCheckinStatus) {
                            cy.findAllByTestId('BoardingPassHeaderBadge-waiting_for_checkin')
                                .should('be.visible')
                                .and('have.length', numberOfSegmentsWithWaitingForCheckinStatus)
                                .and('contain', 'Waiting for check-in')
                        }
                        if (numberOfSegmentsWithProcessingStatus) {
                            cy.findAllByTestId('BoardingPassHeaderBadge-processing')
                                .should('be.visible')
                                .and('have.length', numberOfSegmentsWithProcessingStatus)
                                .and('contain', 'Processing check-in')
                        }
                        cy.findByTestId('BoardingPassHeaderBadge-provide_ap').should('not.exist')
                    })
            })

            cy.step(
                'C4023057 Travel document card is displayed for all passengers who submitted travel document details',
            )
            cy.findByTestId('PassengersCard')
                .should('be.visible')
                .within(() => {
                    cy.findByRole('heading', { name: 'TEST TEST' }).should('be.visible').click()
                })
            cy.wait('@passengerDetails').then(passengerDetails => {
                const { passengers } = passengerDetails.response.body
                expect(passengers).to.have.length(1)
                const passengerId = passengers[0].id
                const { identification_number: identificationNumber, expiration_date: expirationDate } =
                    passengers[0].travel_document
                const expirationDateFormatted = formatDate({
                    originalDate: expirationDate,
                    isFormatLong: true,
                })
                expect(identificationNumber).eq('DC123A456')
                expect(expirationDate).eq('2030-12-20')
                cy.location('pathname').should(
                    'eq',
                    `/en/trips/${bookingId}/passenger-details/${passengerId}/`,
                )
                cy.findByRole('heading', { name: 'Passenger details' }).should('be.visible')
                cy.findByRole('tab', { name: 'TEST TEST' })
                    .should('be.visible')
                    .and('have.attr', 'aria-selected', 'true')
                cy.findByTestId('TravelDocumentCard')
                    .should('be.visible')
                    .within(() => {
                        cy.findByTestId('PassengerDataPiece-DocumentNumber')
                            .should('be.visible')
                            .and('contain', identificationNumber)
                        cy.findByTestId('PassengerDataPiece-DocumentExpiration')
                            .should('be.visible')
                            .and('contain', expirationDateFormatted)
                    })
            })
        })
    })
})