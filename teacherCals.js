var fs = require('fs'),
	ical = require('ical-generator'),
	parse = require('csv-parse'),
	async = require('async'),
	noSchool = require('./variables/no-school.json'),
	partialDays = require('./variables/partial-days.json'),
	columns = require('./variables/columns.json'),
	year = require('./variables/year.json'),
	periods = require('./variables/periods.json'),
	splits = require('./variables/splits.json'),
	teacherEmailAddresses = require('./variables/teacher-email-addresses.json'),
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

// Function checks if a DST change occurs between two dates.
function dstCheck(start,end) {
	var dstEndDate = new Date(year.dst.end),
		dstStartDate = new Date(year.dst.start),
		startDate = new Date(start),
		endDate = new Date(end);
	if ((startDate < dstEndDate && endDate > dstEndDate) && (startDate < dstStartDate && endDate > dstStartDate)) {
		return 'both'
	} else if (startDate < dstEndDate && endDate > dstEndDate) {
		return 'end';
	} else if (startDate < dstStartDate && endDate > dstStartDate) {
		return 'start'
	} else {
		return null;
	}
}

// Function adds one day to a Date object
function addDay(date) { 
	var nextDay = new Date(date);
	nextDay.setDate(date.getDate()+1);
	return nextDay;
}

// Export 'Course Data List'->'Course Sections Export' from JMC to './SectionList.csv'
fs.readFile(__dirname + '/schedules/teachers.csv', function (err, data) {
  if (err) {
    throw err; 
  }
	parse(data.toString(), function (err, output) {
		var calendars = new Array();
		
		output.splice(0,1); // Remove first, header row
		
		async.each(output, function (line) {
			var event,
				teacherNumber = line[columns.teachers.teacherNumber].toString().trim(),
				teacherName = line[columns.teachers.teacherName].toString().capitalize().trim(),
				courseName = line[columns.teachers.courseName].toString().trim(),
				courseNumber = line[columns.teachers.courseNumber].toString().trim(),
				sectionNumber = line[columns.teachers.sectionNumber].toString().trim(),
				period = line[columns.teachers.period].toString().trim(),
				term = line[columns.teachers.term].toString().replace(/ /g,'').toLowerCase(),
				roomName = line[columns.teachers.roomName].toString().capitalize().trim();
			
			if (!calendars[teacherNumber]) {
			  calendars[teacherNumber] = ical({
					domain: 'springgrove.k12.mn.us',
					prodId: {company: 'SGHS', product: 'sghs-ical'},
					teacherName: teacherName + '\'s Calendar',
					timezone: 'America/Chicago',
					// Lunch - 3 events, because DST
					events: [{
						start: new Date(year.year.start + ' ' + periods.lunch.start),
						end: new Date(year.year.start + ' ' + periods.lunch.end),
						timestamp: new Date(),
						summary: 'Lunch',
						location: 'Lunch Room',
						organizer: {
							name: 'Teacher',
							email: 'teacher@example.com'
						},
						repeating: {
							freq: 'WEEKLY',
							until: new Date(year.dst.end + ' ' + periods.lunch.end),
							byday: ['MO','TU','WE','TH','FR'],
							exdate: excludedDateTime(noSchool.dates, periods.lunch.start),
							exrule: {
								freq: 'WEEKLY',
								byday: ['SU','SA']
							}
						}
					},{
						start: addDay(new Date(year.dst.end + ' ' + periods.lunch.start)),
						end: addDay(new Date(year.dst.end + ' ' + periods.lunch.end)),
						timestamp: new Date(),
						summary: 'Lunch',
						location: 'Lunch Room',
						organizer: {
							name: 'Teacher',
							email: 'teacher@example.com'
						},
						repeating: {
							freq: 'WEEKLY',
							until: new Date(year.dst.start + ' ' + periods.lunch.end),
							byday: ['MO','TU','WE','TH','FR'],
							exdate: excludedDateTime(noSchool.dates, periods.lunch.start),
							exrule: {
								freq: 'WEEKLY',
								byday: ['SU','SA']
							}
						}
					},{
						start: addDay(new Date(year.dst.start + ' ' + periods.lunch.start)),
						end: addDay(new Date(year.dst.start + ' ' + periods.lunch.end)),
						timestamp: new Date(),
						summary: 'Lunch',
						location: 'Lunch Room',
						organizer: {
							name: 'Teacher',
							email: 'teacher@example.com'
						},
						repeating: {
							freq: 'WEEKLY',
							until: new Date(year.year.end + ' ' + periods.lunch.end),
							byday: ['MO','TU','WE','TH','FR'],
							exdate: excludedDateTime(noSchool.dates, periods.lunch.start),
							exrule: {
								freq: 'WEEKLY',
								byday: ['SU','SA']
							}
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
			
			if (courseName) {
				if (periods[period] && year[term]) {
					event = calendars[teacherNumber].createEvent({
						timestamp: new Date(),
						summary: courseName,
						location: roomName
					});
					
					var startDate, endDate, startTime, endTime, dst;
					
					startDate = year[term].start;
					endDate = year[term].end;
					
					dst = dstCheck(startDate,endDate);
					
					if (splits[courseNumber]) {
						var split;
						if (split = splits[courseNumber][sectionNumber]) {
							startTime = periods[period].splits[split].start;
							endTime = periods[period].splits[split].end;
						}
					} else {
						startTime = periods[period].start;
						endTime = periods[period].end;
					}
					
					event.start(new Date(startDate + ' ' + startTime));
					event.end(new Date(startDate + ' ' + endTime));
					
					if (teacherName) {
						event.organizer({
							name: teacherName,
							email: 'teacher@example.com'
						});
					} else {
						event.organizer({
							name: 'Teacher',
							email: 'teacher@example.com'
						});
					}
					
					if (dst) { // Start DST
						var eventEnd, event2StartStart, event2StartEnd, event2End, event3StartStart, event3StartEnd;
						if (dst == 'both') {
							eventEnd = new Date(year.dst.end + ' ' + endTime);
							event2StartStart = addDay(new Date(year.dst.end + ' ' + startTime));
							event2StartEnd = addDay(new Date(year.dst.end + ' ' + endTime));
							event2End = new Date(year.dst.start + ' ' + endTime);
							event3StartStart = addDay(new Date(year.dst.start + ' ' + startTime));
							event3StartEnd = addDay(new Date(year.dst.start + ' ' + endTime));
						} else if (dst == 'end') {
							eventEnd = new Date(year.dst.end + ' ' + endTime);
							event2StartStart = addDay(new Date(year.dst.end + ' ' + startTime));
							event2StartEnd = addDay(new Date(year.dst.end + ' ' + endTime));
						} else if (dst == 'start') {
							eventEnd = new Date(year.dst.start + ' ' + endTime);
							event2StartStart = addDay(new Date(year.dst.start + ' ' + startTime));
							event2StartEnd = addDay(new Date(year.dst.start + ' ' + endTime));
						}
						
						event.repeating({
							freq: 'WEEKLY',
							until: eventEnd,
							byday: ['MO','TU','WE','TH','FR'],
							exdate: excludedDateTime(noSchool.dates, startTime),
							exrule: {
								freq: 'WEEKLY',
								byday: ['SU','SA']
							}
						});
						
						if (event2End) {
							var event2 = calendars[teacherNumber].createEvent({
								timestamp: event.timestamp(),
								summary: event.summary(),
								location: event.location(),
								organizer: event.organizer()
							});
							event2.start(event2StartStart);
							event2.end(event2StartEnd);
							event2.repeating({
								freq: 'WEEKLY',
								until: event2End,
								byday: ['MO','TU','WE','TH','FR'],
								exdate: excludedDateTime(noSchool.dates, startTime),
								exrule: {
									freq: 'WEEKLY',
									byday: ['SU','SA']
								}
							});
							
							var event3 = calendars[teacherNumber].createEvent({
								timestamp: event.timestamp(),
								summary: event.summary(),
								location: event.location(),
								organizer: event.organizer()
							});
							event3.start(event3StartStart);
							event3.end(event3StartEnd);
							event3.repeating({
								freq: 'WEEKLY',
								until: new Date(endDate + ' ' + endTime),
								byday: ['MO','TU','WE','TH','FR'],
								exdate: excludedDateTime(noSchool.dates, startTime),
								exrule: {
									freq: 'WEEKLY',
									byday: ['SU','SA']
								}
							});
						} else {
							var event2 = calendars[teacherNumber].createEvent({
								timestamp: event.timestamp(),
								summary: event.summary(),
								location: event.location(),
								organizer: event.organizer()
							});
							event2.start(event2StartStart);
							event2.end(event2StartEnd);
							event2.repeating({
								freq: 'WEEKLY',
								until: new Date(endDate + ' ' + endTime),
								byday: ['MO','TU','WE','TH','FR'],
								exdate: excludedDateTime(noSchool.dates, startTime),
								exrule: {
									freq: 'WEEKLY',
									byday: ['SU','SA']
								}
							});
						}
					} // End DST
					
					else {
						event.repeating({
							freq: 'WEEKLY',
							until: new Date(endDate + ' ' + endTime),
							byday: ['MO','TU','WE','TH','FR'],
							exdate: excludedDateTime(noSchool.dates, startTime),
							exrule: {
								freq: 'WEEKLY',
								byday: ['SU','SA']
							}
						});
					}
				} else {
					console.log('invalid period or term, teacher ' + teacherNumber);
				}
			} else {
				console.log('invalid course name, teacher ' + teacherNumber);
			}
			calendars[teacherNumber].save('teacherCalendars/' + teacherNumber + ' ' + teacherName + '.ics', function(err) {
				if( err ) {
					console.log('failed to save teacherCalendars/' + teacherNumber + ' ' + teacherName + '.ics');
				}
			});
		}, function (err) {
			if( err ) {
				console.log('A file failed to process');
			} else {
				console.log('All files have been processed successfully');
			}
		});
	});
});