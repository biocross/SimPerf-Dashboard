import {
	Meteor
} from 'meteor/meteor';
import {
	Mongo
} from 'meteor/mongo';

export const Launches = new Mongo.Collection('launchPerformance');

Meteor.methods({
  'initLaunch'(body) {
    var launchObject = {};

    console.log("Hello");

	launchObject.startTime = Date.now();
	launchObject.deviceInfo = {};
	launchObject.details = [];
	launchObject.finished = false;

	Launches.insert(launchObject);

	return "200 k dude";
  },
  'addLaunchData'(body) {
    var launchObject = Launches.findOne({
		finished: false
	}, {
		sort: {
			startTime: -1
		}
	});

	if (!body || !launchObject) {
		return;
	}

	Launches.update({
		_id: launchObject._id
	}, {
		$push: {
			details: body
		}
	});

	var updatedLaunch = Launches.findOne({
		finished: false
	}, {
		sort: {
			startTime: -1
		}
	});
	if (updatedLaunch.details.length == 5) {

		/// Generate summary
		var averages = {};
		var eventTypes = updatedLaunch.details[0].length;
		updatedLaunch.details[0].forEach(function(element) {
			averages[element[0]] = [];
		});

		updatedLaunch.details.forEach(function(parentArray) {
			parentArray.forEach(function(element) {
				averages[element[0]].push(element[3]);
			});
		});

		var nameVsTime = [];

		var keys = Object.keys(averages);
		keys.forEach(function(key) {
			var array = averages[key];
			var sum = 0;
			array.forEach(function(duration) {
				sum += duration;
			});

			var finalObject = {};
			finalObject.name = key;
			finalObject.average = sum / array.length;
			nameVsTime.push(finalObject);
		});

		Launches.update({
			_id: updatedLaunch._id
		}, {
			$set: {
				finished: true,
				summary: nameVsTime
			}
		});
	}

	return updatedLaunch;
  }
});

/// New Test Init in DB
// Meteor.method("initLaunch", function(body) {
// 	var launchObject = {}

// 	launchObject.startTime = Date.now();
// 	launchObject.deviceInfo = {};
// 	launchObject.details = [];
// 	launchObject.finished = false;

// 	Launches.insert(launchObject);

// 	return "200 k dude";
// }, {
// 	url: "initLaunch",
// 	getArgsFromRequest: function(request) {
// 		return [request.body];
// 	}
// });

/// Add Single Launch Data to an Exisiting Launch in DB
// Meteor.method("addLaunchData", function(body) {
// 	var launchObject = Launches.findOne({
// 		finished: false
// 	}, {
// 		sort: {
// 			startTime: -1
// 		}
// 	});

// 	if (!body || !launchObject) {
// 		return;
// 	}

// 	Launches.update({
// 		_id: launchObject._id
// 	}, {
// 		$push: {
// 			details: body
// 		}
// 	});

// 	var updatedLaunch = Launches.findOne({
// 		finished: false
// 	}, {
// 		sort: {
// 			startTime: -1
// 		}
// 	});
// 	if (updatedLaunch.details.length == 5) {

// 		/// Generate summary
// 		var averages = {};
// 		var eventTypes = updatedLaunch.details[0].length;
// 		updatedLaunch.details[0].forEach(function(element) {
// 			averages[element[0]] = [];
// 		});

// 		updatedLaunch.details.forEach(function(parentArray) {
// 			parentArray.forEach(function(element) {
// 				averages[element[0]].push(element[3]);
// 			});
// 		});

// 		var nameVsTime = [];

// 		var keys = Object.keys(averages);
// 		keys.forEach(function(key) {
// 			var array = averages[key];
// 			var sum = 0;
// 			array.forEach(function(duration) {
// 				sum += duration;
// 			});

// 			var finalObject = {};
// 			finalObject.name = key;
// 			finalObject.average = sum / array.length;
// 			nameVsTime.push(finalObject);
// 		});

// 		Launches.update({
// 			_id: updatedLaunch._id
// 		}, {
// 			$set: {
// 				finished: true,
// 				summary: nameVsTime
// 			}
// 		});
// 	}

// 	return updatedLaunch;
// }, {
// 	url: "addLaunchData",
// 	getArgsFromRequest: function(request) {
// 		return [request.body.launchData];
// 	}
// });