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

		Launches.update({
			_id: launchObject._id
		}, {
				details: launchInfo.details,
				device: launchInfo.device,
				startTime: launchInfo.startTime,
				finished: true
			});
	}, 

	'deleteRun'(id) {
		// Launches.remove(id);
		let launch = Launches.findOne(id);
		Launches.update(id, {...launch,
			archived: true
		});
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