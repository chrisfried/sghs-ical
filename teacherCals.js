var fs = require('fs'),
	ical = require('ical-generator'),
	parse = require('csv-parse'),
	async = require('async'),
	noSchool = require('./variables/no-school.json'),
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

// Export 'Course Data List'->'Course Sections Export' from JMC to './SectionList.csv'
fs.readFile(__dirname + '/SectionList.csv', function (err, data) {
  if (err) {
    throw err; 
  }
	parse(data.toString(), function (err, output) {
		output.splice(0,1);
		
		var calendars = new Array();
		
		async.each(output, function (line) {
			var event, teacherNumber = line[6].toString(), name = line[7].toString().capitalize().trim();
			
			if (!calendars[teacherNumber]) {
			  calendars[teacherNumber] = ical({
					domain: 'springgrove.k12.mn.us',
					prodId: {company: 'SGHS', product: 'sghs-ical'},
					name: name + '\'s Calendar',
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
							exdate: excludedDateTime(noSchool.dates, '11:38:00')
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
							exdate: excludedDateTime(noSchool.dates, '11:38:00')
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
							exdate: excludedDateTime(noSchool.dates, '11:38:00')
						}
					}]
				});
			
				noSchool.dates.forEach(function(day){
					event = calendars[teacherNumber].createEvent({
						timestamp: new Date(),
						summary: day.label,
						start: new Date(day.date),
						end: new Date(day.date),
						allDay: true
					})
				});
			}
			
			if (line[10]) {
				if ((line[4] == '1' || line[4] == '2' || line[4] == '3' || line[4] == '4') && (line[3] == 'Sem 1' || line[3] == 'Sem 2' || line[3] == 'Qtr 1' || line[3] == 'Qtr 2' || line[3] == 'Qtr 3' || line[3] == 'Qtr 4')) {
					event = calendars[teacherNumber].createEvent({
						timestamp: new Date(),
						summary: line[10].toString(),
						location: line[9].toString().capitalize().trim()
					});
					var startDate, endDate, startTime, endTime, endDaylight, startDaylight;
					if (line[3] == 'Sem 1') {
						startDate = 'September 8, 2015';
						endDaylight = 'November 1, 2015';
						startDaylight = 'November 2, 2015';
						endDate = 'January 22, 2016';
					}
					if (line[3] == 'Qtr 1') {
						startDate = 'September 8, 2015';
						endDaylight = 'November 1, 2015';
						startDaylight = 'November 2, 2015';
						endDate = 'November 6, 2015';
					}
					if (line[3] == 'Qtr 2') {
						startDate = 'November 10, 2015';
						endDate = 'January 22, 2016';
					}
					if (line[3] == 'Sem 2') {
						startDate = 'January 27, 2016';
						endDaylight = 'March 13, 2016';
						startDaylight = 'March 14, 2016';
						endDate = 'June 7, 2016';
					}
					if (line[3] == 'Qtr 3') {
						startDate = 'January 27, 2016';
						endDaylight = 'March 13, 2016';
						startDaylight = 'March 14, 2016';
						endDate = 'April 1, 2016';
					}
					if (line[3] == 'Qtr 4') {
						startDate = 'April 5, 2016';
						endDate = 'June 7, 2016';
					}
					if (line[4] == '1') {
						if (line[10].toString().indexOf("(A)") > -1) {
							startTime = '08:30:00';
							endTime = '09:12:00';
						} else if (line[10].toString().indexOf("(B)") > -1) {
							startTime = '09:14:00';
							endTime = '09:56:00';
						} else {
							startTime = '08:30:00';
							endTime = '09:56:00';
						}
					}
					if (line[4] == '2') {
						if (line[10].toString().indexOf("(A)") > -1) {
							startTime = '10:00:00';
							endTime = '10:30:00';
						} else if (line[10].toString().indexOf("(B)") > -1) {
							startTime = '10:34:00';
							endTime = '11:04:00';
						} else if (line[10].toString().indexOf("(C)") > -1) {
							startTime = '11:08:00';
							endTime = '11:38:00';
						} else {
							startTime = '10:00:00';
							endTime = '11:38:00';
						}
					}
					if (line[4] == '3') {
						if (line[10].toString().indexOf("(A)") > -1) {
							startTime = '12:12:00';
							endTime = '12:56:00';
						} else if (line[10].toString().indexOf("(B)") > -1) {
							startTime = '12:58:00';
							endTime = '13:42:00';
						} else {
							startTime = '12:12:00';
							endTime = '13:42:00';
						}
					}
					if (line[4] == '4') {
						if (line[10].toString().indexOf("(A)") > -1) {
							startTime = '13:46:00';
							endTime = '14:29:00';
						} else if (line[10].toString().indexOf("(B)") > -1) {
							startTime = '14:33:00';
							endTime = '15:16:00';
						} else {
							startTime = '13:46:00';
							endTime = '15:16:00';
						}
					}
					event.start(new Date(startDate + ' ' + startTime));
					event.end(new Date(startDate + ' ' + endTime));
					if (line[7]) {
						event.organizer({
							name: line[7].toString().capitalize().trim(),
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
							exdate: excludedDateTime(noSchool.dates, startTime)
						});
						
						// Copy event for DST switch
						var event2 = calendars[teacherNumber].createEvent({
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
							exdate: excludedDateTime(noSchool.dates, startTime)
						});
					}
					
					else {
						event.repeating({
							freq: 'WEEKLY',
							until: new Date(endDate + ' ' + endTime),
							byday: ['MO','TU','WE','TH','FR'],
							exdate: excludedDateTime(noSchool.dates, startTime)
						});
					}
				} else {
					console.log('invalid period or term: ' + line[0]);
				}
			}
			calendars[teacherNumber].save('teacherCalendars/' + teacherNumber + ' ' + name + '.ics');
		}, function (err) {
			if( err ) {
				console.log('A file failed to process');
			} else {
				console.log('All files have been processed successfully');
			}
		});
	});
});