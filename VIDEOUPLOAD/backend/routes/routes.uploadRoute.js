import express from 'express'

import {
    uploadAttachment,
    getAllAttachments
} from "../controllers/controllers.uploadController.js"


const router = express.Router()

router.route('/').post(uploadAttachment)

router.route('/').get(getAllAttachments)

export default router