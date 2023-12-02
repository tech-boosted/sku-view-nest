import zlib from 'zlib';
import axios from 'axios';
import * as stream from 'stream';
import { promisify } from 'util';
import { createReadStream, createWriteStream } from 'fs';

const finished = promisify(stream.finished);

interface downloadAndExtractReportProps {
  fileUrl: string;
  download_path_zip: string;
  download_path_json: string;
}

export const downloadAndExtractReport = async ({
  fileUrl,
  download_path_zip,
  download_path_json,
}: downloadAndExtractReportProps) => {
  const writer = createWriteStream(download_path_zip);
  let result: any = {};
  result = await axios({
    method: 'get',
    url: fileUrl,
    responseType: 'stream',
  })
    .then(async (response) => {
      response.data.pipe(writer);
      await finished(writer).then(() => {
        console.log('Download completed');
        const gunzip = zlib.createGunzip();
        const rstream = createReadStream(download_path_zip);
        const wstream = createWriteStream(download_path_json);
        rstream.pipe(gunzip).pipe(wstream);
        console.log('writing');
        wstream.on('finish', async () => {
          console.log('Completed writing');
          return {
            status: true,
            message: 'File downloaded and extracted',
          };
        });
      });
    })
    .catch((err) => {
      return {
        status: false,
        message: 'Download failed: ' + err?.data,
      };
    });
  return result;
};
