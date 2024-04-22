const fs = require('fs');
const { join, extname } = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Папки з сорс і аутпут файлами
const SOURCE_PATH = './source';
const OUTPUT_PATH = './output';

// Назва файлів, плейлиста, папки (потрібно змінити на актуальну!!!)
// приклад - how-to-invest-hls
const OUTPUT_VIDEO_PATH = '';


fs.readdir(SOURCE_PATH, (err, files) => {
    if (err) {
        console.error(`Error reading SOURCE_PATH: ${err}`);
        process.exit(1);
    }
    const videos = files.filter(file => extname(file).toLowerCase() === '.mp4');

    let processedVideos = 0;
    const totalVideos = videos.length;

    videos
        .forEach(file => {
            const fileIndex = Number(file.split('.').shift());
            const outputPath = join(OUTPUT_PATH, `${OUTPUT_VIDEO_PATH}-${fileIndex}`);

            if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath);

            ffmpeg(join(SOURCE_PATH, file), { timeout: 432000 })
                .addOptions([
                    '-profile:v baseline',
                    '-level 3.0',
                    '-start_number 0',
                    '-hls_time 10',
                    '-hls_list_size 0',
                    '-f hls',
                    '-c:a aac',
                ])
                .output(join(outputPath, `${OUTPUT_VIDEO_PATH}-${fileIndex}-.m3u8`))
                .on('end', () => {
                    const playListOldName = join(outputPath, `${OUTPUT_VIDEO_PATH}-${fileIndex}-.m3u8`);
                    const playListNewName = playListOldName.split('.').join('playlist.');

                    fs.renameSync(playListOldName, playListNewName);
                    console.log(`File ${OUTPUT_VIDEO_PATH}-${fileIndex} converted!!!`);

                    processedVideos++;

                    if (processedVideos === totalVideos) {
                        console.log('All videos converted');

                        process.exit(0);
                    }
                })
                .run();
        });
})

