const express = require('express');
const Task = require('../models/Task');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      message: 'Не вдалося отримати завдання',
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: 'Назва завдання є обовʼязковою',
      });
    }

    const task = await Task.create({
      title,
      description,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({
      message: 'Не вдалося створити завдання',
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { status, title, description } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!task) {
      return res.status(404).json({
        message: 'Завдання не знайдено',
      });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({
      message: 'Не вдалося оновити завдання',
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: 'Завдання не знайдено',
      });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      message: 'Не вдалося видалити завдання',
    });
  }
});

module.exports = router;