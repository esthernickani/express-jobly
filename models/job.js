"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, createSqlQueryForJob, getErrorMessage, getErrorMessageForJob } = require("../helpers/sql");

/*related functions for jobs*/

class Job {
     /** Create a company (from data), update db, return new company data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { title, salary, equity, company_handle }
   * */
    static async create({title, salary, equity, company_handle}) {
        const result = await db.query(
            `INSERT INTO jobs
             (title, salary, equity, company_handle)
             VALUES ($1, $2, $3, $4)
             RETURNING id, title, salary, equity, company_handle`,
          [
            title, 
            salary,
            equity,
            company_handle
          ],
      );
      
      const job = result.rows[0];
      return job;
    }

    
  /** Find all jobs
   *
   * Returns [{ title, salary, equity, company_handle }, ...]
   * */

  static async findAll(filter) {
    let sqlCondition = ''
    if (Object.keys(filter).length !== 0) {
      sqlCondition = createSqlQueryForJob(filter)
    } 
    const jobsRes = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           ${sqlCondition}`);

    if (jobsRes.rows.length === 0) {
        const errorMessage = getErrorMessageForJob(filter)
        throw new NotFoundError(`No jobs with ${errorMessage}`)
    };
    return jobsRes.rows;
  }

  
  /** Given a job id, return data about the job.
   *
   * Returns { title, salary, equity, company_handle }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = $1`,
        [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {salary, equity}
   *
   * Returns {title, equity, salary, company_handle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {});
    const idVarIdx = "$" + (values.length + 1);

    

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                title,
                                salary, 
                                equity, 
                                company_handle`;
    
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }

}

module.exports = Job