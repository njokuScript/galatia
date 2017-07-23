import moment from 'moment'
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import SearchResult from '../components/FlightSearch/SearchResult';

const entitiesSelector = state => state.search.response.entities;

const tripResponseSelector = createSelector(
    entitiesSelector,
    (entities) => entities.responses['qpxExpress#tripsSearch']
)

const tripOptionIdsSelector = createSelector(
    entitiesSelector,
    tripResponseSelector,
    (entities, tripResponse) => (tripResponse && entities.trips[tripResponse.trips].tripOption) || []
)

const getDetails = (entities, tripOptionIds) => {
    const flightDetails = [];
    const tripOptions = entities.tripOptions;
    const carriers = entities.carriers;
    const airports = entities.airports;
    const cities = entities.cities;

    for (let tripOptionId of tripOptionIds) {
        var tripOption = tripOptions[tripOptionId];
        const flightDetail = {
            id: tripOptionId,
            saleTotal: tripOption.saleTotal,
            segments: []
        };

        for (let slice of tripOption.slice) {
            flightDetail.duration = slice.duration;

            for (let segment of slice.segment) {
                const leg = segment.leg[0];
                flightDetail.segments.push({
                    id: segment.id,
                    duration: segment.duration,
                    flightNumber: segment.flight.carrier + "-" + segment.flight.number,
                    carrier: carriers[segment.flight.carrier].name,
                    arrivalTime: moment(leg.arrivalTime).format('LT'),
                    arrivalDate: moment(leg.arrivalTime).format('ll'),
                    departureTime: moment(leg.departureTime).format('LT'),
                    departureDate: moment(leg.departureTime).format('ll'),
                    originAirport: airports[leg.origin].name,
                    originalCity: cities[airports[leg.origin].city].name,
                    destinationAirport: airports[leg.destination].name,
                    destinationCity: cities[airports[leg.destination].city].name,
                    cabin: segment.cabin
                })
            }
        }
        flightDetails.push(flightDetail);
    }
    return flightDetails;
}

const detailsSelector = createSelector(
    entitiesSelector, tripOptionIdsSelector,
    getDetails
)

const mapStateToProps = state => {
    return {
        details: detailsSelector(state),
        isLoading: state.search.isLoading
    }
};

export default connect(mapStateToProps)(SearchResult);