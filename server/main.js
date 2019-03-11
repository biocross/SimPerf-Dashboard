import {
	Meteor
} from 'meteor/meteor';
import {
	Launches
} from '../imports/launches.js';

if (Meteor.isServer) {
	Meteor.publish('launches', function() {
		return Launches.find({ "$or" : [
			{ archived: false },
			{ archived : { "$exists" : false } }
		] }, { sort: { startTime: -1 }, limit: 5 });
	});

	SimpleRest.configure({
		collections: ['launchPerformance']
	});
}