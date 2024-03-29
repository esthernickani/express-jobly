"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Job = require("../models/job")
const Company = require("../models/company");
const { createToken } = require("../helpers/tokens");

let testJobIds = []
async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");

  await Company.create(
      {
        handle: "c1",
        name: "C1",
        numEmployees: 1,
        description: "Desc1",
        logoUrl: "http://c1.img",
      });
  await Company.create(
      {
        handle: "c2",
        name: "C2",
        numEmployees: 2,
        description: "Desc2",
        logoUrl: "http://c2.img",
      });
  await Company.create(
      {
        handle: "c3",
        name: "C3",
        numEmployees: 3,
        description: "Desc3",
        logoUrl: "http://c3.img",
      });

  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: false,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
  });

  testJobIds[0] = (await Job.create(
    { title: "testjob1", salary: 100000, equity: "0.1", company_handle: "c1" })).id;

  testJobIds[1] = (await Job.create(
    { title: "testjob2", salary: 5000, equity: "0", company_handle: "c1" })).id;

  testJobIds[2] = (await Job.create(
    { title: "testjob3", salary: 356000, equity: "0.5", company_handle: "c1" })).id;

    await User.applyForJob("u3", testJobIds[0])
    await User.applyForJob("u3", testJobIds[1])
  }

 

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


const u1Token = createToken({ username: "u1", isAdmin: false });
const u3Token = createToken({ username: "u3", isAdmin: false });
const adminToken = createToken({ username: 'admin', isAdmin: true})

console.log(testJobIds)

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u3Token,
  adminToken,
  testJobIds
};
