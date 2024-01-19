const { sqlForPartialUpdate, createSqlQueryForCompany } = require('./sql.js')


let correctCompanyData = {
    "name" : "testcompany",
    "description": "Test company description",
    "numEmployees": 23,
    "logoUrl": null
}


describe("test that sqlForPartialUpdate appropriately changes data to right syntax for SQL query", function() {
    test("works", function() {
        let sqlColsAndVals = sqlForPartialUpdate(correctCompanyData, {
            numEmployees: "num_employees",
            logoUrl: "logo_url",
          })

        expect(sqlColsAndVals).toEqual({
            setCols: '"name"=$1, "description"=$2, "num_employees"=$3, "logo_url"=$4',
            values: [ 'testcompany', 'Test company description', 23, null ]
          })
    })
})

describe("test that error is thrown with empty data", function() {
    test("throws error", () => {
        expect (() => {
            sqlForPartialUpdate({}, {
                numEmployees: "num_employees",
                logoUrl: "logo_url",
              }).toThrow()
        })
    })
})

describe("gets appropriate SQL query for filter", function() {
    test("works", function() {
        let filter = { name: 'c2', minEmployees: '1', maxEmployees: '9' }
        let filterSQLquery = createSqlQueryForCompany(filter)

        expect(filterSQLquery).toEqual("WHERE LOWER(name) LIKE LOWER('%c2%') AND num_employees > 1 AND num_employees < 9")
    })
})

describe("throws error if minimum employees are greater than maximum employees", function() {
    test("works", function() {
        let filter = { name: 'c2', minEmployees: '100', maxEmployees: '9' }
        expect (() => {
            createSqlQueryForCompany(filter).toThrow()
        })
    })
})