"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");

const Job = require("./job");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  jobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: 'testjob', 
    salary: 10000, 
    equity: "0", 
    company_handle: "c1"
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({id: expect.any(Number),
                        ...newJob});

  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter for jobs", async function () {
    const filter = {}
    let jobs = await Job.findAll(filter);
    expect(jobs).toEqual([
        {
          id: expect.any(Number),
          title: 'j1', 
          salary: 10000, 
          equity: "0", 
          company_handle: "c1"
        },
        {
          id: expect.any(Number),
          title: 'j2', 
          salary: 25000, 
          equity: "0.2", 
          company_handle: "c1"
        },
        {
          id: expect.any(Number),
          title: 'j3', 
          salary: 35000, 
          equity: "0.1", 
          company_handle: "c1"
        }
    ]);
  });
});

describe("findAll jobs with equity", function () {
  test("works: filter for jobs with equity = true", async function () {
    const filter = {
      "equity": true
    }
    let jobs = await Job.findAll(filter);
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: 'j2', 
        salary: 25000, 
        equity: "0.2", 
        company_handle: "c1"
      },
      {
        id: expect.any(Number),
        title: 'j3', 
        salary: 35000, 
        equity: "0.1", 
        company_handle: "c1"
      }
    ]);
  });
});

describe("findAll jobs", function () {
  test("works: filter for jobs", async function () {
    const filter = { title: 'j1', equity: false}
    let jobs = await Job.findAll(filter);
    expect(jobs).toEqual([
      { 
          id: expect.any(Number),
          title: 'j1', 
          salary: 10000, 
          equity: "0", 
          company_handle: "c1"
      }
    ]);
  });
});

describe("findAll", function () {
  test("throws error if condition not met", async function () {
    const filter = { title: 'j3', equity: false }
    try {
      await Job.findAll(filter);
    } catch (err) {
      console.log(err)
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(jobIds[0]);
    expect(job).toEqual({
        id: jobIds[0],
        title: expect.any(String), 
        salary: expect.any(Number), 
        equity: expect.any(String), 
        company_handle: "c1"
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateJobData = {
    salary: 100000,
    equity: "0.5"
  };

  test("works", async function () {
    let job = await Job.update(jobIds[0], updateJobData);
    expect(job).toEqual({
      id: expect.any(Number),
      title: expect.any(String),
      company_handle: "c1",
        ...updateJobData,
    });
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
        salary: null,
        equity: null
    };

    let job = await Job.update(jobIds[1], updateDataSetNulls);
    expect(job).toEqual({
        id: expect.any(Number),
        title: expect.any(String),
        company_handle: "c1",
          ...updateDataSetNulls,
    });


  });

  test("not found if no such job", async function () {
    const updateJobData = {
        salary: 100000,
        equity: "0.5"
      };
    try {
      await Job.update(0, updateJobData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(jobIds[0], {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});
/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    let jobId = jobIds[1]
    await Job.remove(jobId);
    const deleteJobRes = await db.query(
        `SELECT id FROM jobs WHERE id=${jobId}`);
    expect(deleteJobRes.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
