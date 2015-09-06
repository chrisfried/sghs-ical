var fs = require('fs'),
	ical = require('ical-generator'),
	parse = require('csv-parse'),
	async = require('async'),
	noSchool = require('./no-school.json'),
	parsed;
	
String.prototype.capitalize = function(){
	return this.toLowerCase().replace( /\b\w/g, function (m) {
		return m.toUpperCase();
	});
};

// Function to exclude days from recurring events
function excludedDateTime(dates,time) {
	var excludedDates = new Array();
	dates.forEach(function(date) {
		var dateTime = date.date + ' ' + time;
		excludedDates.push(new Date(dateTime));
	});
	return excludedDates;
}

// Export 'Reference Cards' from JMC to './Student_Schedules.csv'
fs.readFile(__dirname + '/Student_Schedules.csv', function (err, data) {
  if (err) {
    throw err; 
  }
	parse(data.toString(), function (err, output) {
		var calendars = [];
		output.splice(0,1);
		async.each(output, function (line) {
			var event, sid = line[3].toString();
			if (!calendars[sid]) {
				calendars[sid] = ical({
					domain: 'springgrove.k12.mn.us',
					prodId: {company: 'SGHS', product: 'sghs-ical'},
					name: line[1].toString().capitalize().trim() + ' ' + line[0].toString().capitalize().trim(),
					timezone: 'America/Chicago',
					// Lunch - 3 events, because DST
					events: [{
						start: new Date('September 8, 2015 11:38:00'),
						end: new Date('September 8, 2015 12:08:00'),
						timestamp: new Date(),
						summary: 'Lunch',
						location: 'Lunch Room',
						organizer: {
							name: 'Teacher',
							email: 'teacher@example.com'
						},
						repeating: {
							freq: 'WEEKLY',
							until: new Date('November 1, 2015 12:08:00'),
							byday: ['MO','TU','WE','TH','FR'],
							excludeDates: excludedDateTime(noSchool, '11:38:00')
						}
					},{
						start: new Date('November 2, 2015 11:38:00'),
						end: new Date('November 2, 2015 12:08:00'),
						timestamp: new Date(),
						summary: 'Lunch',
						location: 'Lunch Room',
						organizer: {
							name: 'Teacher',
							email: 'teacher@example.com'
						},
						repeating: {
							freq: 'WEEKLY',
							until: new Date('March 13, 2016 12:08:00'),
							byday: ['MO','TU','WE','TH','FR'],
							excludeDates: excludedDateTime(noSchool, '11:38:00')
						}
					},{
						start: new Date('March 14, 2016 11:38:00'),
						end: new Date('March 14, 2016 12:08:00'),
						timestamp: new Date(),
						summary: 'Lunch',
						location: 'Lunch Room',
						organizer: {
							name: 'Teacher',
							email: 'teacher@example.com'
						},
						repeating: {
							freq: 'WEEKLY',
							until: new Date('June 7, 2016 12:08:00'),
							byday: ['MO','TU','WE','TH','FR'],
							excludeDates: excludedDateTime(noSchool, '11:38:00')
						}
					}]
				});
			
				noSchool.forEach(function(day){
					event = calendars[sid].createEvent({
						timestamp: new Date(),
						summary: day.label,
						start: new Date(day.date),
						end: new Date(day.date),
						allDay: true
					})
				});
			}
			
			if (line[8]) {
				if ((line[6] == '1' || line[6] == '2' || line[6] == '3' || line[6] == '4') && (line[5] == 'Sem1' || line[5] == 'Sem2' || line[5] == 'Qtr1' || line[5] == 'Qtr2' || line[5] == 'Qtr3' || line[5] == 'Qtr4')) {
					event = calendars[sid].createEvent({
						timestamp: new Date(),
						summary: line[8].toString(),
						location: line[14].toString().capitalize().trim()
					});
					var startDate, endDate, startTime, endTime, endDaylight, startDaylight;
					if (line[5] == 'Sem1') {
						startDate = 'September 8, 2015';
						endDaylight = 'November 1, 2015';
						startDaylight = 'November 2, 2015';
						endDate = 'January 22, 2016';
					}
					if (line[5] == 'Qtr1') {
						startDate = 'September 8, 2015';
						endDaylight = 'November 1, 2015';
						startDaylight = 'November 2, 2015';
						endDate = 'November 6, 2015';
					}
					if (line[5] == 'Qtr2') {
						startDate = 'November 10, 2015';
						endDate = 'January 22, 2016';
					}
					if (line[5] == 'Sem2') {
						startDate = 'January 27, 2016';
						endDaylight = 'March 13, 2016';
						startDaylight = 'March 14, 2016';
						endDate = 'June 7, 2016';
					}
					if (line[5] == 'Qtr3') {
						startDate = 'January 27, 2016';
						endDaylight = 'March 13, 2016';
						startDaylight = 'March 14, 2016';
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
						if (line[11].toString().indexOf("(A)") > -1) {
							startTime = '13:46:00';
							endTime = '14:29:00';
						} else if (line[11].toString().indexOf("(B)") > -1) {
							startTime = '14:33:00';
							endTime = '15:16:00';
						} else {
							startTime = '13:46:00';
							endTime = '15:16:00';
						}
					}
					event.start(new Date(startDate + ' ' + startTime));
					event.end(new Date(startDate + ' ' + endTime));
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
					if (endDaylight) {
						event.repeating({
							freq: 'WEEKLY',
							until: new Date(endDaylight + ' ' + endTime),
							byday: ['MO','TU','WE','TH','FR'],
							excludeDates: excludedDateTime(noSchool, startTime)
						});
						
						// Copy event for DST switch
						var event2 = calendars[sid].createEvent({
							timestamp: event.timestamp(),
							summary: event.summary(),
							location: event.location(),
							organizer: event.organizer()
						});
						event2.start(new Date(startDaylight + ' ' + startTime));
						event2.end(new Date(startDaylight + ' ' + endTime));
						event2.repeating({
							freq: 'WEEKLY',
							until: new Date(endDate + ' ' + endTime),
							byday: ['MO','TU','WE','TH','FR'],
							excludeDates: excludedDateTime(noSchool, startTime)
						});
					}
					
					else {
						event.repeating({
							freq: 'WEEKLY',
							until: new Date(endDate + ' ' + endTime),
							byday: ['MO','TU','WE','TH','FR'],
							excludeDates: excludedDateTime(noSchool, startTime)
						});
					}
				} else {
					console.log('invalid period or semester: ' + line[0]);
				}
			}
			calendars[sid].save('calendars/' + sid + '.ics');
		}, function (err) {
			if( err ) {
				console.log('A file failed to process');
			} else {
				console.log('All files have been processed successfully');
			}
		});
	});
});