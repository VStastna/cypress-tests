export const DEEPLINKS = {
    SEATING: 'seating',
    INVOICES: 'invoices',
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
}
export const INVOICE_TYPE = {
    bags: { displayText: 'Baggage' },
    booking: { displayText: 'Booking' },
    flights: { displayText: 'Change flights' },
    guarantee: { displayText: 'Kiwi.com Guarantee' },
    update_insurances: { displayText: 'Insurance' },
    passenger_details_change: { displayText: 'Passenger changes' },
    seating: { displayText: 'Seat selection' },
    service_package: { displayText: 'Kiwi.com Services' },
}
export const CHECKIN_STATUS = {
    PROCESSING: 'processing',
    PROVIDE_AP: 'provide_ap',
    PROVIDE_DETAILS: 'provide_details',
    UNAVAILABLE: 'unavailable',
    WAITING_FOR_AP: 'waiting_for_ap',
    WAITING_FOR_CHECKIN: 'waiting_for_checkin',
    WAITING_FOR_DETAILS: 'waiting_for_details',
}