import {
	Meteor
} from 'meteor/meteor';
import {
	Launches
} from '../imports/launches.js';

if (Meteor.isServer) {
	Meteor.publish('launches', function() {
		return Launches.find();
	});

	SimpleRest.configure({
		collections: ['launchPerformance']
	});
}