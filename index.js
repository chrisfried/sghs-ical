var fs = require('fs'),
	ical = require('ical-generator'),
	parse = require('csv-parse'),
	async = require('async'),
	parsed,

	cal = ical({
			domain: 'springgrove.k12.mn.us',
			prodId: {company: 'SGHS', product: 'sghs-ical'},
			name: 'Test Calendar',
			timezone: 'America/Chicago'
	});
	
String.prototype.capitalize = function(){
	return this.toLowerCase().replace( /\b\w/g, function (m) {
		return m.toUpperCase();
	});
};

fs.readFile(__dirname + '/Student_Schedules.csv', function (err, data) {
  if (err) {
    throw err; 
  }
	parse(data.toString(), function (err, output) {
		var calendars = [];
		output.splice(0,1);
		async.each(output, function (line) {
			var event, sid = line[3].toString();
			calendars[sid] ? calendars[sid] : calendars[sid] = ical({
					domain: 'springgrove.k12.mn.us',
					prodId: {company: 'SGHS', product: 'sghs-ical'},
					name: line[1].toString().capitalize().trim() + ' ' + line[0].toString().capitalize().trim(),
					timezone: 'America/Chicago',
					events: [{
						start: new Date('September 8, 2015 11:38:00'),
						end: new Date('September 8, 2015 12:08:00'),
						timestamp: new Date(),
						summary: 'Lunch',
						location: 'Lunch Room',
						organizer: {
							name: 'Teacher',
							email: 'teacher@example.com'
						}
					}]
			});
			if (line[8]) {
				if ((line[6] == '1' || line[6] == '2' || line[6] == '3' || line[6] == '4') && (line[5] == 'Sem1' || line[5] == 'Sem2' || line[5] == 'Qtr1' || line[5] == 'Qtr2' || line[5] == 'Qtr3' || line[5] == 'Qtr4')) {
					event = calendars[sid].createEvent({
						timestamp: new Date(),
						summary: line[8].toString(),
						location: line[14].toString()
					});
					var startDate, endDate, startTime, endTime;
					if (line[5] == 'Sem1') {
						startDate = 'September 8, 2015';
						endDate = 'January 22, 2016';
					}
					if (line[5] == 'Qtr1') {
						startDate = 'September 8, 2015';
						endDate = 'November 6, 2015';
					}
					if (line[5] == 'Qtr2') {
						startDate = 'November 10, 2015';
						endDate = 'January 22, 2016';
					}
					if (line[5] == 'Sem2') {
						startDate = 'January 27, 2016';
						endDate = 'June 7, 2016';
					}
					if (line[5] == 'Qtr3') {
						startDate = 'January 27, 2016';
						endDate = 'April 1, 2016';
					}
					if (line[5] == 'Qtr4') {
						startDate = 'April 5, 2016';
						endDate = 'June 7, 2016';
					}
					if (line[6] == '1') {
						if (line[8].toString().indexOf("(A)") > -1) {
							startTime = '08:30:00';
							endTime = '09:12:00';
						} else if (line[8].toString().indexOf("(B)") > -1) {
							startTime = '09:14:00';
							endTime = '09:56:00';
						} else {
							startTime = '08:30:00';
							endTime = '09:56:00';
						}
					}
					if (line[6] == '2') {
						if (line[8].toString().indexOf("(A)") > -1) {
							startTime = '10:00:00';
							endTime = '10:30:00';
						} else if (line[8].toString().indexOf("(B)") > -1) {
							startTime = '10:34:00';
							endTime = '11:04:00';
						} else if (line[8].toString().indexOf("(C)") > -1) {
							startTime = '11:08:00';
							endTime = '11:38:00';
						} else {
							startTime = '10:00:00';
							endTime = '11:38:00';
						}
					}
					if (line[6] == '3') {
						if (line[8].toString().indexOf("(A)") > -1) {
							startTime = '12:12:00';
							endTime = '12:56:00';
						} else if (line[8].toString().indexOf("(B)") > -1) {
							startTime = '12:58:00';
							endTime = '13:42:00';
						} else {
							startTime = '12:12:00';
							endTime = '13:42:00';
						}
					}
					if (line[6] == '4') {
						if (line[11].toString().indexOf("(A)") > -1 || line[11].toString().indexOf("JR") > -1) {
							startTime = '13:46:00';
							endTime = '14:29:00';
						} else if (line[11].toString().indexOf("(B)") > -1 || line[11].toString().indexOf("PE/HLTH. 8") > -1 ) {
							startTime = '14:33:00';
							endTime = '15:16:00';
						} else {
							startTime = '13:46:00';
							endTime = '15:16:00';
						}
					}
					event.start(new Date(startDate + ' ' + startTime));
					event.end(new Date(startDate + ' ' + endTime));
					event.repeating({
						freq: 'WEEKLY',
						until: new Date(endDate + ' ' + endTime),
						byday: ['MO','TU','WE','TH','FR']
					});
					if (line[12]) {
						event.organizer({
							name: line[12].toString().capitalize().trim(),
							email: 'teacher@example.com'
						});
					} else {
						event.organizer({
							name: 'Teacher',
							email: 'teacher@example.com'
						});
					}
				} else {
					console.log('invalid period or semester: ' + line[0]);
				}
			}
			/* Period 4
			if (line[11]) {
				event = calendars[sid].createEvent({
					timestamp: new Date(),
					summary: line[11].toString(),
					location: line[13].toString()
				});
				if (line[11].toString().indexOf("(A)") > -1 || line[11].toString().indexOf("JR") > -1) {
					event.start(new Date('September 8, 2015 13:46:00'));
					event.end(new Date('September 8, 2015 14:29:00'));
				} else if (line[11].toString().indexOf("(B)") > -1 || line[11].toString().indexOf("PE/HLTH. 8") > -1 ) {
					event.start(new Date('September 8, 2015 14:33:00'));
					event.end(new Date('September 8, 2015 15:16:00'));
				} else {
					event.start(new Date('September 8, 2015 13:46:00'));
					event.end(new Date('September 8, 2015 15:16:00'));
				}
				if (line[12]) {
					event.organizer({
						name: line[12].toString().capitalize(),
						email: 'teacher@example.com'
					});
				} else {
					event.organizer({
						name: 'Teacher',
						email: 'teacher@example.com'
					});
				}
			} */
			calendars[sid].save(sid + '.ics');
		}, function (err) {
			if( err ) {
				console.log('A file failed to process');
			} else {
				console.log('All files have been processed successfully');
			}
		});
	});
});