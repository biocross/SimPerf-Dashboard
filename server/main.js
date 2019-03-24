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
		] }, { sort: { startTime: -1 }, limit: 10 });
	});

	// Meteor.publish('launches', function() {
	// 	return Launches.find({ isSnapshot: true}, { sort: { startTime: -1 }, limit: 50 });
	// });

	SimpleRest.configure({
		collections: ['launchPerformance']
	});
}