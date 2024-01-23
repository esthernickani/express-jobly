const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  //get keys from the dataToUpdate object, if no keys, throw error
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  //change keys into a syntax sql can understand
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

function createSqlQueryForCompany(filter) {
  const filterParams = Object.keys(filter)

  //check if minemployees and maxemployees and if so that the values are appropiate, if not throw error
  if (filterParams.includes('minEmployees') && filterParams.includes('maxEmployees')) {
    if (filter['minEmployees'] > filter['maxEmployees']) {
      throw new BadRequestError("Minumum employees cannot be greater than maximum employees")
    }
  }

  //get clauses for SQL query for the filters that were put in
  const indivWhereClause = filterParams.map(filterParam => {
    if (filterParam === 'name') {
      return `LOWER(name) LIKE LOWER('%${filter[filterParam]}%')`
    } else if (filterParam === 'minEmployees') {
      return `num_employees > ${filter[filterParam]}`
    } else if (filterParam === 'maxEmployees') {
      return `num_employees < ${filter[filterParam]}`
    }
  })

  //join clauses and add WHERE statement
  return `WHERE ${indivWhereClause.join(' AND ')}`
}

function createSqlQueryForJob(filter) {
  const filterParams = Object.keys(filter)
  //get clauses for SQL query for the filters that were put in
  const indivWhereClause = filterParams.map(filterParam => {
    if (filterParam === 'title') {
      return `LOWER(title) LIKE LOWER('%${filter[filterParam]}%')`
    } else if (filterParam === 'minSalary') {
      return `salary > ${filter[filterParam]}`
    } else if (filterParam === 'equity') {
      if (filter[filterParam] === true) {
        return `equity > 0`
      } else if (filter[filterParam] === false) {
        return "";
      }
    }
    return ""
  })
 
  const queryForSql = indivWhereClause.filter(clause => {
    return clause 
  })

   //join clauses and add WHERE statement
   
    console.log(`WHERE ${queryForSql.join(' AND ')}`)
  return `WHERE ${queryForSql.join(' AND ')}`
   
}


const getErrorMessage = filter => {
  //get error message when parameters cant be met from req.query
  const filterParams = Object.keys(filter)

  const errorMessage = filterParams.map(filterParam => {
    if (filterParam === 'name') {
      return `name including ${filter[filterParam]}`
    } else if (filterParam === 'minEmployees') {
      return `minimum employees = ${filter[filterParam]}`
    } else if (filterParam === 'maxEmployees') {
      return `maximum employees = ${filter[filterParam]}`
    }
  })
  
  return `${errorMessage.join(' and ')}`
}

const getErrorMessageForJob = filter => {
  //get error message when parameters cant be met from req.query
  const filterParams = Object.keys(filter)
  console.log("params----------->",filterParams)
  const errorMessage = filterParams.map(filterParam => {
      if (filterParam === 'title') {
        return `title including ${filter[filterParam]}`
      } else if (filterParam === 'minSalary') {
        return `minimum salary = ${filter[filterParam]}`
      } else if (filterParam === 'equity') {
        console.log('a')
        return filter['equity'] ? 'no equity' : 'with equity'
      }
  })
  console.log(errorMessage)
  return `${errorMessage.join(' and ')}`
}



module.exports = { sqlForPartialUpdate, 
                  createSqlQueryForCompany, 
                  createSqlQueryForJob,
                  getErrorMessage, 
                  getErrorMessageForJob 
                };
