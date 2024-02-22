// helper functions
const hasCheckInStatus = (status, booking) =>
    booking.checkin.segments.some(segment => segment.status === status)
const hasInsuranceLevel = (level, booking) =>
    booking.passengers.every(passenger => passenger.insurance_type === level)
const hasMaxPassengers = (maxPassengers, booking) => booking.passengers.length <= maxPassengers
)
const hasNoPassportDetails = booking =>
    booking.passengers.every(passenger => passenger.document_number === null)
const getCheckInWithoutPassportDetailsSubmitted = booking =>
    hasCheckInStatus('provide_ap', booking) && hasNoPassportDetails(booking)
const getPlusInsurance = booking => hasInsuranceLevel('plus', booking)
const getSinglePassenger = booking => hasMaxPassengers(1, booking)
const getWithNonUsPassengers = booking =>
    booking.passengers.every(passenger => passenger.nationality !== 'us')
export const FILTERS = {
    CHECK_IN_WITHOUT_PASSPORT_DETAILS_SUBMITTED: 'checkInApaxiWithoutPassportDetailsSubmitted',
    NON_US_PASSENGERS: 'nonUsPassengers',
    PLUS_INSURANCE: 'plusInsurance',
    SINGLE_PASSENGER: 'singlePassenger',
}
const filters = {
    [FILTERS.CHECK_IN_WITHOUT_PASSPORT_DETAILS_SUBMITTED]:
    getCheckInWithoutPassportDetailsSubmitted,
    [FILTERS.NON_US_PASSENGERS]: getWithNonUsPassengers,
    [FILTERS.PLUS_INSURANCE]: getPlusInsurance,
    [FILTERS.SINGLE_PASSENGER]: getSinglePassenger,
}
export const getFilters = conditions => conditions.map(condition => filters[condition])