import multer from 'multer';
import firebase from 'firebase-admin';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';


const videoFilter = (req, file, cb) => {
    // Accept video files only
    if (!file.originalname.match(/\.(mp4|avi|mkv)$/)) {
        return cb(new Error('Only video files are allowed!'), false);
    }
    cb(null, true);
};


const upload = multer({
    fileFilter: videoFilter,
    storage: multer.memoryStorage(),
}).single('files');

firebase.initializeApp({
    credential: firebase.credential.cert("./serviceAccountKey.json"),
    storageBucket: "logrocket-uploads.appspot.com"
});

const checkFileSize = async (filePath) => {

    const stats = fs.statSync(filePath);
    const fileSizeInBytes = stats.size;
    console.log(`Video file size: ${fileSizeInBytes} bytes`);
    return fileSizeInBytes;
}

export const uploadAttachment = async (req, res) => {
    try {
        upload(req, res, async function (err) {
            if (err) {
                console.error(err)
                res.status(403).send({
                    message: "Error uploading document. Make sure it is a video file."
                })
            } else {

                const inputBuffer = req.file.buffer;

                //save buffer to file
                const inputFileExtension = path.extname(req.file.originalname);
                const inputFile = `input${inputFileExtension}`;
                console.log("Saving file to disk...", inputFile);

                fs.writeFileSync(inputFile, inputBuffer);
                console.log("File saved to disk.");

                console.log(`Checking input filesize in bytes`);
                await checkFileSize(inputFile);

                ffmpeg(inputFile)
                    .output(req.file.originalname)
                    .videoCodec("libx264")
                    .audioCodec('aac')
                    .videoBitrate(`1k`)
                    .autopad()
                    .on("end", async function () {
                        console.log("Video compression complete!");

                        const bucket = firebase.storage().bucket();
                        const newFile = bucket.file(req.file.originalname);
                        await newFile.save(`./${req.file.originalname}`);

                        console.log(`Checking output filesize in bytes`);
                        await checkFileSize(`./${req.file.originalname}`);

                        fs.unlinkSync(inputFile);
                        fs.unlinkSync(req.file.originalname)
                        res.json("Files uploaded successfully.");
                    })
                    .run();
            }
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