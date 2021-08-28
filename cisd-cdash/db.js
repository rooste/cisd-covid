const sqlite3 = require('sqlite3')
const sqlite = require('sqlite')


exports.db = {

    intialize: async function() {
        this.database = await sqlite.open({
            filename: 'database.db',
            driver: sqlite3.Database
        })
        console.log('database initialzed')

        this.createTable()
        console.log('created table')
    },

    
    database: null,
    TABLE: 'reports',
    CAMPUS: 'campus',
    GRADE: 'grade',
    CASES: 'cases',
    DATE: 'date',
    TIMESTAMP: 'timestamp',

    createTable: async function(){
        await this.database.exec(`CREATE TABLE IF NOT EXISTS ${this.TABLE} (${this.CAMPUS} TEXT, ${this.GRADE} TEXT, ${this.CASES} INT, ${this.DATE} TEXT, ${this.TIMESTAMP} LONG)`)
    },

    commitUpdate: async function(campus, grade, cases, date, timestamp){
        const sql = `INSERT INTO ${this.TABLE} (${this.CAMPUS}, ${this.GRADE}, ${this.CASES}, ${this.DATE}, ${this.TIMESTAMP}) VALUES (?, ?, ?, ?, ?)`
        const result = await this.database.run(sql, campus, grade, cases, date, timestamp);

    },

    commitIfNew: async function(campus, grade, cases, date, timestamp){
        const sql = `SELECT ${this.CASES} FROM ${this.TABLE} WHERE ${this.CAMPUS}='${campus}' AND ${this.GRADE}='${grade}' AND ${this.DATE}='${date}'`
        
        var count = 0;
        var results = []

        await this.database.each(sql, (err, data) => {
            if (err){
                console.log(`checkDuplicate error ${err}`)
            } else  {
                count++
                results.push(data[this.CASES])
            }
        })

        if (!results.includes(cases)){
            this.commitUpdate(campus, grade, cases, date, timestamp)
        }
    }

  }