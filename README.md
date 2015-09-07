# sghs-ical
Generates .ics files from exported JMC data.

## Source files
The script expects two, particular .csv exports from JMC by default.

### Students
1. Navigate to **Schedules** -> **Student** -> **Reference Cards**
2. Select **Year** under *Select Term*, and click **Export**
3. Rename this file `students.csv` and place it in the `schedules` folder

### Teachers
1. Navigate to **Schedules** -> **Course** -> **Course Data List**
2. Select **Course Schedule Info**, and click **Create Sections Export**
3. Rename this file `teachers.csv` and place it in the `schedules` folder

If you decide to use alternative .csv files, update `variables/columns.json` to ensure the generator scripts grab data from appropriate columns.

## Generating calendars
There are two scripts: `studentCals.js` and `teacherCals.js`. Running these scripts will generate calendars inside the `studentCalendars` and `teacherCalendars` folders respectively.

The scripts require you have [Node.js](https://nodejs.org) installed.

They can be run from the command line like so:

`node studentCals.js`

`node teacherCals.ja`