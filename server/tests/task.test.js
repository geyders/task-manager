const request = require('supertest');
const mongoose = require('mongoose');

const app = require('../src/app');
const Task = require('../src/models/Task');

describe('Task API', () => {
  beforeAll(async () => {
    const mongoUrl =
      process.env.MONGO_TEST_URL ||
      'mongodb://localhost:27017/task_manager_test';

    await mongoose.connect(mongoUrl);
  });

  afterEach(async () => {
    await Task.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('GET /health should return 200', async () => {
    const response = await request(app).get('/health');

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  test('POST /api/tasks should create a task', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Вивчити Docker',
        description: 'Підготувати лабораторну роботу',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe('Вивчити Docker');
    expect(response.body.status).toBe('pending');
  });

  test('POST /api/tasks should return 400 without title', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({
        description: 'Без назви',
      });

    expect(response.statusCode).toBe(400);
  });

  test('GET /api/tasks should return tasks', async () => {
    await Task.create({
      title: 'Перше завдання',
    });

    const response = await request(app).get('/api/tasks');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe('Перше завдання');
  });
});