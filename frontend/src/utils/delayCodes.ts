export interface DelayCode {
    code: string;
    iata: string;
    category: string;
    description: string;
}

export const DELAY_CODES: DelayCode[] = [
    // Others
    { code: '06', iata: 'OA', category: 'Others', description: 'NO GATE/STAND AVAILABILITY DUE TO OWN AIRLINE ACTIVITY' },
    { code: '09', iata: 'SG', category: 'Others', description: 'SCHEDULED GROUND TIME LESS THAN DECLARED MINIMUM GROUND TIME' },
    
    // Passenger and Baggage
    { code: '11', iata: 'PD', category: 'Passenger and Baggage', description: 'LATE CHECK-IN, acceptance after deadline' },
    { code: '12', iata: 'PL', category: 'Passenger and Baggage', description: 'LATE CHECK-IN, congestions in check-in area' },
    { code: '13', iata: 'PE', category: 'Passenger and Baggage', description: 'CHECK-IN ERROR, passenger and baggage' },
    { code: '14', iata: 'PO', category: 'Passenger and Baggage', description: 'OVERSALES, booking errors' },
    { code: '15', iata: 'PH', category: 'Passenger and Baggage', description: 'BOARDING, discrepancies and paging, missing checked-in passenger' },
    { code: '16', iata: 'PS', category: 'Passenger and Baggage', description: 'COMMERCIAL PUBLICITY/PASSENGER CONVENIENCE, VIP, press, ground meals and missing personal items' },
    { code: '17', iata: 'PC', category: 'Passenger and Baggage', description: 'CATERING ORDER, late or incorrect order given to supplier' },
    { code: '18', iata: 'PB', category: 'Passenger and Baggage', description: 'BAGGAGE PROCESSING, sorting etc.' },
    { code: '19', iata: 'PW', category: 'Passenger and Baggage', description: 'REDUCED MOBILITY, boarding / deboarding of passengers with reduced mobility' },

    // Cargo and Mail
    { code: '21', iata: 'CD', category: 'Cargo and Mail', description: 'DOCUMENTATION, errors etc.' },
    { code: '22', iata: 'CP', category: 'Cargo and Mail', description: 'LATE POSITIONING' },
    { code: '23', iata: 'CC', category: 'Cargo and Mail', description: 'LATE ACCEPTANCE' },
    { code: '24', iata: 'CI', category: 'Cargo and Mail', description: 'INADEQUATE PACKING' },
    { code: '25', iata: 'CO', category: 'Cargo and Mail', description: 'OVERSALES, booking errors' },
    { code: '26', iata: 'CU', category: 'Cargo and Mail', description: 'LATE PREPARATION IN WAREHOUSE' },
    { code: '27', iata: 'CE', category: 'Cargo and Mail', description: 'DOCUMENTATION, PACKING etc (Mail Only)' },
    { code: '28', iata: 'CL', category: 'Cargo and Mail', description: 'LATE POSITIONING (Mail Only)' },
    { code: '29', iata: 'CA', category: 'Cargo and Mail', description: 'LATE ACCEPTANCE (Mail Only)' },

    // Aircraft and Ramp Handling
    { code: '31', iata: 'GD', category: 'Aircraft and Ramp Handling', description: 'AIRCRAFT DOCUMENTATION LATE/INACCURATE, weight and balance, general declaration, pax manifest, etc.' },
    { code: '32', iata: 'GL', category: 'Aircraft and Ramp Handling', description: 'LOADING/UNLOADING, bulky, special load, cabin load, lack of loading staff' },
    { code: '33', iata: 'GE', category: 'Aircraft and Ramp Handling', description: 'LOADING EQUIPMENT, lack of or breakdown, e.g. container pallet loader, lack of staff' },
    { code: '34', iata: 'GS', category: 'Aircraft and Ramp Handling', description: 'SERVICING EQUIPMENT, lack of or breakdown, lack of staff, e.g. steps' },
    { code: '35', iata: 'GC', category: 'Aircraft and Ramp Handling', description: 'AIRCRAFT CLEANING' },
    { code: '36', iata: 'GF', category: 'Aircraft and Ramp Handling', description: 'FUELLING/DEFUELLING, fuel supplier' },
    { code: '37', iata: 'GB', category: 'Aircraft and Ramp Handling', description: 'CATERING, late delivery or loading' },
    { code: '38', iata: 'GU', category: 'Aircraft and Ramp Handling', description: 'ULD, lack of or serviceability' },
    { code: '39', iata: 'GT', category: 'Aircraft and Ramp Handling', description: 'TECHNICAL EQUIPMENT, lack of or breakdown, lack of staff, e.g. pushback' },

    // Technical and Aircraft Equipment
    { code: '41', iata: 'TD', category: 'Technical and Aircraft Equipment', description: 'AIRCRAFT DEFECTS.' },
    { code: '42', iata: 'TM', category: 'Technical and Aircraft Equipment', description: 'SCHEDULED MAINTENANCE, late release.' },
    { code: '43', iata: 'TN', category: 'Technical and Aircraft Equipment', description: 'NON-SCHEDULED MAINTENANCE, special checks and/or additional works beyond normal maintenance schedule.' },
    { code: '44', iata: 'TS', category: 'Technical and Aircraft Equipment', description: 'SPARES AND MAINTENANCE EQUIPMENT, lack of or breakdown.' },
    { code: '45', iata: 'TA', category: 'Technical and Aircraft Equipment', description: 'AOG SPARES, to be carried to another station.' },
    { code: '46', iata: 'TC', category: 'Technical and Aircraft Equipment', description: 'AIRCRAFT CHANGE, for technical reasons.' },
    { code: '47', iata: 'TL', category: 'Technical and Aircraft Equipment', description: 'STAND-BY AIRCRAFT, lack of planned stand-by aircraft for technical reasons.' },
    { code: '48', iata: 'TV', category: 'Technical and Aircraft Equipment', description: 'SCHEDULED CABIN CONFIGURATION/VERSION ADJUSTMENTS.' },

    // Damage to Aircraft & EDP/Automated Equipment Failure
    { code: '51', iata: 'DF', category: 'Damage to Aircraft & Equipment Failure', description: 'DAMAGE DURING FLIGHT OPERATIONS, bird or lightning strike, turbulence, heavy or overweight landing, collision during taxiing' },
    { code: '52', iata: 'DG', category: 'Damage to Aircraft & Equipment Failure', description: 'DAMAGE DURING GROUND OPERATIONS, collisions (other than during taxiing), loading/off-loading damage, contamination, towing, extreme weather conditions' },
    { code: '55', iata: 'ED', category: 'Damage to Aircraft & Equipment Failure', description: 'DEPARTURE CONTROL' },
    { code: '56', iata: 'EC', category: 'Damage to Aircraft & Equipment Failure', description: 'CARGO PREPARATION/DOCUMENTATION' },
    { code: '57', iata: 'EF', category: 'Damage to Aircraft & Equipment Failure', description: 'FLIGHT PLANS' },
    { code: '58', iata: 'EO', category: 'Damage to Aircraft & Equipment Failure', description: 'OTHER AUTOMATED SYSTEM' },

    // Flight Operations and Crewing
    { code: '61', iata: 'FP', category: 'Flight Operations and Crewing', description: 'FLIGHT PLAN, late completion or change of, flight documentation' },
    { code: '62', iata: 'FF', category: 'Flight Operations and Crewing', description: 'OPERATIONAL REQUIREMENTS, fuel, load alteration' },
    { code: '63', iata: 'FT', category: 'Flight Operations and Crewing', description: 'LATE CREW BOARDING OR DEPARTURE PROCEDURES, other than connection and standby (flight deck or entire crew)' },
    { code: '64', iata: 'FS', category: 'Flight Operations and Crewing', description: 'FLIGHT DECK CREW SHORTAGE, sickness, awaiting standby, flight time limitations, crew meals, valid visa, health documents, etc.' },
    { code: '65', iata: 'FR', category: 'Flight Operations and Crewing', description: 'FLIGHT DECK CREW SPECIAL REQUEST, not within operational requirements' },
    { code: '66', iata: 'FL', category: 'Flight Operations and Crewing', description: 'LATE CABIN CREW BOARDING OR DEPARTURE PROCEDURES, other than connection and standby' },
    { code: '67', iata: 'FC', category: 'Flight Operations and Crewing', description: 'CABIN CREW SHORTAGE, sickness, awaiting standby, flight time limitations, crew meals, valid visa, health documents, etc.' },
    { code: '68', iata: 'FA', category: 'Flight Operations and Crewing', description: 'CABIN CREW ERROR OR SPECIAL REQUEST, not within operational requirements' },
    { code: '69', iata: 'FB', category: 'Flight Operations and Crewing', description: 'CAPTAIN REQUEST FOR SECURITY CHECK, extraordinary' },

    // Weather
    { code: '71', iata: 'WO', category: 'Weather', description: 'DEPARTURE STATION' },
    { code: '72', iata: 'WT', category: 'Weather', description: 'DESTINATION STATION' },
    { code: '73', iata: 'WR', category: 'Weather', description: 'EN ROUTE OR ALTERNATE' },
    { code: '75', iata: 'WI', category: 'Weather', description: 'DE-ICING OF AIRCRAFT, removal of ice and/or snow, frost prevention excluding unserviceability of equipment' },
    { code: '76', iata: 'WS', category: 'Weather', description: 'REMOVAL OF SNOW, ICE, WATER AND SAND FROM AIRPORT' },
    { code: '77', iata: 'WG', category: 'Weather', description: 'GROUND HANDLING IMPAIRED BY ADVERSE WEATHER CONDITIONS' },

    // ATFM + Airport + Governmental Authorities
    { code: '81', iata: 'AT', category: 'ATFM + Airport + Governmental Authorities', description: 'ATFM due to ATC EN-ROUTE DEMAND/CAPACITY, standard demand/capacity problems' },
    { code: '82', iata: 'AX', category: 'ATFM + Airport + Governmental Authorities', description: 'ATFM due to ATC STAFF/EQUIPMENT EN-ROUTE, reduced capacity caused by industrial action or staff shortage, equipment failure, military exercise or extraordinary demand due to capacity reduction in neighbouring area' },
    { code: '83', iata: 'AE', category: 'ATFM + Airport + Governmental Authorities', description: 'ATFM due to RESTRICTION AT DESTINATION AIRPORT, airport and/or runway closed due to obstruction, industrial action, staff shortage, political unrest, noise abatement, night curfew, special flights' },
    { code: '84', iata: 'AW', category: 'ATFM + Airport + Governmental Authorities', description: 'ATFM due to WEATHER AT DESTINATION' },
    { code: '85', iata: 'AS', category: 'ATFM + Airport + Governmental Authorities', description: 'MANDATORY SECURITY' },
    { code: '86', iata: 'AG', category: 'ATFM + Airport + Governmental Authorities', description: 'IMMIGRATION, CUSTOMS, HEALTH' },
    { code: '87', iata: 'AF', category: 'ATFM + Airport + Governmental Authorities', description: 'AIRPORT FACILITIES, parking stands, ramp congestion, lighting, buildings, gate limitations, etc.' },
    { code: '88', iata: 'AD', category: 'ATFM + Airport + Governmental Authorities', description: 'RESTRICTIONS AT AIRPORT OF DESTINATION, airport and/or runway closed due to obstruction, industrial action, staff shortage, political unrest, noise abatement, night curfew, special flights' },
    { code: '89', iata: 'AM', category: 'ATFM + Airport + Governmental Authorities', description: 'RESTRICTIONS AT AIRPORT OF DEPARTURE WITH OR WITHOUT ATFM RESTRICTIONS, including Air Traffic Services, start-up and pushback, airport and/or runway closed due to obstruction or weather, industrial action, staff shortage, political unrest, noise abatement, night curfew, special flights' },

    // Reactionary
    { code: '91', iata: 'RL', category: 'Reactionary', description: 'LOAD CONNECTION, awaiting load from another flight' },
    { code: '92', iata: 'RT', category: 'Reactionary', description: 'THROUGH CHECK-IN ERROR, passenger and baggage' },
    { code: '93', iata: 'RA', category: 'Reactionary', description: 'AIRCRAFT ROTATION, late arrival of aircraft from another flight or previous sector' },
    { code: '94', iata: 'RS', category: 'Reactionary', description: 'CABIN CREW ROTATION, awaiting cabin crew from another flight' },
    { code: '95', iata: 'RC', category: 'Reactionary', description: 'CREW ROTATION, awaiting crew from another flight (flight deck or entire crew)' },
    { code: '96', iata: 'RO', category: 'Reactionary', description: 'OPERATIONS CONTROL, re-routing, diversion, consolidation, aircraft change for reasons other than technical' },

    // Miscellaneous
    { code: '97', iata: 'MI', category: 'Miscellaneous', description: 'INDUSTRIAL ACTION WITH OWN AIRLINE' },
    { code: '98', iata: 'MO', category: 'Miscellaneous', description: 'INDUSTRIAL ACTION OUTSIDE OWN AIRLINE, excluding ATS' },
    { code: '99', iata: 'MX', category: 'Miscellaneous', description: 'OTHER REASON, not matching any code above' }
];
