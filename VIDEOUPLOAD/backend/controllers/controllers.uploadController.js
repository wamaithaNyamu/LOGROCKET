import multer from 'multer';
import firebase from 'firebase-admin';

const storage = multer.memoryStorage();
const upload = multer({
    storage,     
 }).array('files');

firebase.initializeApp({
    credential: firebase.credential.cert("./serviceAccountKey.json"),
    storageBucket: "logrocket-uploads.appspot.com"
});


export const uploadAttachment = async (req, res) => {
    try {
        upload(req, res, async function (err) {
            if (err) {
                console.error(err)
                res.status(403).send({
                    message: "Error uploading document."
                })
            }
            for (const file of req.files) {
                const bucket = firebase.storage().bucket();
                const newFile = bucket.file(file.originalname);
                await newFile.save(file.buffer);
            }
            res.json("Files uploaded successfully.");
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            message: "Something went wrong while uploading..."
        })
    }
}

export const getAllAttachments = async (req, res) => {
    try {
        const bucket = firebase.storage().bucket();
        const options = {
            action: 'read',
            expires: '01-01-2024'
        };
        const fileList = [];
        const [files] = await bucket.getFiles();
        for (const file of files) {
            const [url] = await file.getSignedUrl(options);
            fileList.push(url);
        }
        res.json(fileList);
    } catch (error) {
        console.log(error)
        res.status(500).send({
            message: "Something went wrong."
        })
    }
}