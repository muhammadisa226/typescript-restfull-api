import supertest from "supertest";
import { web } from "../src/application/web";
import { logger } from "../src/application/logging";
import { UserTest } from "./test-util";
import bcrypt from "bcrypt";
describe('POST "api/users', () => {
  afterEach(async () => {
    await UserTest.delete();
  });
  it("should reject register new user if request is invalid ", async () => {
    const response = await supertest(web).post("/api/users").send({
      username: "",
      password: "",
      name: "",
    });
    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });
  it("should  register new user ", async () => {
    const response = await supertest(web).post("/api/users").send({
      username: "muhammadisa226",
      password: "rahasia8",
      name: "Muhammad Isa",
    });
    logger.debug(response.body);
    console.log(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.username).toBe("muhammadisa226");
    expect(response.body.data.name).toBe("Muhammad Isa");
  });
});

describe('POST "api/users/login', () => {
  beforeEach(async () => {
    await UserTest.create();
  });
  afterEach(async () => {
    await UserTest.delete();
  });
  it("should login success", async () => {
    const response = await supertest(web).post("/api/users/login").send({
      username: "muhammadisa226",
      password: "muhammadisa226",
    });
    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
  });
});

describe("get api users current ", () => {
  beforeEach(async () => {
    await UserTest.create();
  });
  afterEach(async () => {
    await UserTest.delete();
  });
  it("should get user ", async () => {
    const response = await supertest(web)
      .get("/api/users/current")
      .set("X-API-TOKEN", "test");
    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
  });
});
describe("PATCH /api/users/current", () => {
  beforeEach(async () => {
    await UserTest.create();
  });

  afterEach(async () => {
    await UserTest.delete();
  });

  it("should reject update user if request is invalid", async () => {
    const response = await supertest(web)
      .patch("/api/users/current")
      .set("X-API-TOKEN", "test")
      .send({
        password: "",
        name: "",
      });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it("should reject update user if token is wrong", async () => {
    const response = await supertest(web)
      .patch("/api/users/current")
      .set("X-API-TOKEN", "salah")
      .send({
        password: "benar",
        name: "benar",
      });

    logger.debug(response.body);
    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });

  it("should be able to update user name", async () => {
    const response = await supertest(web)
      .patch("/api/users/current")
      .set("X-API-TOKEN", "test")
      .send({
        name: "benar",
      });

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe("benar");
  });

  it("should be able to update user password", async () => {
    const response = await supertest(web)
      .patch("/api/users/current")
      .set("X-API-TOKEN", "test")
      .send({
        password: "benar123",
      });

    logger.debug(response.body);
    expect(response.status).toBe(200);

    const user = await UserTest.get();
    expect(await bcrypt.compare("benar123", user.password)).toBe(true);
  });
});

describe("DELETE /api/users/current", () => {
  beforeEach(async () => {
    await UserTest.create();
  });

  afterEach(async () => {
    await UserTest.delete();
  });

  it("should be able to logout", async () => {
    const response = await supertest(web)
      .delete("/api/users/current")
      .set("X-API-TOKEN", "test");

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data).toBe("OK");

    const user = await UserTest.get();
    expect(user.token).toBeNull();
  });

  it("should reject logout user if token is wrong", async () => {
    const response = await supertest(web)
      .delete("/api/users/current")
      .set("X-API-TOKEN", "salah");

    logger.debug(response.body);
    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });
});
