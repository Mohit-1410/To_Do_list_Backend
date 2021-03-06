const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/tasks',auth, async (req, res) => {
    // const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    // console.log(task)
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

// router.get('/tasks', async (req, res) => {
//     try {
//         const tasks = await Task.find({})
//         res.send(tasks)
//     } catch (e) {
//         res.status(500).send()
//     }
// })
// router.get('/tasks', auth, async (req, res) => {
//     try {
//         // const tasks = await Task.find({})

//         const tasks = await Task.find({owner: req.user._id})
//         // Alternative Method
//         // await req.user.populate('tasks').execPopulate()
//         res.send(req.user.tasks)
//         //res.send(tasks)
//     } catch (e) {
//         res.status(500).send()
//     }
// })
// GET /tasks?completed=true or false
// router.get('/tasks', auth, async (req, res) => {
//     try {
//         await req.user.populate({
//             path: 'tasks',
//             match: {
//                 completed: true
//             }    
//     }).execPopulate()
//         res.send(req.user.tasks)
//     } catch (e) {
//         res.status(500).send()
//     }
// })
// router.get('/tasks', auth, async (req, res) => {
//     const match = {}
//     if(req.query.completed) {
//         match.completed = req.query.completed === 'true'
//     }
//     try {
//         // await req.user.populate({
//         //     path: 'tasks',
//         //     match: {
//         //         completed: false
//         //     }  
//         await req.user.populate({
//             path: 'tasks',
//             match
//     }).execPopulate()
//         res.send(req.user.tasks)
//     } catch (e) {
//         res.status(500).send()
//     }
// })

// GET  /tasks?limit=10&skip=20(skip first 20)
// router.get('/tasks', auth, async (req, res) => {
//     const match = {}
//     if(req.query.completed) {
//         match.completed = req.query.completed === 'true'
//     }
//     try {
//         // await req.user.populate({
//         //     path: 'tasks',
//         //     match: {
//         //         completed: false
//         //     }  
//         await req.user.populate({
//             path: 'tasks',
//             match,
//             options:{
//                 // limit: 2
//                 limit: parseInt(req.query.limit),
//                 skip: parseInt(req.query.skip),
//                 sort: {
//                     createdAt: 1 //ascending is 1, descending is -1
//                 },
 

//             }
//     }).execPopulate()
//         res.send(req.user.tasks)
//     } catch (e) {
//         res.status(500).send()
//     }
// })



// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}
    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
        // parts[0] is the name of the property, 
        // parts[1] is equal to asc or desc, -1 will be set or 1 will be set
    }

    try { 
        await req.user.populate({
            path: 'tasks',
            match,
            options:{
               //limit: 2
               limit: parseInt(req.query.limit),
               skip: parseInt(req.query.skip),
            //    sort: {
            //        //createdAt: -1 //ascending is 1, descending is -1
            //        completed: 1
            //    },
               sort,
            }
    }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }
})

// router.get('/tasks/:id', async (req, res) => {
//     const _id = req.params.id

//     try {
//         const task = await Task.findById(_id)

//         if (!task) {
//             return res.status(404).send()
//         }

//         res.send(task)
//     } catch (e) {
//         res.status(500).send()
//     }
// })
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        // const task = await Task.findById(_id)
        const task = await Task.findOne({
            _id,
            owner: req.user._id
        })
        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

// router.patch('/tasks/:id', async (req, res) => {
//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['description', 'completed']
//     const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

//     if (!isValidOperation) {
//         return res.status(400).send({ error: 'Invalid updates!' })
//     }

//     try {
//         const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

//         if (!task) {
//             return res.status(404).send()
//         }

//         res.send(task)
//     } catch (e) {
//         res.status(400).send(e)
//     }
// })

router.patch('/tasks/:id', auth,  async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({
            error: 'Invalid updates!'
        })
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id})
        // const task = await Task.findById(req.params.id)

        // updates.forEach((update) => task[update] = req.body[update])
        // await task.save()
        if (!task) {
            return res.status(404).send()
        }
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()

        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

// router.patch('/tasks/:id', async (req, res) => {
//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['description', 'completed']
//     const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

//     if (!isValidOperation) {
//         return res.status(400).send({ error: 'Invalid updates!' })
//     }

//     try {
//         const task = await Task.findById(req.params.id)

//         updates.forEach((update) => task[update] = req.body[update])
//         await task.save()

//         if (!task) {
//             return res.status(404).send()
//         }

//         res.send(task)
//     } catch (e) {
//         res.status(400).send(e)
//     }
// })

router.delete('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id)

        if (!task) {
            res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router
