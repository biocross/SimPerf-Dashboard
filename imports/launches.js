import {
	Meteor
} from 'meteor/meteor';
import {
	Mongo
} from 'meteor/mongo';

export const Launches = new Mongo.Collection('launchPerformance');

Meteor.methods({
	'addLaunchData'(launchInfo) {

		if (!launchInfo || !launchInfo.details || launchInfo.details.length == 0) {
			return
		}

		var launchObject = {};

		launchObject.startTime = Date.now();
		launchObject.deviceInfo = {};
		launchObject.details = [];
		launchObject.finished = false;

		Launches.insert(launchObject);

		var launchObject = Launches.findOne({ finished: false }, {
			sort: {
				startTime: -1
			}
		});

		if (!launchObject) {
			return;
		}

		launchInfo.details.forEach(element => {
			element[1] = element[1] - launchInfo.startTime;
		});

		var carrier = {};
		var metrics = [];
		
		if(launchInfo.carrier) {
			carrier = launchInfo.carrier;
		}

		if(launchInfo.metrics) {
			metrics = launchInfo.metrics;
		}

		Launches.update({
			_id: launchObject._id
		}, {
				details: launchInfo.details,
				device: launchInfo.device,
				startTime: launchInfo.startTime,
				carrier: carrier,
				metrics: metrics,
				finished: true
			});
	}, 

	'deleteRun'(id) {
		let launch = Launches.findOne(id);
		if(launch.isSnapshot !== true) {
			Launches.update(id, {...launch,
				archived: true
			});
		}
	},

	'setSnapshot'(id) {
		let launch = Launches.findOne(id);
		Launches.update(id, {...launch,
			isSnapshot: !launch.isSnapshot
		});
	},

	'setComment'(data) {
		let launch = Launches.findOne(data.id);
		Launches.update(data.id, {...launch,
			comment: data.comment
		});
	}
});