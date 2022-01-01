const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./lr.lrcat');
const fs = require('fs')
const util = require('util');
const exec = util.promisify(require('child_process').exec);


const sourceDir = `${process.env.HOME}/Pictures/`;
const destDir = `${process.env.HOME}/Desktop/photos/`;


(async () => {
  console.log('running query...');

  const years = {};
  const results = [];

  db.each("SELECT i.rating, i.colorLabels, f.idx_filename, AgLibraryFolder.pathFromRoot from Adobe_images as i, AgLibraryFile as f, AgLibraryFolder WHERE i.rating is not null and f.id_local=i.rootFile and AgLibraryFolder.id_local=f.folder", function (err, data) {
    // console.log({ data, err });
    if (err) {
      console.error('ERROR', { err });
      return;
    }

    results.push(data);

  }, async () => {

    for (let i = 0; i < results.length; i++) {
      const data = results[i];
      // make the year and month folders
      const year = data.pathFromRoot.substring(0, 4);
      const month = data.pathFromRoot.substring(5, 7);
      const day = data.pathFromRoot.substring(8, 10);
      if (!years[year]) {
        fs.mkdirSync(`${destDir}${year}/print`, { recursive: true });
        years[year] = {};
      }

      if (typeof years[year][month] === 'undefined') {
        fs.mkdirSync(`${destDir}${year}/${month}/insta`, { recursive: true });
        years[year][month] = {};
      }

      if (typeof years[year][month][day] === 'undefined') {
        fs.mkdirSync(`${destDir}${year}/${month}/${day}/raw`, { recursive: true });
        years[year][month][day] = 0;
      }


      const srcFile = `${sourceDir}2021/${data.pathFromRoot}/${data.idx_filename}`;
      // ~/Desktop/photos/2021/09/raw/GL7A3641.CR2
      const rawFile = `${destDir}${year}/${month}/${day}/raw/${data.idx_filename}`;
      const fileName = `${year}_${month}_${day}_${`${years[year][month][day]}`.padStart(5, '0')}.jpg`
      // ~/Desktop/photos/2021/09/2021_09_00001.jpg
      const jpgFile = `${destDir}${year}/${month}/${day}/${fileName}`;
      const instaFile = `${destDir}${year}/${month}/insta/${fileName}`;
      const printFile = `${destDir}${year}/print/${fileName}`;
      years[year][month][day]++;

      // copy raw file
      if (!fs.existsSync(rawFile)) {
        console.log(`cp ${srcFile} -> ${rawFile}`);
        fs.copyFileSync(srcFile, rawFile);
      }

      // convert to jpg
      if (!fs.existsSync(jpgFile)) {
        const command = `sips -s format jpeg -s formatOptions 100 ${rawFile} --out ${jpgFile}`;
        console.log(command);
        const { stdout, stderr, error } = await exec(command);
        console.log(error, stdout, stderr);
      }

      if (data.rating === 5 && !fs.existsSync(instaFile)) {
        const { stdout, stderr, error } = await exec(`sips --resampleWidth 1600 ${jpgFile} --out ${instaFile}`);
        console.log(error, stdout, stderr);
      }

      if (data.rating === 5 && data.colorLabels === 'Red' && !fs.existsSync(printFile)) {
        fs.copyFileSync(jpgFile, printFile);
        // process.exit();
      }

    }
    console.log('all done');
    db.close();
  });
})();

