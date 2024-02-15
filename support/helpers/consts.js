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
    bags: { displayTextMMB2: 'Baggage' },
    booking: { displayTextMMB2: 'Booking' },
    flights: { displayTextMMB2: 'Change flights' },
    guarantee: { displayTextMMB2: 'Kiwi.com Guarantee' },
    update_insurances: { displayTextMMB2: 'Insurance' },
    passenger_details_change: { displayTextMMB2: 'Passenger changes' },
    seating: { displayTextMMB2: 'Seat selection' },
    service_package: { displayTextMMB2: 'Kiwi.com Services' },
}
export const CHECKIN_STATUS = {
    PROCESSING: 'processing',
    PROVIDE_APAXI: 'provide_apaxi',
    PROVIDE_DETAILS: 'provide_details',
    UNAVAILABLE: 'unavailable',
    WAITING_FOR_APAXI: 'waiting_for_apaxi',
    WAITING_FOR_CHECKIN: 'waiting_for_checkin',
    WAITING_FOR_DETAILS: 'waiting_for_details',
}